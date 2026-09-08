"use client";

import ProductArt from "./art/ProductArt";
import { useCart, unitPrice } from "./CartProvider";
import { money } from "@/lib/format";
import { getProduct } from "@/lib/catalog";

/** Confirms an add-to-cart without yanking the shopper off the page. */
export default function CartToast() {
  const { toast, dismissToast, openDrawer, drawerOpen } = useCart();
  if (!toast || drawerOpen) return null;

  const product = getProduct(toast.slug);
  if (!product) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pop-in fixed bottom-24 left-1/2 z-[90] md:bottom-5 w-[calc(100%-2rem)] max-w-[380px] -translate-x-1/2 sm:left-auto sm:right-5 sm:translate-x-0"
    >
      <div className="flex items-center gap-3 rounded-2xl border border-gold-400/50 bg-white p-3 shadow-[0_26px_54px_-22px_rgba(11,61,46,0.6)]">
        <div className="w-14 shrink-0 overflow-hidden rounded-xl">
          <ProductArt kind={product.art} hues={product.hues} seed={product.slug} className="w-full" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-brand-600">
            <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="currentColor">
              <path d="M8 13.4 4.6 10l-1.2 1.2L8 15.8 17 6.8 15.8 5.6 8 13.4Z" />
            </svg>
            Added to cart
          </p>
          <p className="truncate text-[0.88rem] font-semibold text-brand-900">{product.name}</p>
          <p className="truncate text-[0.74rem] text-brand-700/65">
            {toast.variant} · {money(unitPrice(toast) * toast.qty)}
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-1.5">
          <button onClick={openDrawer} className="btn btn-gold px-3.5 py-1.5 text-[0.76rem]">
            View cart
          </button>
          <button
            onClick={dismissToast}
            className="text-[0.72rem] font-semibold text-brand-700/60 hover:text-brand-900"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
