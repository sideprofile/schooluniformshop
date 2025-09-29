"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, LogIn, LogOut, ArrowLeft } from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { items, fetchCart } = useCartStore();
  const { user, logout } = useAuthStore();

  useEffect(() => {
    if (user) fetchCart(user.id).catch(() => {});
  }, [user, fetchCart]);

  const count = items.reduce((a, b) => a + b.quantity, 0);
  const fullName = user?.full_name ?? "";

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        
        {/* Logo + Site Title */}
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Image src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/document-uploads/schoolmartofficiallogo-1758893588334.png" alt="School Mart Logo" width={44} height={44} unoptimized />
          SchoolMart
        </Link>

        <nav className="flex items-center gap-2">
          {pathname !== "/" && (
            <Link href="/" className="inline-flex">
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          )}

          <Link
            href="/"
            className={
              "hidden sm:block px-3 py-2 rounded-md " +
              (pathname === "/" ? "bg-secondary" : "hover:bg-secondary")
            }
          >
            Home
          </Link>

          <Link
            href="/cart"
            className="relative px-3 py-2 rounded-md hover:bg-secondary flex items-center gap-2"
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline">Cart</span>
            {count > 0 && (
              <span className="absolute -top-1 -right-1 text-xs bg-primary text-primary-foreground rounded-full h-5 min-w-5 px-1 grid place-items-center">
                {count}
              </span>
            )}
          </Link>

          {/* Show User Name between Cart and Logout when logged in */}
          {user && (
            <span className="px-3 py-2 font-medium max-w-[10rem] truncate">
              {fullName}
            </span>
          )}

          {user ? (
            <Button
              variant="ghost"
              onClick={() => {
                logout();
                router.push("/");
              }}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          ) : (
            <Link
              href="/login"
              className="px-3 py-2 rounded-md hover:bg-secondary flex items-center gap-2"
            >
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">Login</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}