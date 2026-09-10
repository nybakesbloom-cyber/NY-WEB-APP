"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ProductArt from "@/components/art/ProductArt";
import { useCart, unitPrice } from "@/components/CartProvider";
import { money } from "@/lib/format";
import { DELIVERY_SLOTS, FREE_DELIVERY_OVER, getProduct } from "@/lib/catalog";

const PAYMENTS = [
  { id: "upi", label: "UPI", note: "GPay, PhonePe, Paytm — you approve in your app" },
  { id: "card", label: "Card", note: "Visa, Mastercard, RuPay, Amex" },
  { id: "netbanking", label: "Net banking", note: "All major Indian banks" },
  { id: "cod", label: "Cash on delivery", note: "₹40 handling fee, not available for midnight slots" },
];

function todayISO(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

export default function CheckoutPage() {
  const { lines, ready, subtotal, count, clear } = useCart();
  const router = useRouter();

  const [slot, setSlot] = useState(DELIVERY_SLOTS[0].id);
  const [payment, setPayment] = useState("upi");
  const [date, setDate] = useState(todayISO());
  const [placing, setPlacing] = useState(false);

  const slotFee = DELIVERY_SLOTS.find((s) => s.id === slot)?.fee ?? 0;
  const codFee = payment === "cod" ? 40 : 0;
  const baseDelivery = subtotal >= FREE_DELIVERY_OVER ? 0 : 99;
  const total = subtotal + baseDelivery + slotFee + codFee;

  const midnightWithCod = slot === "midnight" && payment === "cod";

  function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    if (midnightWithCod) return;
    setPlacing(true);
    const orderId = `FB${Math.floor(100000 + Math.random() * 899999)}`;
    try {
      window.sessionStorage.setItem(
        "ny-bakes-and-bloom-last-order",
        JSON.stringify({ orderId, total, count, date, slot }),
      );
    } catch {
      /* storage unavailable — the confirmation page falls back to defaults */
    }
    window.setTimeout(() => {
      clear();
      router.push(`/order-confirmed?id=${orderId}`);
    }, 700);
  }

  if (ready && lines.length === 0 && !placing) {
    return (
      <div className="wrap py-24 text-center">
        <h1 className="font-display text-2xl font-semibold text-brand-900">
          There is nothing to check out.
        </h1>
        <Link href="/shop" className="btn btn-gold mt-6 px-7 py-3">
          Back to the shop
        </Link>
      </div>
    );
  }

  return (
    <div className="wrap py-10">
      <h1 className="font-display text-[2rem] font-semibold tracking-tight text-brand-900">
        Checkout
      </h1>
      <div className="gold-rule mt-3 w-24" />
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-brand-700/70">
        This is a demo storefront. Nothing is charged and no order is actually placed — but every
        field below is what we would genuinely ask for.
      </p>

      <form onSubmit={placeOrder} className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Panel step="01" title="Who is sending this">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Your name" name="sender" placeholder="Dinesh K" required />
              <Field label="Your mobile" name="senderPhone" type="tel" placeholder="98XXXXXX21" required pattern="[0-9]{10}" />
              <div className="sm:col-span-2">
                <Field label="Email for the receipt" name="email" type="email" placeholder="you@example.com" required />
              </div>
            </div>
          </Panel>

          <Panel step="02" title="Where it goes">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Recipient name" name="recipient" placeholder="Ananya R" required />
              <Field label="Recipient mobile" name="recipientPhone" type="tel" placeholder="99XXXXXX07" required pattern="[0-9]{10}" />
              <div className="sm:col-span-2">
                <Field label="Flat / house / building" name="line1" placeholder="B-702, Prestige Meridian" required />
              </div>
              <div className="sm:col-span-2">
                <Field label="Area / street" name="line2" placeholder="Indiranagar 2nd Stage" required />
              </div>
              <Field label="City" name="city" placeholder="Bengaluru" required />
              <Field label="PIN code" name="pin" placeholder="560038" required pattern="[0-9]{6}" />
              <div className="sm:col-span-2">
                <Field label="Landmark for the rider" name="landmark" placeholder="Opposite the Corner House" />
              </div>
            </div>
            <label className="mt-4 flex items-start gap-2.5 text-[0.84rem] text-brand-800/85">
              <input type="checkbox" className="mt-0.5 h-4 w-4 accent-[#C9A227]" />
              Keep it a surprise — do not tell the recipient who it is from until they open the card.
            </label>
          </Panel>

          <Panel step="03" title="When it arrives">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-[0.78rem] font-semibold text-brand-800">
                  Delivery date
                </span>
                <input
                  type="date"
                  value={date}
                  min={todayISO()}
                  max={todayISO(60)}
                  onChange={(e) => setDate(e.target.value)}
                  className="field"
                  required
                />
              </label>
            </div>

            <div className="mt-4 space-y-2">
              {DELIVERY_SLOTS.map((s) => (
                <Choice
                  key={s.id}
                  name="slot"
                  checked={slot === s.id}
                  onChange={() => setSlot(s.id)}
                  title={s.label}
                  note={s.fee === 0 ? "Included" : `+ ${money(s.fee)}`}
                />
              ))}
            </div>
          </Panel>

          <Panel step="04" title="How you'll pay">
            <div className="space-y-2">
              {PAYMENTS.map((p) => (
                <Choice
                  key={p.id}
                  name="payment"
                  checked={payment === p.id}
                  onChange={() => setPayment(p.id)}
                  title={p.label}
                  note={p.note}
                />
              ))}
            </div>
            {midnightWithCod && (
              <p className="mt-3 rounded-lg border border-red-300 bg-red-50 px-3.5 py-2.5 text-[0.82rem] text-red-800">
                Cash on delivery is not available for the midnight slot. Pick another slot or another
                payment method.
              </p>
            )}
          </Panel>
        </div>

        {/* ------------------------------------------------------- summary */}
        <aside className="lg:sticky lg:top-[150px] lg:self-start">
          <div className="rounded-2xl border border-brand-800/10 bg-white p-6">
            <h2 className="font-display text-xl font-semibold text-brand-900">Your order</h2>
            <div className="gold-rule mt-3" />

            <ul className="mt-5 space-y-3">
              {lines.map((l) => {
                const p = getProduct(l.slug)!;
                return (
                  <li key={l.id} className="flex items-center gap-3">
                    <div className="w-12 shrink-0 overflow-hidden rounded-lg">
                      <ProductArt kind={p.art} hues={p.hues} seed={p.slug} className="w-full" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[0.84rem] font-semibold text-brand-900">{p.name}</p>
                      <p className="truncate text-[0.74rem] text-brand-700/65">
                        {l.variant} × {l.qty}
                      </p>
                    </div>
                    <p className="text-[0.84rem] font-semibold text-brand-900">
                      {money(unitPrice(l) * l.qty)}
                    </p>
                  </li>
                );
              })}
            </ul>

            <dl className="mt-5 space-y-2.5 border-t border-brand-800/10 pt-4 text-[0.86rem]">
              <SummaryRow label="Subtotal" value={money(subtotal)} />
              <SummaryRow label="Delivery" value={baseDelivery === 0 ? "Free" : money(baseDelivery)} />
              {slotFee > 0 && <SummaryRow label="Slot charge" value={money(slotFee)} />}
              {codFee > 0 && <SummaryRow label="COD handling" value={money(codFee)} />}
              <div className="border-t border-brand-800/10 pt-3">
                <div className="flex items-baseline justify-between">
                  <dt className="font-display text-lg font-semibold text-brand-900">To pay</dt>
                  <dd className="font-display text-xl font-semibold text-brand-900">{money(total)}</dd>
                </div>
              </div>
            </dl>

            <button
              type="submit"
              disabled={placing || midnightWithCod}
              className="btn btn-gold mt-6 w-full py-3.5"
            >
              {placing ? "Placing your order…" : `Place order · ${money(total)}`}
            </button>

            <p className="mt-3 text-center text-[0.72rem] leading-relaxed text-brand-700/55">
              By placing the order you accept our substitution policy for flowers.
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}

function Panel({
  step,
  title,
  children,
}: {
  step: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-brand-800/10 bg-white p-6">
      <div className="mb-5 flex items-center gap-3">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-800 text-[0.72rem] font-bold text-gold-300">
          {step}
        </span>
        <h2 className="font-display text-xl font-semibold text-brand-900">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  name,
  ...rest
}: { label: string; name: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[0.78rem] font-semibold text-brand-800">{label}</span>
      <input name={name} className="field" {...rest} />
    </label>
  );
}

function Choice({
  name,
  checked,
  onChange,
  title,
  note,
}: {
  name: string;
  checked: boolean;
  onChange: () => void;
  title: string;
  note: string;
}) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition ${
        checked
          ? "border-gold-500 bg-gold-50 shadow-[0_0_0_3px_rgba(223,191,79,0.22)]"
          : "border-brand-800/12 bg-white hover:border-gold-400"
      }`}
    >
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 accent-[#C9A227]"
      />
      <span className="flex-1">
        <span className="block text-[0.88rem] font-semibold text-brand-900">{title}</span>
        <span className="block text-[0.76rem] text-brand-700/65">{note}</span>
      </span>
    </label>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <dt className="text-brand-700/80">{label}</dt>
      <dd className="font-semibold text-brand-900">{value}</dd>
    </div>
  );
}
