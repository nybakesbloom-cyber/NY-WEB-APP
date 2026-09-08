"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import ProductArt from "./art/ProductArt";
import { useCart, unitPrice } from "./CartProvider";
import { money } from "@/lib/format";
import { FREE_DELIVERY_OVER, getProduct } from "@/lib/catalog";

export default function CartDrawer() {
  const { drawerOpen, closeDrawer, lines, subtotal, count, setQty, remove } = useCart();
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!drawerOpen) return;
    panel.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [drawerOpen, closeDrawer]);

  if (!drawerOpen) return null;

  const toFree = FREE_DELIVERY_OVER - subtotal;
  const progress = Math.min(100, (subtotal / FREE_DELIVERY_OVER) * 100);

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label="Your cart">
      <button
        onClick={closeDrawer}
        aria-label="Close cart"
        className="animate-fade absolute inset-0 cursor-default bg-brand-900/45 backdrop-blur-[3px]"
      />

      <div
        ref={panel}
        tabIndex={-1}
        style={{ animation: "slide-in-right 0.34s cubic-bezier(0.22,1,0.36,1) both" }}
        className="absolute right-0 top-0 flex h-full w-full max-w-[420px] flex-col bg-cream shadow-[-30px_0_60px_-30px_rgba(0,0,0,0.5)] outline-none"
      >
        <header className="flex items-center justify-between border-b border-brand-800/10 bg-white px-5 py-4">
          <div>
            <h2 className="font-display text-xl font-semibold text-brand-900">Your cart</h2>
            <p className="text-[0.76rem] text-brand-700/60">
              {count} {count === 1 ? "item" : "items"}
            </p>
          </div>
          <button
            onClick={closeDrawer}
            aria-label="Close cart"
            className="grid h-9 w-9 place-items-center rounded-full border border-brand-800/12 text-brand-800 transition hover:border-gold-500"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        {lines.length > 0 && (
          <div className="border-b border-brand-800/10 bg-gold-50 px-5 py-3">
            <p className="text-[0.76rem] font-medium text-brand-800">
              {toFree > 0 ? (
                <>
                  Add <strong>{money(toFree)}</strong> more for free delivery
                </>
              ) : (
                <>Free delivery unlocked ✓</>
              )}
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gold-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-gold-400 to-gold-600 transition-[width] duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {lines.length === 0 ? (
            <div className="pt-10 text-center">
              <div className="mx-auto w-32 opacity-80">
                <ProductArt kind="bouquet" hues={["#B9DCC9", "#F2F8F4"]} seed="drawer-empty" className="w-full" />
              </div>
              <p className="mt-4 font-display text-lg font-semibold text-brand-900">
                Nothing here yet
              </p>
              <Link href="/shop" onClick={closeDrawer} className="btn btn-gold mt-5 px-6 py-2.5 text-sm">
                Browse the shop
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {lines.map((line, i) => {
                const product = getProduct(line.slug)!;
                return (
                  <li
                    key={line.id}
                    className="pop-in flex gap-3 rounded-xl border border-brand-800/10 bg-white p-3"
                    style={{ animationDelay: `${i * 45}ms` }}
                  >
                    <Link
                      href={`/product/${product.slug}`}
                      onClick={closeDrawer}
                      className="w-16 shrink-0 overflow-hidden rounded-lg"
                    >
                      <ProductArt kind={product.art} hues={product.hues} seed={product.slug} className="w-full" />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[0.88rem] font-semibold text-brand-900">
                        {product.name}
                      </p>
                      <p className="truncate text-[0.72rem] text-brand-700/65">
                        {line.variant}
                        {line.flavour ? ` · ${line.flavour}` : ""}
                      </p>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <div className="flex items-center rounded-full border border-brand-800/15">
                          <button
                            onClick={() => setQty(line.id, line.qty - 1)}
                            className="grid h-7 w-7 place-items-center text-brand-800"
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span className="w-6 text-center text-[0.8rem] font-semibold">{line.qty}</span>
                          <button
                            onClick={() => setQty(line.id, line.qty + 1)}
                            className="grid h-7 w-7 place-items-center text-brand-800 disabled:opacity-30"
                            disabled={line.qty >= 20}
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-[0.86rem] font-semibold text-brand-900">
                          {money(unitPrice(line) * line.qty)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => remove(line.id)}
                      aria-label={`Remove ${product.name}`}
                      className="self-start rounded p-1 text-brand-700/45 transition hover:text-brand-900"
                    >
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                      </svg>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {lines.length > 0 && (
          <footer className="border-t border-brand-800/10 bg-white px-5 py-4">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-brand-700/80">Subtotal</span>
              <span className="font-display text-xl font-semibold text-brand-900">
                {money(subtotal)}
              </span>
            </div>
            <Link href="/checkout" onClick={closeDrawer} className="btn btn-gold mt-4 w-full py-3">
              Checkout
            </Link>
            <Link
              href="/cart"
              onClick={closeDrawer}
              className="mt-2 block py-1 text-center text-[0.82rem] font-semibold text-brand-700 hover:text-gold-700"
            >
              View full cart
            </Link>
          </footer>
        )}
      </div>
    </div>
  );
}
