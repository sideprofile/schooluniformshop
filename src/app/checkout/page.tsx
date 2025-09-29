"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type LineItem = {
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

const SHIPPING_FEE = 250;

export default function CheckoutPage() {
  const router = useRouter();
  const [items, setItems] = useState<LineItem[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("uniformCheckoutItems");
      const parsed = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed) && parsed.length > 0) setItems(parsed);
    } catch {}
  }, []);

  const subtotal = useMemo(() => items.reduce((sum, i) => sum + (i.lineTotal || i.unitPrice * i.quantity), 0), [items]);
  const total = useMemo(() => subtotal + SHIPPING_FEE, [subtotal]);

  const validatePkPhone = (v: string) => {
    // Accept formats like 03XXXXXXXXX or +923XXXXXXXXX; allow spaces/dashes
    const cleaned = v.replace(/\s|-/g, "");
    return /^(\+92|0)3\d{9}$/.test(cleaned);
  };

  const handleConfirm = async () => {
    if (!name.trim() || !address.trim() || !validatePkPhone(phone) || items.length === 0) {
      toast.error("Please fill name, valid Pakistani phone number, address, and add items to proceed.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/send-order-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: { name: name.trim(), phone: phone.trim(), address: address.trim() },
          items,
          pricing: { subtotal, shipping: SHIPPING_FEE, total },
        }),
      });
      const payload = await res.json().catch(() => ({} as any));
      if (!res.ok) {
        const combined = payload?.hint ? `${payload?.error || "Failed to place order"}\n${payload.hint}` : (payload?.error || "Failed to place order");
        throw new Error(combined);
      }
      // Clear local temp cart and show success UI
      try { localStorage.removeItem("uniformCheckoutItems"); } catch {}
      setSuccess(true);
      toast.success("Order placed successfully!");
    } catch (e: any) {
      toast.error(e?.message || "Failed to place order");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Order placed successfully!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-muted-foreground">Thank you, {name}. We have received your order.</p>
            <p className="text-sm">Delivery charges: Rs. {SHIPPING_FEE.toLocaleString()}</p>
            <p className="text-sm">Estimated delivery: 3 to 4 business days.</p>
          </CardContent>
          <CardFooter className="flex gap-3">
            <Button onClick={() => router.push("/")}>Back to home</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="py-8 grid gap-6 md:grid-cols-[2fr_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Checkout</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Full name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your full name" />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Phone (Pakistan)</label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="03XXXXXXXXX or +923XXXXXXXXX" />
            {!phone ? null : (
              <span className={`text-xs ${validatePkPhone(phone) ? "text-emerald-600" : "text-destructive"}`}>
                {validatePkPhone(phone) ? "Valid phone" : "Invalid Pakistani phone format"}
              </span>
            )}
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Complete address</label>
            <textarea
              className="min-h-28 w-full rounded-md border bg-background p-2 text-sm"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="House, street, area, city"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" disabled={submitting || items.length === 0} onClick={handleConfirm}>
            {submitting ? "Placing order…" : "Confirm order"}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            {items.length === 0 && <p className="text-muted-foreground">No items yet. Go back and add to cart.</p>}
            {items.map((it, idx) => (
              <div key={idx} className="flex items-center justify-between rounded-md border p-2">
                <div className="text-sm pr-3">
                  <div className="font-medium leading-5">{it.name}</div>
                  <div className="text-xs text-muted-foreground">Qty {it.quantity} • Unit Rs. {it.unitPrice.toLocaleString()}</div>
                </div>
                <div className="text-sm font-semibold">Rs. {(it.lineTotal || it.unitPrice * it.quantity).toLocaleString()}</div>
              </div>
            ))}
          </div>
          <div className="h-px bg-border" />
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>Rs. {subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Delivery</span>
            <span>Rs. {SHIPPING_FEE.toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-semibold text-base">
            <span>Total</span>
            <span>Rs. {total.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}