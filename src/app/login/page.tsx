"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const { loginWithEmail, loading } = useAuthStore();
  const [email, setEmail] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loginWithEmail(email);
      toast.success("Welcome back!");
      router.push("/");
    } catch (err: any) {
      toast.error(err?.message || "Login failed");
    }
  };

  return (
    <div className="mx-auto max-w-md py-10">
      <Card>
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Enter your email to continue.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="grid gap-4">
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
          <p className="text-sm text-muted-foreground mt-4">
            New here? <Link className="underline" href="/register">Create an account</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}