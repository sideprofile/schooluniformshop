"use client";
import { create } from "zustand";

export type CartItem = {
  id: number;
  userId: number;
  productId: number;
  quantity: number;
  createdAt: string;
  product?: { id: number; name: string; priceCents: number; imageUrl?: string | null; schoolId: number };
};

interface CartState {
  items: CartItem[];
  loading: boolean;
  fetchCart: (userId: number) => Promise<void>;
  addToCart: (userId: number, productId: number, quantity?: number) => Promise<void>;
  updateQty: (id: number, quantity: number) => Promise<void>;
  removeItem: (id: number) => Promise<void>;
  clear: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  loading: false,
  clear: () => set({ items: [] }),
  fetchCart: async (userId: number) => {
    set({ loading: true });
    try {
      const res = await fetch(`/api/cart?userId=${userId}`);
      if (!res.ok) throw new Error("Failed to load cart");
      const data: CartItem[] = await res.json();
      set({ items: data });
    } finally {
      set({ loading: false });
    }
  },
  addToCart: async (userId: number, productId: number, quantity: number = 1) => {
    const res = await fetch(`/api/cart`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, productId, quantity }),
    });
    if (!res.ok) throw new Error("Failed to add to cart");
    // refresh cart
    await get().fetchCart(userId);
  },
  updateQty: async (id: number, quantity: number) => {
    const res = await fetch(`/api/cart?id=${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    });
    if (!res.ok) throw new Error("Failed to update quantity");
    // optimistic update
    set({ items: get().items.map((i) => (i.id === id ? { ...i, quantity } : i)) });
  },
  removeItem: async (id: number) => {
    const res = await fetch(`/api/cart?id=${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to remove item");
    set({ items: get().items.filter((i) => i.id !== id) });
  },
}));