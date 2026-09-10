"use client";

import Link from "next/link";
import { useState } from "react";
import ProductImage from "./ProductImage";
import Stars from "./Stars";
import { useCart } from "./CartProvider";
import { money, discountPct } from "@/lib/format";
import type { Product } from "@/lib/catalog";

export default function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const off = discountPct(product.price, product.mrp);

  function quickAdd(e: React.MouseEvent) {
    e.preventDefault();
    add({
      slug: product.slug,
      variant: product.variants[0].label,
      flavour: product.flavours?.[0],
      qty: 1,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  }

  return (
    <Link
      href={`/product/${product.slug}`}
      className="card group flex h-full flex-col"
    >
      <div className="relative">
        <ProductImage
          product={product}
          className="aspect-square w-full transition duration-500 group-hover:scale-[1.04]"
        />

        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {product.bestseller && (
            <span className="rounded-full bg-brand-800 px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-[0.14em] text-gold-200">
              Bestseller
            </span>
          )}
          {off > 0 && (
            <span className="rounded-full bg-gold-500 px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-[0.14em] text-brand-900">
              {off}% off
            </span>
          )}
        </div>

        <div className="absolute right-3 top-3 flex flex-col items-end gap-1.5">
          {product.eggless && (
            <span className="rounded-full border border-brand-500/40 bg-white/90 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-brand-600">
              Eggless
            </span>
          )}
          {product.sameDay && (
            <span className="rounded-full border border-gold-500/50 bg-white/90 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-gold-700">
              Same day
            </span>
          )}
        </div>

        <button
          onClick={quickAdd}
          className={`btn absolute bottom-3 left-1/2 w-[calc(100%-1.5rem)] -translate-x-1/2 px-4 py-2.5 text-sm opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100 ${
            added ? "btn-emerald" : "btn-gold"
          }`}
        >
          {added ? "Added to cart ✓" : "Quick add"}
        </button>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-[1.05rem] font-semibold leading-snug text-brand-900">
          {product.name}
        </h3>
        <p className="mt-1 line-clamp-2 text-[0.82rem] leading-relaxed text-brand-700/75">
          {product.tagline}
        </p>

        <div className="mt-2 flex items-center gap-1.5 text-[0.75rem] text-brand-700/70">
          <Stars rating={product.rating} />
          <span className="font-semibold text-brand-800">{product.rating}</span>
          <span>({product.reviews.toLocaleString("en-IN")})</span>
        </div>

        <div className="mt-auto flex items-baseline gap-2 pt-3">
          <span className="font-display text-xl font-semibold text-brand-900">
            {money(product.price)}
          </span>
          {product.mrp && (
            <span className="text-sm text-brand-700/50 line-through">{money(product.mrp)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
