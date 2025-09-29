"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

type School = {
  id: number;
  name: string;
  city: string;
  logoUrl?: string | null;
  coverUrl?: string | null;
};

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/schools${query ? `?search=${encodeURIComponent(query)}` : ""}`);
        const data: School[] = res.ok ? await res.json() : [];
        if (active) setSchools(data);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [query]);

  const topSchools = useMemo(() => schools.slice(0, 8), [schools]);

  return (
    <div className="py-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border bg-gradient-to-b from-secondary to-background">
        <div className="grid md:grid-cols-2 gap-6 p-8 md:p-12">
          <div className="flex flex-col justify-center">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight">School uniforms made simple.</h1>
            <p className="mt-3 text-muted-foreground max-w-prose">
              Browse your school, filter by fit and season, and get everything delivered to your door.
            </p>
            <div className="mt-6 flex gap-3">
              <a href="#browse" className="inline-flex">
                <Button size="lg">Browse schools</Button>
              </a>
              <Link href="/cart" className="inline-flex">
                <Button size="lg" variant="outline">View cart</Button>
              </Link>
              <Link href="/checkout" className="inline-flex">
                <Button size="lg" variant="secondary">Checkout</Button>
              </Link>
            </div>
          </div>
          <div className="relative h-50 md:h-full min-h-50 rounded-xl overflow-hidden">
            <Image
              src="https://fsd.multiurok.ru/html/2022/06/05/s_629cfbca44ce6/phpo7BfmL_School-uniform_html_810dcedb07528903.jpg"
              alt="Students in uniform"
              fill
              className="object-cover"
              priority
              unoptimized
            />
          </div>
        </div>
      </section>

      {/* Search + Schools grid */}
      <section id="browse" className="mt-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h2 className="text-xl font-semibold">Find your school</h2>
          <div className="flex gap-2 w-full sm:w-auto">
            <Input
              placeholder="Search by name or city"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="sm:w-72"
            />
            <Button variant="outline" onClick={() => setQuery("")}>Clear</Button>
          </div>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading schools…</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {topSchools.map((s) => (
              <Link key={s.id} href={`/schools/${s.id}`}>
                <Card className="h-full hover:shadow-sm transition-shadow">
                  <CardHeader className="p-0">
                    <div className="relative h-28 w-full overflow-hidden rounded-t-xl">
                      <Image
                        src={s.coverUrl || "file:///C:/Users/TABLINKS/OneDrive/Pictures/bahria%20logo.jpeg"}
                        alt={s.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 overflow-hidden rounded-full border bg-secondary">
                        {s.logoUrl ? (
                          <Image src={s.logoUrl} alt={`${s.name} logo`} fill className="object-cover" unoptimized />
                        ) : (
                          <span className="grid h-full w-full place-items-center text-xs">Logo</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-base truncate">{s.name}</CardTitle>
                        <p className="text-xs text-muted-foreground truncate">{s.city}</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button className="w-full transition-colors hover:bg-secondary/80" variant="secondary">Shop uniforms</Button>
                  </CardFooter>
                </Card>
              </Link>
            ))}
            {!loading && topSchools.length === 0 && (
              <p className="text-muted-foreground">No schools found. Try a different search.</p>
            )}
          </div>
        )}
      </section>

      {/* Features */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">Why UniformHub?</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-5">
              <h3 className="font-medium">School-specific catalogs</h3>
              <p className="text-sm text-muted-foreground mt-1">Only see items approved for your school, with sizing and season filters.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <h3 className="font-medium">Fast checkout</h3>
              <p className="text-sm text-muted-foreground mt-1">Simple cart flow and instant order confirmation.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <h3 className="font-medium">Quality you can trust</h3>
              <p className="text-sm text-muted-foreground mt-1">Durable fabrics and classic fits that last the whole school year.</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}