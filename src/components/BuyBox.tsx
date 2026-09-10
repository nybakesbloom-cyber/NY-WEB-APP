"use client";

import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useCart } from "./CartProvider";
import { money } from "@/lib/format";
import { productPrice, type Product } from "@/lib/catalog";
import { useStore } from "./StoreProvider";

const noopSubscribe = () => () => {};

export default function BuyBox({ product }: { product: Product }) {
  const { settings } = useStore();
  const { add } = useCart();
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const router = useRouter();

  const [variant, setVariant] = useState(product.variants[0].label);
  const [flavour, setFlavour] = useState(product.flavours?.[0]);
  const [message, setMessage] = useState("");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const price = productPrice(product, variant);
  const line = { slug: product.slug, variant, flavour, message: message.trim() || undefined, qty };

  function addToCart() {
    add(line);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  }

  function buyNow() {
    add(line);
    router.push("/checkout");
  }

  return (
    <div className="mt-7 space-y-6">
      {/* variants */}
      <fieldset>
        <legend className="mb-2.5 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-gold-600">
          {product.category === "cakes" || product.category === "combos" ? "Weight" : "Size"}
        </legend>
        <div className="flex flex-wrap gap-2">
          {product.variants.map((v) => {
            const on = v.label === variant;
            return (
              <button
                key={v.label}
                onClick={() => setVariant(v.label)}
                aria-pressed={on}
                className={`rounded-xl border px-4 py-2.5 text-left text-sm transition ${
                  on
                    ? "border-gold-500 bg-gold-50 text-brand-900 shadow-[0_0_0_3px_rgba(223,191,79,0.25)]"
                    : "border-brand-800/15 bg-white text-brand-800 hover:border-gold-400"
                }`}
              >
                <span className="block font-semibold">{v.label}</span>
                <span className="block text-[0.76rem] text-brand-700/65">
                  {money(product.price + v.delta)}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* flavour */}
      {product.flavours && (
        <fieldset>
          <legend className="mb-2.5 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-gold-600">
            Flavour
          </legend>
          <div className="flex flex-wrap gap-2">
            {product.flavours.map((f) => {
              const on = f === flavour;
              return (
                <button
                  key={f}
                  onClick={() => setFlavour(f)}
                  aria-pressed={on}
                  className={`rounded-full border px-4 py-2 text-[0.82rem] font-medium transition ${
                    on
                      ? "border-brand-700 bg-brand-800 text-gold-100"
                      : "border-brand-800/15 bg-white text-brand-800 hover:border-gold-400"
                  }`}
                >
                  {f}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      {/* message */}
      <div>
        <label
          htmlFor="msg"
          className="mb-2 block text-[0.68rem] font-bold uppercase tracking-[0.2em] text-gold-600"
        >
          {product.category === "cakes" ? "Message to pipe on top" : "Message for the card"}
          <span className="ml-2 font-normal normal-case tracking-normal text-brand-700/50">
            optional, free
          </span>
        </label>
        <input
          id="msg"
          value={message}
          maxLength={40}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={product.category === "cakes" ? "Happy Birthday, Ammu" : "Congratulations — from all of us"}
          className="field"
        />
        <p className="mt-1.5 text-[0.72rem] text-brand-700/50">{message.length}/40 characters</p>
      </div>

      {/* qty + price */}
      <div className="flex flex-wrap items-center gap-5 border-y border-brand-800/10 py-5">
        <div className="flex items-center rounded-full border border-brand-800/15 bg-white">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="grid h-10 w-10 place-items-center text-lg text-brand-800 disabled:opacity-30"
            disabled={qty <= 1}
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="w-9 text-center font-semibold text-brand-900">{qty}</span>
          <button
            onClick={() => setQty((q) => Math.min(20, q + 1))}
            className="grid h-10 w-10 place-items-center text-lg text-brand-800 disabled:opacity-30"
            disabled={qty >= 20}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
        <div>
          <p className="font-display text-[1.6rem] font-semibold leading-none text-brand-900">
            {money(price * qty)}
          </p>
          <p className="mt-1 text-[0.74rem] text-brand-700/60">
            {price * qty >= settings.freeDeliveryOver
              ? "Free standard delivery included"
              : `${money(settings.freeDeliveryOver - price * qty)} more for free delivery`}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={addToCart}
          className={`btn flex-1 px-6 py-3.5 transition-transform hover:-translate-y-0.5 ${
            added ? "btn-emerald" : "btn-outline"
          }`}
        >
          {added ? "Added to cart ✓" : "Add to cart"}
        </button>
        <button onClick={buyNow} className="btn btn-gold sheen flex-1 px-6 py-3.5">
          <span className="relative z-10">Buy now</span>
        </button>
      </div>

      {/* Phone-sized screens keep the price and the action in reach. Portalled
          to <body> so no transformed ancestor can capture the fixed position. */}
      {mounted &&
        createPortal(
          <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-brand-800/10 bg-cream/95 px-4 py-3 backdrop-blur-md md:hidden">
            <div className="min-w-0 flex-1">
              <p className="truncate text-[0.72rem] text-brand-700/65">
                {variant}
                {flavour ? ` · ${flavour}` : ""}
              </p>
              <p className="font-display text-lg font-semibold leading-none text-brand-900">
                {money(price * qty)}
              </p>
            </div>
            <button onClick={addToCart} className="btn btn-outline px-4 py-2.5 text-[0.82rem]">
              {added ? "Added ✓" : "Add"}
            </button>
            <button onClick={buyNow} className="btn btn-gold px-5 py-2.5 text-[0.82rem]">
              Buy now
            </button>
          </div>,
          document.body,
        )}
      <div className="h-16 md:hidden" aria-hidden="true" />
    </div>
  );
}
