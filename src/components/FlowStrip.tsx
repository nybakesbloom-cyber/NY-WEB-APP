import Link from "next/link";
import ProductImage from "./ProductImage";
import type { Product } from "@/lib/catalog";

/**
 * An endless ribbon of product art drifting across the page. The track holds
 * the list twice and translates exactly -50%, so the loop is seamless; hovering
 * pauses it and the edges are masked so nothing pops in at the boundary.
 */
export default function FlowStrip({
  products,
  reverse,
  duration = 62,
  size = "w-[190px] sm:w-[230px]",
}: {
  products: Product[];
  reverse?: boolean;
  duration?: number;
  size?: string;
}) {
  const run = [...products, ...products];

  return (
    <div className="flow flow-mask overflow-hidden">
      <div
        className="flow-track gap-4"
        data-dir={reverse ? "reverse" : undefined}
        style={{ "--flow-duration": `${duration}s` } as React.CSSProperties}
      >
        {run.map((p, i) => (
          <Link
            key={`${p.slug}-${i}`}
            href={`/product/${p.slug}`}
            aria-hidden={i >= products.length}
            tabIndex={i >= products.length ? -1 : undefined}
            className={`group relative shrink-0 ${size}`}
          >
            <div className="overflow-hidden rounded-2xl border border-gold-400/25 bg-white shadow-[0_18px_36px_-26px_rgba(11,61,46,0.6)] transition duration-500 group-hover:border-gold-500 group-hover:shadow-[0_26px_48px_-24px_rgba(11,61,46,0.6)]">
              <ProductImage
                product={p}
                sizes="230px"
                className="w-full transition duration-700 group-hover:scale-110"
              />
              <div className="flex items-center justify-between gap-2 border-t border-brand-800/8 px-3 py-2.5">
                <span className="truncate font-display text-[0.86rem] font-semibold text-brand-900">
                  {p.name}
                </span>
                <span className="shrink-0 text-[0.78rem] font-bold text-gold-700">
                  ₹{p.price.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
