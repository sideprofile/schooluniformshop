"use client";
import { useEffect, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/useAuthStore";
import { useCartStore } from "@/store/useCartStore";
import { formatPrice } from "@/lib/format";
import { toast } from "sonner";

export default function CartPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { items, fetchCart, updateQty, removeItem, clear } = useCartStore();

  useEffect(() => {
    if (!user) return;
    fetchCart(user.id).catch(() => {});
  }, [user, fetchCart]);

  const total = useMemo(() => items.reduce((sum, i) => sum + (i.product?.priceCents || 0) * i.quantity, 0), [items]);

  const checkout = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    const res = await fetch(`/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id }),
    });
    if (!res.ok) {
      const e = await res.json().catch(() => ({} as any));
      toast.error(e?.error || "Checkout failed");
      return;
    }
    const order = await res.json();
    clear();
    router.push(`/orders/${order.id}`);
  };

  if (!user) {
    return (
      <div className="py-10 text-center">
        <p className="text-muted-foreground mb-4">Please sign in to view your cart.</p>
        <Button onClick={() => router.push("/login")}>Go to Login</Button>
      </div>
    );
  }

  return (
    <div className="py-6 grid gap-6 md:grid-cols-[2fr_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Your Cart</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {items.length === 0 && <p className="text-muted-foreground">Your cart is empty.</p>}
          {items.map((i) => (
            <div key={i.id} className="flex items-center gap-4 border rounded-lg p-3">
              <div className="relative h-16 w-16 overflow-hidden rounded">
                <Image
                  src={i.product?.imageUrl || "https://images.unsplash.com/photo-1583743814966-8936f37f4678?q=80&w=400"}
                  alt={i.product?.name || "Item"}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="flex-1">
                <p className="font-medium leading-5">{i.product?.name}</p>
                <p className="text-sm text-muted-foreground">{formatPrice(i.product?.priceCents || 0)}</p>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  value={i.quantity}
                  onChange={(e) => updateQty(i.id, Math.max(1, Number(e.target.value || 1)))}
                  className="w-20"
                />
                <Button variant="outline" onClick={() => removeItem(i.id)}>Remove</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>{formatPrice(total)}</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Shipping</span>
            <span>Calculated at checkout</span>
          </div>
          <hr />
          <div className="flex justify-between font-medium">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
          <Button disabled={items.length === 0} onClick={checkout} className="mt-2">Checkout</Button>
        </CardContent>
      </Card>
    </div>
  );
}