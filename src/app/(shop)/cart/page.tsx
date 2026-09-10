"use client";

import Link from "next/link";
import ProductArt from "@/components/art/ProductArt";
import ProductImage from "@/components/ProductImage";
import { useCart, unitPrice } from "@/components/CartProvider";
import { money } from "@/lib/format";
import { useStore } from "@/components/StoreProvider";

export default function CartPage() {
  const { getProduct, settings } = useStore();
  const { lines, ready, subtotal, setQty, remove, count } = useCart();
  const delivery =
    subtotal === 0 || subtotal >= settings.freeDeliveryOver ? 0 : settings.deliveryFee;
  const total = subtotal + delivery;

  if (!ready) {
    return (
      <div className="wrap py-24 text-center text-brand-700/60">Loading your cart…</div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="wrap py-20">
        <div className="mx-auto max-w-md rounded-2xl border border-brand-800/10 bg-white p-10 text-center">
          <div className="mx-auto w-40">
            <ProductArt kind="bouquet" hues={["#B9DCC9", "#F2F8F4"]} seed="empty-cart" className="w-full" />
          </div>
          <h1 className="mt-4 font-display text-2xl font-semibold text-brand-900">
            Nothing in the cart yet
          </h1>
          <p className="mt-2 text-[0.9rem] leading-relaxed text-brand-700/70">
            Have a look at what is going out of the kitchen today.
          </p>
          <Link href="/shop" className="btn btn-gold mt-6 px-7 py-3">
            Start shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="wrap py-10">
      <h1 className="font-display text-[2rem] font-semibold tracking-tight text-brand-900">
        Your cart
      </h1>
      <div className="gold-rule mt-3 w-24" />
      <p className="mt-3 text-sm text-brand-700/70">
        {count} {count === 1 ? "item" : "items"} · prices include tax
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <ul className="space-y-4">
          {lines.map((line) => {
            const product = getProduct(line.slug)!;
            const price = unitPrice(line, product);
            return (
              <li
                key={line.id}
                className="flex gap-4 rounded-2xl border border-brand-800/10 bg-white p-4"
              >
                <Link href={`/product/${product.slug}`} className="w-24 shrink-0 overflow-hidden rounded-xl sm:w-32">
                  <ProductImage product={product} sizes="128px" className="w-full" />
                </Link>

                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        href={`/product/${product.slug}`}
                        className="font-display text-lg font-semibold text-brand-900 hover:text-gold-700"
                      >
                        {product.name}
                      </Link>
                      <p className="mt-0.5 text-[0.8rem] text-brand-700/70">
                        {line.variant}
                        {line.flavour ? ` · ${line.flavour}` : ""}
                      </p>
                      {line.message && (
                        <p className="mt-1 truncate text-[0.78rem] italic text-gold-700">
                          “{line.message}”
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => remove(line.id)}
                      className="shrink-0 rounded-lg p-1.5 text-brand-700/50 transition hover:bg-brand-50 hover:text-brand-900"
                      aria-label={`Remove ${product.name}`}
                    >
                      <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" style={{ height: 18, width: 18 }} fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>

                  <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
                    <div className="flex items-center rounded-full border border-brand-800/15">
                      <button
                        onClick={() => setQty(line.id, line.qty - 1)}
                        className="grid h-9 w-9 place-items-center text-brand-800"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm font-semibold text-brand-900">
                        {line.qty}
                      </span>
                      <button
                        onClick={() => setQty(line.id, line.qty + 1)}
                        className="grid h-9 w-9 place-items-center text-brand-800 disabled:opacity-30"
                        disabled={line.qty >= 20}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    <p className="font-display text-lg font-semibold text-brand-900">
                      {money(price * line.qty)}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <aside className="lg:sticky lg:top-[150px] lg:self-start">
          <div className="rounded-2xl border border-brand-800/10 bg-white p-6">
            <h2 className="font-display text-xl font-semibold text-brand-900">Order summary</h2>
            <div className="gold-rule mt-3" />
            <dl className="mt-5 space-y-3 text-sm">
              <Row label={`Subtotal (${count})`} value={money(subtotal)} />
              <Row
                label="Delivery"
                value={delivery === 0 ? "Free" : money(delivery)}
                accent={delivery === 0}
              />
              {delivery > 0 && (
                <p className="rounded-lg bg-gold-50 px-3 py-2 text-[0.76rem] leading-relaxed text-gold-700">
                  Add {money(settings.freeDeliveryOver - subtotal)} more and delivery is on us.
                </p>
              )}
              <div className="border-t border-brand-800/10 pt-3">
                <Row label="Total" value={money(total)} big />
              </div>
            </dl>

            <Link href="/checkout" className="btn btn-gold mt-6 w-full py-3.5">
              Proceed to checkout
            </Link>
            <Link
              href="/shop"
              className="mt-3 block text-center text-[0.82rem] font-semibold text-brand-700 hover:text-gold-700"
            >
              Continue shopping
            </Link>
          </div>

          <div className="mt-4 rounded-2xl border border-gold-400/40 bg-gold-50 p-5 text-[0.82rem] leading-relaxed text-brand-800/85">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-gold-700">
              Delivery windows
            </p>
            <p className="mt-2">
              Same-day cut-off is 6 PM. Midnight slots close at 8 PM. Everything is baked or wrapped
              after the cut-off, not before.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  big,
  accent,
}: {
  label: string;
  value: string;
  big?: boolean;
  accent?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className={big ? "font-display text-lg font-semibold text-brand-900" : "text-brand-700/80"}>
        {label}
      </dt>
      <dd
        className={
          big
            ? "font-display text-xl font-semibold text-brand-900"
            : accent
              ? "font-semibold text-brand-600"
              : "font-semibold text-brand-900"
        }
      >
        {value}
      </dd>
    </div>
  );
}
