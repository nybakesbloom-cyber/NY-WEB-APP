"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { money } from "@/lib/format";
import { useApi, send, PageHead, Panel, Field, Loading, ErrorBox } from "@/components/admin/ui";

type Product = {
  _id: string; slug: string; name: string; price: number; category: string;
  variants: { label: string; delta: number }[];
  flavours: string[];
};

type Line = { slug: string; name: string; variant: string; flavour: string; qty: number; unitPrice: number };

const METHODS = ["cash", "upi", "card", "netbanking"];

export default function CounterSalePage() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const { data, error, loading } = useApi<{ items: Product[] }>(
    `/api/admin/products?limit=100&active=true${q ? `&q=${encodeURIComponent(q)}` : ""}`,
  );

  const [lines, setLines] = useState<Line[]>([]);
  const [discount, setDiscount] = useState(0);
  const [payment, setPayment] = useState("cash");
  const [paidNow, setPaidNow] = useState(true);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  const subtotal = lines.reduce((n, l) => n + l.unitPrice * l.qty, 0);
  const total = Math.max(0, subtotal - discount);

  function add(p: Product) {
    const variant = p.variants[0] ?? { label: "Standard", delta: 0 };
    const key = `${p.slug}|${variant.label}`;
    setLines((prev) => {
      const found = prev.find((l) => `${l.slug}|${l.variant}` === key);
      if (found) {
        return prev.map((l) => (`${l.slug}|${l.variant}` === key ? { ...l, qty: l.qty + 1 } : l));
      }
      return [
        ...prev,
        {
          slug: p.slug,
          name: p.name,
          variant: variant.label,
          flavour: p.flavours?.[0] ?? "",
          qty: 1,
          unitPrice: p.price + variant.delta,
        },
      ];
    });
  }

  function setQty(i: number, qty: number) {
    setLines((prev) =>
      qty <= 0 ? prev.filter((_, j) => j !== i) : prev.map((l, j) => (j === i ? { ...l, qty } : l)),
    );
  }

  async function take(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (lines.length === 0) return setProblem("Add at least one item");

    const form = new FormData(e.currentTarget);
    setBusy(true);
    setProblem(null);
    try {
      const r = await send<{ item: { _id: string; number: string } }>("/api/admin/orders", "POST", {
        lines: lines.map((l) => ({ slug: l.slug, variant: l.variant, flavour: l.flavour, qty: l.qty })),
        customer: {
          name: String(form.get("name") ?? "").trim(),
          phone: String(form.get("phone") ?? "").trim(),
          email: String(form.get("email") ?? "").trim(),
        },
        payment,
        paidNow,
        discount,
        notes: String(form.get("notes") ?? "").trim(),
      });
      router.push(`/admin/orders/${r.item._id}`);
    } catch (err) {
      setProblem(err instanceof Error ? err.message : "Could not take the order");
      setBusy(false);
    }
  }

  return (
    <>
      <PageHead title="Counter sale" sub="An order taken at the shop — collected, not delivered.">
        <Link href="/admin/orders" className="btn btn-outline px-4 py-2 text-[0.82rem]">
          ← All orders
        </Link>
      </PageHead>

      {problem && <div className="mb-4"><ErrorBox message={problem} /></div>}

      <form onSubmit={take} className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
        <Panel title="Add items">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search the catalogue"
            aria-label="Search products"
            className="field mb-3"
          />
          {loading ? (
            <Loading />
          ) : error ? (
            <ErrorBox message={error} />
          ) : (
            <div className="grid max-h-[380px] grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3">
              {data?.items.map((p) => (
                <button
                  key={p._id}
                  type="button"
                  onClick={() => add(p)}
                  className="rounded-lg border border-brand-900/10 bg-white p-2.5 text-left transition hover:border-gold-500"
                >
                  <span className="block truncate text-[0.82rem] font-semibold text-brand-900">{p.name}</span>
                  <span className="block text-[0.76rem] text-brand-700/70">{money(p.price)}</span>
                </button>
              ))}
            </div>
          )}
        </Panel>

        <div className="space-y-4">
          <Panel title="The bill">
            {lines.length === 0 ? (
              <p className="text-[0.86rem] text-brand-700/60">Nothing added yet.</p>
            ) : (
              lines.map((l, i) => (
                <div key={`${l.slug}-${l.variant}`} className="flex items-center gap-2 border-b border-brand-900/6 py-2 first:pt-0 last:border-0">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[0.85rem] font-semibold text-brand-900">{l.name}</p>
                    <p className="text-[0.74rem] text-brand-700/65">{l.variant} · {money(l.unitPrice)}</p>
                  </div>
                  <div className="flex items-center rounded-full border border-brand-900/12">
                    <button type="button" onClick={() => setQty(i, l.qty - 1)} className="grid h-7 w-7 place-items-center">−</button>
                    <span className="w-6 text-center text-[0.8rem] font-semibold">{l.qty}</span>
                    <button type="button" onClick={() => setQty(i, l.qty + 1)} className="grid h-7 w-7 place-items-center">+</button>
                  </div>
                  <span className="w-20 text-right text-[0.85rem] font-semibold text-brand-900">
                    {money(l.unitPrice * l.qty)}
                  </span>
                </div>
              ))
            )}

            <div className="mt-4 space-y-2 border-t border-brand-900/8 pt-3 text-[0.86rem]">
              <div className="flex justify-between">
                <span className="text-brand-700/75">Subtotal</span>
                <span className="font-semibold text-brand-900">{money(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-brand-700/75">Discount</span>
                <input
                  type="number" min="0" max={subtotal} value={discount}
                  onChange={(e) => setDiscount(Math.max(0, Number(e.target.value) || 0))}
                  className="field w-28 py-1.5 text-right text-[0.85rem]"
                  aria-label="Discount"
                />
              </div>
              <div className="flex justify-between border-t border-brand-900/8 pt-2">
                <span className="font-display text-lg font-semibold text-brand-900">To pay</span>
                <span className="font-display text-xl font-semibold text-brand-900">{money(total)}</span>
              </div>
            </div>
          </Panel>

          <Panel title="Customer & payment">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Name" hint="Optional — leave blank for a walk-in.">
                <input name="name" className="field" placeholder="Walk-in" />
              </Field>
              <Field label="Mobile" hint="This is what links repeat customers.">
                <input name="phone" inputMode="numeric" className="field" placeholder="98XXXXXX21" />
              </Field>
            </div>

            <div className="mt-3">
              <p className="mb-1.5 text-[0.76rem] font-semibold text-brand-800">Payment method</p>
              <div className="flex flex-wrap gap-1.5">
                {METHODS.map((m) => (
                  <button
                    key={m} type="button" onClick={() => setPayment(m)}
                    className={`rounded-full px-3.5 py-1.5 text-[0.78rem] font-semibold transition ${
                      payment === m ? "bg-brand-800 text-gold-100" : "border border-brand-900/12 text-brand-800 hover:border-gold-500"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <label className="mt-3 flex items-center gap-2.5 text-[0.85rem] text-brand-800">
              <input type="checkbox" checked={paidNow} onChange={(e) => setPaidNow(e.target.checked)} className="h-4 w-4 accent-[#C9A227]" />
              Paid now — untick to leave it owing
            </label>

            <Field label="Note">
              <input name="notes" className="field mt-3" placeholder="Anything the kitchen needs" />
            </Field>

            <button type="submit" disabled={busy || lines.length === 0} className="btn btn-gold mt-4 w-full py-3">
              {busy ? "Taking the order…" : `Take the order · ${money(total)}`}
            </button>
          </Panel>
        </div>
      </form>
    </>
  );
}
