"use client";

import Link from "next/link";
import { useState } from "react";
import { money } from "@/lib/format";
import { useApi, PageHead, Toolbar, Chip, Badge, Loading, ErrorBox, Empty } from "@/components/admin/ui";

type Row = {
  _id: string; slug: string; name: string; category: string;
  price: number; mrp?: number; active: boolean; bestseller: boolean;
  image: string | null;
  art: { kind: string; hues: string[] };
};

const CATS = ["all", "cakes", "flowers", "combos", "plants", "hampers"];

export default function ProductsPage() {
  const [cat, setCat] = useState("all");
  const [q, setQ] = useState("");
  const [applied, setApplied] = useState("");

  const url = `/api/admin/products?${cat !== "all" ? `category=${cat}&` : ""}${
    applied ? `q=${encodeURIComponent(applied)}` : ""
  }`;
  const { data, error, loading, reload } = useApi<{ items: Row[] }>(url);

  return (
    <>
      <PageHead title="Products" sub="Prices, copy and photography for everything on the shop.">
        <Link href="/admin/products/new" className="btn btn-gold px-4 py-2 text-[0.82rem]">
          + New product
        </Link>
      </PageHead>

      <Toolbar>
        {CATS.map((c) => (
          <Chip key={c} active={cat === c} onClick={() => setCat(c)}>
            {c === "all" ? "All" : c}
          </Chip>
        ))}
        <form
          onSubmit={(e) => { e.preventDefault(); setApplied(q.trim()); }}
          className="ml-auto flex gap-2"
        >
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or slug"
            aria-label="Search products"
            className="field w-52 py-2 text-[0.82rem]"
          />
          <button className="btn btn-outline px-4 py-2 text-[0.8rem]">Search</button>
        </form>
      </Toolbar>

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorBox message={error} onRetry={reload} />
      ) : !data || data.items.length === 0 ? (
        <Empty>Nothing here yet.</Empty>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {data.items.map((p) => (
            <Link
              key={p._id}
              href={`/admin/products/${p._id}`}
              className="flex gap-3 rounded-xl border border-brand-900/8 bg-white p-3 transition hover:border-gold-500 hover:shadow-[0_16px_32px_-24px_rgba(11,61,46,0.5)]"
            >
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-brand-50">
                {p.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={`/api/media/${p.image}`} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div
                    className="h-full w-full"
                    style={{ background: `linear-gradient(135deg, ${p.art?.hues?.[0] ?? "#C9A227"}, ${p.art?.hues?.[1] ?? "#F0E1B4"})` }}
                    title="Drawn artwork — no photo uploaded"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[0.9rem] font-semibold text-brand-900">{p.name}</p>
                <p className="truncate font-mono text-[0.7rem] text-brand-700/50">{p.slug}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <span className="text-[0.85rem] font-semibold text-brand-900">{money(p.price)}</span>
                  {p.mrp ? <span className="text-[0.75rem] text-brand-700/45 line-through">{money(p.mrp)}</span> : null}
                  {!p.active && <Badge value="cancelled" label="archived" />}
                  {p.bestseller && <Badge value="paid" label="bestseller" />}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
