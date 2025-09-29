"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/format";

type OrderItem = {
  id: number;
  productId: number;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
  product?: { id: number; name: string; imageUrl?: string | null };
};

type Order = {
  id: number;
  userId: number;
  status: string;
  totalCents: number;
  createdAt: string;
  items?: OrderItem[];
};

export default function OrderConfirmationPage() {
  const params = useParams();
  const id = Number(params?.id);
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/orders?id=${id}`)
      .then((r) => r.json())
      .then((data: Order) => setOrder(data))
      .catch(() => {});
  }, [id]);

  if (!order) {
    return <p className="py-10 text-muted-foreground">Loading order…</p>;
  }

  return (
    <div className="py-6 grid gap-6 md:grid-cols-[2fr_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Order #{order.id}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {order.items?.map((i) => (
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
                <p className="text-sm text-muted-foreground">Qty {i.quantity}</p>
              </div>
              <div className="text-right">
                <p className="text-sm">{formatPrice(i.unitPriceCents)}</p>
                <p className="text-sm text-muted-foreground">{formatPrice(i.lineTotalCents)}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2">
          <div className="flex justify-between text-sm">
            <span>Status</span>
            <span className="capitalize">{order.status}</span>
          </div>
          <div className="flex justify-between font-medium">
            <span>Total</span>
            <span>{formatPrice(order.totalCents)}</span>
          </div>
          <p className="text-sm text-muted-foreground">A confirmation email will be sent shortly.</p>
        </CardContent>
      </Card>
    </div>
  );
}