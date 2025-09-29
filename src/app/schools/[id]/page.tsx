"use client";
import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

type School = { id: number; name: string; city: string };

export default function SchoolCatalogPage() {
  const params = useParams();
  const id = Number(params?.id);
  const router = useRouter();

  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);

  // Step-by-step selection state
  const [gender, setGender] = useState<"boy" | "girl" | "">("");
  const [season, setSeason] = useState<"summer" | "winter" | "">("");
  const [level, setLevel] = useState<"school" | "college" | "">("");
  const [item, setItem] = useState<"shirt" | "pant" | "sweater" | "tie" | "frock" | "">("");
  const [shirtSize, setShirtSize] = useState<"18" | "20" | "22" | "24" | "26" | "28" | "30" | "">("");
  const [qty, setQty] = useState<number>(1);
  const [sweaterSize, setSweaterSize] = useState<"22" | "24" | "26" | "28" | "30" | "32" | "">("");
  const [pantSize, setPantSize] = useState<"22" | "24" | "26" | "28" | "30" | "32" | "34" | "36" | "38" | "40" | "">("");
  const [frockSize, setFrockSize] = useState<"22" | "24" | "26" | "28" | "30" | "32" | "34" | "36" | "38" | "40" | "42" | "">("");

  // Pricing logic
  const unitPrice = useMemo(() => {
    if (item === "shirt") {
      if (!shirtSize) return 0;
      return shirtSize === "30" ? 1100 : 850;
    }
    if (item === "sweater") {
      if (!sweaterSize) return 0;
      return ["22", "24", "26", "28"].includes(sweaterSize) ? 1300 : 1500;
    }
    if (item === "pant") {
      if (!pantSize) return 0;
      return Number(pantSize) * 30;
    }
    if (item === "tie") {
      return 150;
    }
    if (item === "frock") {
      if (!frockSize) return 0;
      return Number(frockSize) * 30; // Rs. 30 per inch
    }
    return 0;
  }, [item, shirtSize, sweaterSize, pantSize, frockSize]);
  const total = unitPrice * (qty || 0);

  const handleAddToCart = () => {
    if (total <= 0 || !item) return;
    
    const parts = [
      gender ? gender[0].toUpperCase() + gender.slice(1) : "",
      season ? season[0].toUpperCase() + season.slice(1) : "",
      level ? level[0].toUpperCase() + level.slice(1) : "",
      item ? item[0].toUpperCase() + item.slice(1) : "",
    ].filter(Boolean);
    
    const sizeStr = item === "shirt" ? (shirtSize ? `Size ${shirtSize}` : "") : 
                   item === "sweater" ? (sweaterSize ? `Size ${sweaterSize}` : "") : 
                   item === "pant" ? (pantSize ? `Size ${pantSize}` : "") : 
                   item === "frock" ? (frockSize ? `Size ${frockSize}` : "") : "";
    
    const name = `${parts.join(" • ")}${sizeStr ? ` • ${sizeStr}` : ""}`;
    const line = { name, quantity: qty, unitPrice: unitPrice, lineTotal: total };
    
    try {
      const key = "uniformCheckoutItems";
      const existing = JSON.parse(localStorage.getItem(key) || "[]");
      const next = Array.isArray(existing) ? [...existing, line] : [line];
      localStorage.setItem(key, JSON.stringify(next));
      router.push("/checkout");
    } catch {}
  };

  // Fetch school only (products removed)
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const sRes = await fetch(`/api/schools?id=${id}`);
        if (sRes.ok) setSchool(await sRes.json());
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
  }, [id]);

  return (
    <div className="py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">{school ? school.name : "School"}</h1>
        <p className="text-sm text-muted-foreground">Uniform catalog</p>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : (
        <div className="space-y-6">
          {/* Step 1: Gender */}
          <div className="space-y-2">
            <Label className="text-base">Select gender</Label>
            <RadioGroup
              className="grid grid-cols-2 gap-3 sm:max-w-md"
              value={gender}
              onValueChange={(v) => {
                setGender(v as any);
                // reset downstream selections
                setSeason("");
                setLevel("");
                setItem("");
                setShirtSize("");
                setSweaterSize("");
                setPantSize("");
                setFrockSize("");
              }}
            >
              <div className="flex items-center gap-2 rounded-md border p-3">
                <RadioGroupItem id="g-boy" value="boy" />
                <Label htmlFor="g-boy" className="cursor-pointer">Boy</Label>
              </div>
              <div className="flex items-center gap-2 rounded-md border p-3">
                <RadioGroupItem id="g-girl" value="girl" />
                <Label htmlFor="g-girl" className="cursor-pointer">Girl</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Step 2: Season */}
          {gender && (
            <div className="space-y-2">
              <Label className="text-base">Select season</Label>
              <RadioGroup
                className="grid grid-cols-2 gap-3 sm:max-w-md"
                value={season}
                onValueChange={(v) => {
                  setSeason(v as any);
                  setLevel("");
                  setItem("");
                  setShirtSize("");
                  setSweaterSize("");
                  setPantSize("");
                  setFrockSize("");
                }}
              >
                <div className="flex items-center gap-2 rounded-md border p-3">
                  <RadioGroupItem id="s-winter" value="winter" />
                  <Label htmlFor="s-winter" className="cursor-pointer">Winter</Label>
                </div>
                <div className="flex items-center gap-2 rounded-md border p-3">
                  <RadioGroupItem id="s-summer" value="summer" />
                  <Label htmlFor="s-summer" className="cursor-pointer">Summer</Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Step 3: Uniform type */}
          {gender && season && (
            <div className="space-y-2">
              <Label className="text-base">Select uniform type</Label>
              <RadioGroup
                className="grid grid-cols-2 gap-3 sm:max-w-md"
                value={level}
                onValueChange={(v) => {
                  setLevel(v as any);
                  setItem("");
                  setShirtSize("");
                  setSweaterSize("");
                  setPantSize("");
                  setFrockSize("");
                }}
              >
                <div className="flex items-center gap-2 rounded-md border p-3">
                  <RadioGroupItem id="u-school" value="school" />
                  <Label htmlFor="u-school" className="cursor-pointer">School uniform</Label>
                </div>
                <div className="flex items-center gap-2 rounded-md border p-3">
                  <RadioGroupItem id="u-college" value="college" />
                  <Label htmlFor="u-college" className="cursor-pointer">College uniform</Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Special path: boy -> winter -> school uniform */}
          {gender === "boy" && season === "winter" && level === "school" && (
            <div className="space-y-6">
              {/* Step 4: Item */}
              <div className="space-y-2">
                <Label className="text-base">Select item</Label>
                <RadioGroup
                  className="grid grid-cols-2 gap-3 sm:max-w-md"
                  value={item}
                  onValueChange={(v) => {
                    setItem(v as any);
                    setShirtSize("");
                    setSweaterSize("");
                    setPantSize("");
                    setFrockSize("");
                    setQty(1);
                  }}
                >
                  <div className="flex items-center gap-2 rounded-md border p-3">
                    <RadioGroupItem id="i2-shirt" value="shirt" />
                    <Label htmlFor="i2-shirt" className="cursor-pointer">Shirt</Label>
                  </div>
                  <div className="flex items-center gap-2 rounded-md border p-3">
                    <RadioGroupItem id="i2-pant" value="pant" />
                    <Label htmlFor="i2-pant" className="cursor-pointer">Pant</Label>
                  </div>
                  <div className="flex items-center gap-2 rounded-md border p-3">
                    <RadioGroupItem id="i2-sweater" value="sweater" />
                    <Label htmlFor="i2-sweater" className="cursor-pointer">Sweater</Label>
                  </div>
                  <div className="flex items-center gap-2 rounded-md border p-3">
                    <RadioGroupItem id="i2-tie" value="tie" />
                    <Label htmlFor="i2-tie" className="cursor-pointer">Tie</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Reuse shirt flow */}
              {item === "shirt" && (
                <div className="grid gap-4 sm:grid-cols-2 sm:max-w-2xl">
                  <div className="space-y-2">
                    <Label>Select shirt size</Label>
                    <Select value={shirtSize} onValueChange={(v) => setShirtSize(v as any)}>
                      <SelectTrigger aria-label="Select shirt size">
                        <SelectValue placeholder="Choose size (inches)" />
                      </SelectTrigger>
                      <SelectContent>
                        {["18","20","22","24","26","28","30"].map((sz) => (
                          <SelectItem key={sz} value={sz}>
                            {sz} inches {sz === "30" ? "— Rs. 1100" : "— Rs. 850"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Select quantity</Label>
                    <Select value={String(qty)} onValueChange={(v) => setQty(Number(v))}>
                      <SelectTrigger aria-label="Select quantity">
                        <SelectValue placeholder="Qty" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                          <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Sweater options */}
              {item === "sweater" && (
                <div className="grid gap-4 sm:grid-cols-2 sm:max-w-2xl">
                  <div className="space-y-2">
                    <Label>Select sweater size</Label>
                    <Select value={sweaterSize} onValueChange={(v) => setSweaterSize(v as any)}>
                      <SelectTrigger aria-label="Select sweater size">
                        <SelectValue placeholder="Choose size (inches)" />
                      </SelectTrigger>
                      <SelectContent>
                        {["22","24","26","28","30","32"].map((sz) => (
                          <SelectItem key={sz} value={sz}>
                            {sz} inches {["22","24","26","28"].includes(sz) ? "— Rs. 1300" : "— Rs. 1500"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Select quantity</Label>
                    <Select value={String(qty)} onValueChange={(v) => setQty(Number(v))}>
                      <SelectTrigger aria-label="Select quantity">
                        <SelectValue placeholder="Qty" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                          <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Pant options */}
              {item === "pant" && (
                <div className="grid gap-4 sm:grid-cols-2 sm:max-w-2xl">
                  <div className="space-y-2">
                    <Label>Select pant size</Label>
                    <Select value={pantSize} onValueChange={(v) => setPantSize(v as any)}>
                      <SelectTrigger aria-label="Select pant size">
                        <SelectValue placeholder="Choose size (inches)" />
                      </SelectTrigger>
                      <SelectContent>
                        {["22","24","26","28","30","32","34","36","38","40"].map((sz) => (
                          <SelectItem key={sz} value={sz}>
                            {sz} inches — Rs. {Number(sz) * 30}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Select quantity</Label>
                    <Select value={String(qty)} onValueChange={(v) => setQty(Number(v))}>
                      <SelectTrigger aria-label="Select quantity">
                        <SelectValue placeholder="Qty" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                          <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Tie options (fixed price) */}
              {item === "tie" && (
                <div className="grid gap-4 sm:grid-cols-2 sm:max-w-xl">
                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Select value={String(qty)} onValueChange={(v) => setQty(Number(v))}>
                      <SelectTrigger aria-label="Select quantity">
                        <SelectValue placeholder="Qty" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                          <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Summary & total */}
              {item === "shirt" && shirtSize && qty > 0 && (
                <div className="rounded-lg border p-4 sm:max-w-2xl">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Summary:</span>{" "}
                      Boy • Winter • School • Shirt • Size {shirtSize} • Qty {qty}
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">Unit price</div>
                      <div className="font-semibold">Rs. {unitPrice.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-sm">Total</div>
                    <div className="text-lg font-bold">Rs. {total.toLocaleString()}</div>
                  </div>
                  <div className="mt-4">
                    <Button className="w-full" disabled={total <= 0} onClick={handleAddToCart}>Add to cart</Button>
                  </div>
                </div>
              )}

              {item === "sweater" && sweaterSize && qty > 0 && (
                <div className="rounded-lg border p-4 sm:max-w-2xl">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Summary:</span>{" "}
                      Boy • Winter • School • Sweater • Size {sweaterSize} • Qty {qty}
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">Unit price</div>
                      <div className="font-semibold">Rs. {unitPrice.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-sm">Total</div>
                    <div className="text-lg font-bold">Rs. {total.toLocaleString()}</div>
                  </div>
                  <div className="mt-4">
                    <Button className="w-full" disabled={total <= 0} onClick={handleAddToCart}>Add to cart</Button>
                  </div>
                </div>
              )}

              {item === "pant" && pantSize && qty > 0 && (
                <div className="rounded-lg border p-4 sm:max-w-2xl">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Summary:</span>{" "}
                      Boy • Winter • School • Pant • Size {pantSize} • Qty {qty}
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">Unit price</div>
                      <div className="font-semibold">Rs. {unitPrice.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-sm">Total</div>
                    <div className="text-lg font-bold">Rs. {total.toLocaleString()}</div>
                  </div>
                  <div className="mt-4">
                    <Button className="w-full" disabled={total <= 0} onClick={handleAddToCart}>Add to cart</Button>
                  </div>
                </div>
              )}

              {item === "tie" && qty > 0 && (
                <div className="rounded-lg border p-4 sm:max-w-2xl">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Summary:</span>{" "}
                      Boy • Winter • School • Tie • Qty {qty}
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">Unit price</div>
                      <div className="font-semibold">Rs. {unitPrice.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-sm">Total</div>
                    <div className="text-lg font-bold">Rs. {total.toLocaleString()}</div>
                  </div>
                  <div className="mt-4">
                    <Button className="w-full" disabled={total <= 0} onClick={handleAddToCart}>Add to cart</Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Restore: boy -> summer -> school uniform */}
          {gender === "boy" && season === "summer" && level === "school" && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-base">Select item</Label>
                <RadioGroup
                  className="grid grid-cols-2 gap-3 sm:max-w-md"
                  value={item}
                  onValueChange={(v) => {
                    setItem(v as any);
                    setShirtSize("");
                    setSweaterSize("");
                    setPantSize("");
                    setFrockSize("");
                    setQty(1);
                  }}
                >
                  <div className="flex items-center gap-2 rounded-md border p-3">
                    <RadioGroupItem id="i-sum-shirt" value="shirt" />
                    <Label htmlFor="i-sum-shirt" className="cursor-pointer">Shirt</Label>
                  </div>
                  <div className="flex items-center gap-2 rounded-md border p-3">
                    <RadioGroupItem id="i-sum-pant" value="pant" />
                    <Label htmlFor="i-sum-pant" className="cursor-pointer">Pant</Label>
                  </div>
                </RadioGroup>
              </div>

              {item === "shirt" && (
                <div className="grid gap-4 sm:grid-cols-2 sm:max-w-2xl">
                  <div className="space-y-2">
                    <Label>Select shirt size</Label>
                    <Select value={shirtSize} onValueChange={(v) => setShirtSize(v as any)}>
                      <SelectTrigger aria-label="Select shirt size">
                        <SelectValue placeholder="Choose size (inches)" />
                      </SelectTrigger>
                      <SelectContent>
                        {["18","20","22","24","26","28","30"].map((sz) => (
                          <SelectItem key={sz} value={sz}>
                            {sz} inches {sz === "30" ? "— Rs. 1100" : "— Rs. 850"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Select quantity</Label>
                    <Select value={String(qty)} onValueChange={(v) => setQty(Number(v))}>
                      <SelectTrigger aria-label="Select quantity">
                        <SelectValue placeholder="Qty" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                          <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Pant options */}
              {item === "pant" && (
                <div className="grid gap-4 sm:grid-cols-2 sm:max-w-2xl">
                  <div className="space-y-2">
                    <Label>Select pant size</Label>
                    <Select value={pantSize} onValueChange={(v) => setPantSize(v as any)}>
                      <SelectTrigger aria-label="Select pant size">
                        <SelectValue placeholder="Choose size (inches)" />
                      </SelectTrigger>
                      <SelectContent>
                        {["22","24","26","28","30","32","34","36","38","40"].map((sz) => (
                          <SelectItem key={sz} value={sz}>
                            {sz} inches — Rs. {Number(sz) * 30}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Select quantity</Label>
                    <Select value={String(qty)} onValueChange={(v) => setQty(Number(v))}>
                      <SelectTrigger aria-label="Select quantity">
                        <SelectValue placeholder="Qty" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                          <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {item === "pant" && pantSize && qty > 0 && (
                <div className="rounded-lg border p-4 sm:max-w-2xl">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Summary:</span>{" "}
                      Boy • Summer • School • Pant • Size {pantSize} • Qty {qty}
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">Unit price</div>
                      <div className="font-semibold">Rs. {unitPrice.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-sm">Total</div>
                    <div className="text-lg font-bold">Rs. {total.toLocaleString()}</div>
                  </div>
                  <div className="mt-4">
                    <Button className="w-full" disabled={total <= 0} onClick={handleAddToCart}>Add to cart</Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* New: boy -> winter -> college uniform (same as winter school) */}
          {gender === "boy" && season === "winter" && level === "college" && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-base">Select item</Label>
                <RadioGroup
                  className="grid grid-cols-2 gap-3 sm:max-w-md"
                  value={item}
                  onValueChange={(v) => {
                    setItem(v as any);
                    setShirtSize("");
                    setSweaterSize("");
                    setPantSize("");
                    setFrockSize("");
                    setQty(1);
                  }}
                >
                  <div className="flex items-center gap-2 rounded-md border p-3">
                    <RadioGroupItem id="i3-shirt" value="shirt" />
                    <Label htmlFor="i3-shirt" className="cursor-pointer">Shirt</Label>
                  </div>
                  <div className="flex items-center gap-2 rounded-md border p-3">
                    <RadioGroupItem id="i3-pant" value="pant" />
                    <Label htmlFor="i3-pant" className="cursor-pointer">Pant</Label>
                  </div>
                  <div className="flex items-center gap-2 rounded-md border p-3">
                    <RadioGroupItem id="i3-sweater" value="sweater" />
                    <Label htmlFor="i3-sweater" className="cursor-pointer">Sweater</Label>
                  </div>
                  <div className="flex items-center gap-2 rounded-md border p-3">
                    <RadioGroupItem id="i3-tie" value="tie" />
                    <Label htmlFor="i3-tie" className="cursor-pointer">Tie</Label>
                  </div>
                </RadioGroup>
              </div>

              {item === "shirt" && (
                <div className="grid gap-4 sm:grid-cols-2 sm:max-w-2xl">
                  <div className="space-y-2">
                    <Label>Select shirt size</Label>
                    <Select value={shirtSize} onValueChange={(v) => setShirtSize(v as any)}>
                      <SelectTrigger aria-label="Select shirt size">
                        <SelectValue placeholder="Choose size (inches)" />
                      </SelectTrigger>
                      <SelectContent>
                        {["18","20","22","24","26","28","30"].map((sz) => (
                          <SelectItem key={sz} value={sz}>
                            {sz} inches {sz === "30" ? "— Rs. 1100" : "— Rs. 850"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Select quantity</Label>
                    <Select value={String(qty)} onValueChange={(v) => setQty(Number(v))}>
                      <SelectTrigger aria-label="Select quantity">
                        <SelectValue placeholder="Qty" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                          <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {item === "sweater" && (
                <div className="grid gap-4 sm:grid-cols-2 sm:max-w-2xl">
                  <div className="space-y-2">
                    <Label>Select sweater size</Label>
                    <Select value={sweaterSize} onValueChange={(v) => setSweaterSize(v as any)}>
                      <SelectTrigger aria-label="Select sweater size">
                        <SelectValue placeholder="Choose size (inches)" />
                      </SelectTrigger>
                      <SelectContent>
                        {["22","24","26","28","30","32"].map((sz) => (
                          <SelectItem key={sz} value={sz}>
                            {sz} inches {["22","24","26","28"].includes(sz) ? "— Rs. 1300" : "— Rs. 1500"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Select quantity</Label>
                    <Select value={String(qty)} onValueChange={(v) => setQty(Number(v))}>
                      <SelectTrigger aria-label="Select quantity">
                        <SelectValue placeholder="Qty" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                          <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {item === "pant" && (
                <div className="grid gap-4 sm:grid-cols-2 sm:max-w-2xl">
                  <div className="space-y-2">
                    <Label>Select pant size</Label>
                    <Select value={pantSize} onValueChange={(v) => setPantSize(v as any)}>
                      <SelectTrigger aria-label="Select pant size">
                        <SelectValue placeholder="Choose size (inches)" />
                      </SelectTrigger>
                      <SelectContent>
                        {["22","24","26","28","30","32","34","36","38","40"].map((sz) => (
                          <SelectItem key={sz} value={sz}>
                            {sz} inches {sz === "40" ? "— Rs. 1200" : "— Rs. 900"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Select quantity</Label>
                    <Select value={String(qty)} onValueChange={(v) => setQty(Number(v))}>
                      <SelectTrigger aria-label="Select quantity">
                        <SelectValue placeholder="Qty" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                          <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {item === "tie" && (
                <div className="grid gap-4 sm:grid-cols-2 sm:max-w-xl">
                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Select value={String(qty)} onValueChange={(v) => setQty(Number(v))}>
                      <SelectTrigger aria-label="Select quantity">
                        <SelectValue placeholder="Qty" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                          <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {item === "shirt" && shirtSize && qty > 0 && (
                <div className="rounded-lg border p-4 sm:max-w-2xl">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Summary:</span>{" "}
                      Boy • Winter • College • Shirt • Size {shirtSize} • Qty {qty}
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">Unit price</div>
                      <div className="font-semibold">Rs. {unitPrice.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-sm">Total</div>
                    <div className="text-lg font-bold">Rs. {total.toLocaleString()}</div>
                  </div>
                  <div className="mt-4">
                    <Button className="w-full" disabled={total <= 0} onClick={handleAddToCart}>Add to cart</Button>
                  </div>
                </div>
              )}

              {item === "sweater" && sweaterSize && qty > 0 && (
                <div className="rounded-lg border p-4 sm:max-w-2xl">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Summary:</span>{" "}
                      Boy • Winter • College • Sweater • Size {sweaterSize} • Qty {qty}
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">Unit price</div>
                      <div className="font-semibold">Rs. {unitPrice.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-sm">Total</div>
                    <div className="text-lg font-bold">Rs. {total.toLocaleString()}</div>
                  </div>
                  <div className="mt-4">
                    <Button className="w-full" disabled={total <= 0} onClick={handleAddToCart}>Add to cart</Button>
                  </div>
                </div>
              )}

              {item === "pant" && pantSize && qty > 0 && (
                <div className="rounded-lg border p-4 sm:max-w-2xl">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Summary:</span>{" "}
                      Boy • Winter • College • Pant • Size {pantSize} • Qty {qty}
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">Unit price</div>
                      <div className="font-semibold">Rs. {unitPrice.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-sm">Total</div>
                    <div className="text-lg font-bold">Rs. {total.toLocaleString()}</div>
                  </div>
                  <div className="mt-4">
                    <Button className="w-full" disabled={total <= 0} onClick={handleAddToCart}>Add to cart</Button>
                  </div>
                </div>
              )}

              {item === "tie" && qty > 0 && (
                <div className="rounded-lg border p-4 sm:max-w-2xl">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Summary:</span>{" "}
                      Boy • Winter • College • Tie • Qty {qty}
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">Unit price</div>
                      <div className="font-semibold">Rs. {unitPrice.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-sm">Total</div>
                    <div className="text-lg font-bold">Rs. {total.toLocaleString()}</div>
                  </div>
                  <div className="mt-4">
                    <Button className="w-full" disabled={total <= 0} onClick={handleAddToCart}>Add to cart</Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* New: boy -> summer -> college uniform (same as summer school) */}
          {gender === "boy" && season === "summer" && level === "college" && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-base">Select item</Label>
                <RadioGroup
                  className="grid grid-cols-2 gap-3 sm:max-w-md"
                  value={item}
                  onValueChange={(v) => {
                    setItem(v as any);
                    setShirtSize("");
                    setSweaterSize("");
                    setPantSize("");
                    setFrockSize("");
                    setQty(1);
                  }}
                >
                  <div className="flex items-center gap-2 rounded-md border p-3">
                    <RadioGroupItem id="i4-shirt" value="shirt" />
                    <Label htmlFor="i4-shirt" className="cursor-pointer">Shirt</Label>
                  </div>
                  <div className="flex items-center gap-2 rounded-md border p-3">
                    <RadioGroupItem id="i4-pant" value="pant" />
                    <Label htmlFor="i4-pant" className="cursor-pointer">Pant</Label>
                  </div>
                </RadioGroup>
              </div>

              {item === "shirt" && (
                <div className="grid gap-4 sm:grid-cols-2 sm:max-w-2xl">
                  <div className="space-y-2">
                    <Label>Select shirt size</Label>
                    <Select value={shirtSize} onValueChange={(v) => setShirtSize(v as any)}>
                      <SelectTrigger aria-label="Select shirt size">
                        <SelectValue placeholder="Choose size (inches)" />
                      </SelectTrigger>
                      <SelectContent>
                        {["18","20","22","24","26","28","30"].map((sz) => (
                          <SelectItem key={sz} value={sz}>
                            {sz} inches {sz === "30" ? "— Rs. 1100" : "— Rs. 850"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Select quantity</Label>
                    <Select value={String(qty)} onValueChange={(v) => setQty(Number(v))}>
                      <SelectTrigger aria-label="Select quantity">
                        <SelectValue placeholder="Qty" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                          <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Pant options */}
              {item === "pant" && (
                <div className="grid gap-4 sm:grid-cols-2 sm:max-w-2xl">
                  <div className="space-y-2">
                    <Label>Select pant size</Label>
                    <Select value={pantSize} onValueChange={(v) => setPantSize(v as any)}>
                      <SelectTrigger aria-label="Select pant size">
                        <SelectValue placeholder="Choose size (inches)" />
                      </SelectTrigger>
                      <SelectContent>
                        {["22","24","26","28","30","32","34","36","38","40"].map((sz) => (
                          <SelectItem key={sz} value={sz}>
                            {sz} inches — Rs. {Number(sz) * 30}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Select quantity</Label>
                    <Select value={String(qty)} onValueChange={(v) => setQty(Number(v))}>
                      <SelectTrigger aria-label="Select quantity">
                        <SelectValue placeholder="Qty" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                          <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {item === "pant" && pantSize && qty > 0 && (
                <div className="rounded-lg border p-4 sm:max-w-2xl">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Summary:</span>{" "}
                      Boy • Summer • College • Pant • Size {pantSize} • Qty {qty}
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">Unit price</div>
                      <div className="font-semibold">Rs. {unitPrice.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-sm">Total</div>
                    <div className="text-lg font-bold">Rs. {total.toLocaleString()}</div>
                  </div>
                  <div className="mt-4">
                    <Button className="w-full" disabled={total <= 0} onClick={handleAddToCart}>Add to cart</Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* GIRL FLOWS: winter/summer + school/college -> Frock */}
          {gender === "girl" && season && level && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-base">Select item</Label>
                <RadioGroup
                  className="grid grid-cols-2 gap-3 sm:max-w-md"
                  value={item}
                  onValueChange={(v) => {
                    setItem(v as any);
                    setShirtSize("");
                    setSweaterSize("");
                    setPantSize("");
                    setFrockSize("");
                    setQty(1);
                  }}
                >
                  <div className="flex items-center gap-2 rounded-md border p-3">
                    <RadioGroupItem id="i-girl-frock" value="frock" />
                    <Label htmlFor="i-girl-frock" className="cursor-pointer">Frock</Label>
                  </div>
                </RadioGroup>
              </div>

              {item === "frock" && (
                <div className="grid gap-4 sm:grid-cols-2 sm:max-w-2xl">
                  <div className="space-y-2">
                    <Label>Select frock size</Label>
                    <Select value={frockSize} onValueChange={(v) => setFrockSize(v as any)}>
                      <SelectTrigger aria-label="Select frock size">
                        <SelectValue placeholder="Choose size (inches)" />
                      </SelectTrigger>
                      <SelectContent>
                        {["22","24","26","28","30","32","34","36","38","40","42"].map((sz) => (
                          <SelectItem key={sz} value={sz}>
                            {sz} inches — Rs. {Number(sz) * 30}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Select quantity</Label>
                    <Select value={String(qty)} onValueChange={(v) => setQty(Number(v))}>
                      <SelectTrigger aria-label="Select quantity">
                        <SelectValue placeholder="Qty" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                          <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {item === "frock" && frockSize && qty > 0 && (
                <div className="rounded-lg border p-4 sm:max-w-2xl">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Summary:</span>{" "}
                      Girl • {season[0].toUpperCase() + season.slice(1)} • {level[0].toUpperCase() + level.slice(1)} • Frock • Size {frockSize} • Qty {qty}
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">Unit price</div>
                      <div className="font-semibold">Rs. {unitPrice.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-sm">Total</div>
                    <div className="text-lg font-bold">Rs. { (unitPrice * qty).toLocaleString() }</div>
                  </div>
                  <div className="mt-4">
                    <Button className="w-full" disabled={unitPrice <= 0} onClick={handleAddToCart}>Add to cart</Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* For other combinations (not specified), we stop at uniform type */}
          {gender && season && level && !(
            (gender === "boy" && season === "winter" && level === "school") ||
            (gender === "boy" && season === "summer" && level === "school") ||
            (gender === "boy" && season === "winter" && level === "college") ||
            (gender === "boy" && season === "summer" && level === "college")
          ) && (
            <p className="text-sm text-muted-foreground">More options for this selection will be available soon.</p>
          )}
        </div>
      )}
    </div>
  );
}