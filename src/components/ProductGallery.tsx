"use client";

import { useRef, useState } from "react";
import ProductArt from "./art/ProductArt";
import type { Category, Product } from "@/lib/catalog";

/**
 * Four views of the same piece, with a pointer-tracking zoom on the main frame
 * — the closest thing to picking a cake up and turning it around.
 */
export default function ProductGallery({
  product,
  category,
}: {
  product: Product;
  category: Category;
}) {
  const views = [
    { kind: product.art, hues: product.hues, seed: product.slug, label: "Front" },
    {
      kind: product.art,
      hues: [product.hues[1], product.hues[0]] as [string, string],
      seed: `${product.slug}-1`,
      label: "Alt colourway",
    },
    { kind: product.art, hues: category.hues, seed: `${product.slug}-2`, label: "Styled" },
    {
      kind: category.art,
      hues: ["#0B3D2E", "#EBD489"] as [string, string],
      seed: `${product.slug}-3`,
      label: "In the range",
    },
  ];

  const [active, setActive] = useState(0);
  const [zooming, setZooming] = useState(false);
  const frame = useRef<HTMLDivElement>(null);
  const [origin, setOrigin] = useState("50% 50%");

  function track(e: React.MouseEvent) {
    const el = frame.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
  }

  const view = views[active];

  return (
    <div>
      <div
        ref={frame}
        onMouseEnter={() => setZooming(true)}
        onMouseLeave={() => setZooming(false)}
        onMouseMove={track}
        className="relative overflow-hidden rounded-2xl border border-brand-800/10 bg-white"
      >
        <div
          key={active}
          className="animate-fade transition-transform duration-500 ease-out"
          style={{ transform: zooming ? "scale(1.55)" : "scale(1)", transformOrigin: origin }}
        >
          <ProductArt kind={view.kind} hues={view.hues} seed={view.seed} className="w-full" />
        </div>

        <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-brand-900/80 px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-gold-200 opacity-0 backdrop-blur transition-opacity duration-300 sm:opacity-100">
          Hover to zoom
        </span>
      </div>

      <div className="mt-3 grid grid-cols-4 gap-3">
        {views.map((v, i) => (
          <button
            key={v.label}
            onClick={() => setActive(i)}
            aria-label={v.label}
            aria-pressed={i === active}
            className={`overflow-hidden rounded-xl border bg-white transition duration-300 hover:-translate-y-0.5 ${
              i === active
                ? "border-gold-500 shadow-[0_0_0_3px_rgba(223,191,79,0.28)]"
                : "border-brand-800/10 hover:border-gold-400"
            }`}
          >
            <ProductArt kind={v.kind} hues={v.hues} seed={v.seed} className="w-full" />
          </button>
        ))}
      </div>
    </div>
  );
}
