"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AuthUser = {
  id: number;
  email: string;
  fullName?: string | null;
};

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  setUser: (user: AuthUser | null) => void;
  loginWithEmail: (email: string) => Promise<AuthUser>;
  register: (email: string, fullName?: string) => Promise<AuthUser>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      loading: false,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),
      loginWithEmail: async (email: string) => {
        set({ loading: true });
        try {
          const res = await fetch(`/api/users?search=${encodeURIComponent(email)}`);
          if (!res.ok) throw new Error("Failed to query users");
          const users: AuthUser[] = await res.json();
          const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
          if (!existing) throw new Error("No account found for this email");
          set({ user: existing });
          return existing;
        } finally {
          set({ loading: false });
        }
      },
      register: async (email: string, fullName?: string) => {
        set({ loading: true });
        try {
          const res = await fetch(`/api/users`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, fullName }),
          });
          if (!res.ok) {
            const e = await res.json().catch(() => ({} as any));
            throw new Error(e?.error || "Registration failed");
          }
          const user: AuthUser = await res.json();
          set({ user });
          return user;
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: "auth-store", // localStorage key
      partialize: (state) => ({ user: state.user }), // only persist user
    }
  )
);