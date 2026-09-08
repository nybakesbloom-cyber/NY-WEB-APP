"use client";

import Link from "next/link";
import { Suspense, useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import ProductArt from "@/components/art/ProductArt";
import { money } from "@/lib/format";
import { DELIVERY_SLOTS } from "@/lib/catalog";

type LastOrder = {
  orderId: string;
  total: number;
  count: number;
  date: string;
  slot: string;
};

const noopSubscribe = () => () => {};

function readLastOrder() {
  try {
    return window.sessionStorage.getItem("felicet-bloom-last-order");
  } catch {
    /* nothing stored — show the id from the URL only */
    return null;
  }
}

function Confirmation() {
  const params = useSearchParams();
  const id = params.get("id") ?? "FB000000";
  // Server-rendered HTML has no order, so the summary appears after hydration.
  const raw = useSyncExternalStore(noopSubscribe, readLastOrder, () => null);
  const order: LastOrder | null = raw ? (JSON.parse(raw) as LastOrder) : null;

  const slotLabel =
    DELIVERY_SLOTS.find((s) => s.id === order?.slot)?.label ?? "Standard (9 AM – 9 PM)";

  const steps = [
    ["Order received", "Just now"],
    ["In the kitchen / at the market", "From 5 AM on the delivery day"],
    ["Out for delivery", slotLabel],
    ["Handed over", "Photo sent to your phone"],
  ];

  return (
    <div className="wrap py-14">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mx-auto w-40">
          <ProductArt kind="combo" hues={["#A6122B", "#3E2417"]} seed="order-confirmed" className="w-full" />
        </div>

        <p className="eyebrow mt-6">Order {id}</p>
        <h1 className="mt-3 font-display text-[2.1rem] font-semibold leading-tight tracking-tight text-brand-900 sm:text-[2.6rem]">
          That&apos;s booked in.
        </h1>
        <div className="gold-rule mx-auto mt-4 w-32" />
        <p className="mx-auto mt-4 max-w-lg text-[0.95rem] leading-relaxed text-brand-700/75">
          A receipt is on its way to your email. We will send one message when it leaves the kitchen
          and another with a photo the moment it is handed over.
        </p>

        {order && (
          <dl className="mx-auto mt-8 grid max-w-lg grid-cols-3 gap-4 rounded-2xl border border-brand-800/10 bg-white p-6 text-left">
            <div>
              <dt className="text-[0.66rem] font-bold uppercase tracking-[0.16em] text-gold-600">Items</dt>
              <dd className="mt-1 font-display text-xl font-semibold text-brand-900">{order.count}</dd>
            </div>
            <div>
              <dt className="text-[0.66rem] font-bold uppercase tracking-[0.16em] text-gold-600">Paid</dt>
              <dd className="mt-1 font-display text-xl font-semibold text-brand-900">
                {money(order.total)}
              </dd>
            </div>
            <div>
              <dt className="text-[0.66rem] font-bold uppercase tracking-[0.16em] text-gold-600">Date</dt>
              <dd className="mt-1 font-display text-xl font-semibold text-brand-900">
                {new Date(order.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
              </dd>
            </div>
          </dl>
        )}

        <ol className="mx-auto mt-8 max-w-lg space-y-0 text-left">
          {steps.map(([title, note], i) => (
            <li key={title} className="flex gap-4">
              <div className="flex flex-col items-center">
                <span
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-[0.7rem] font-bold ${
                    i === 0 ? "bg-gold-500 text-brand-900" : "border border-brand-800/20 text-brand-700/50"
                  }`}
                >
                  {i + 1}
                </span>
                {i < steps.length - 1 && <span className="h-10 w-px bg-brand-800/15" />}
              </div>
              <div className="pb-2">
                <p className="text-[0.9rem] font-semibold text-brand-900">{title}</p>
                <p className="text-[0.78rem] text-brand-700/65">{note}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link href="/shop" className="btn btn-gold px-7 py-3">
            Send something else
          </Link>
          <Link href="/" className="btn btn-outline px-7 py-3">
            Back to home
          </Link>
        </div>

        <p className="mt-8 text-[0.74rem] text-brand-700/50">
          Demo storefront — no payment was taken and no order was placed.
        </p>
      </div>
    </div>
  );
}

export default function OrderConfirmedPage() {
  return (
    <Suspense fallback={<div className="wrap py-24 text-center text-brand-700/60">Loading…</div>}>
      <Confirmation />
    </Suspense>
  );
}
