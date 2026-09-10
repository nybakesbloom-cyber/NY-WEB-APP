"use client";

import Link from "next/link";
import { use, useState } from "react";
import { money } from "@/lib/format";
import {
  nextStatuses, STATUS_LABEL, CHANNEL_LABEL, PAYMENT_LABEL,
  type OrderStatus, type Channel, type PaymentStatus,
} from "@/lib/orders";
import { useApi, send, PageHead, Panel, Badge, Field, Loading, ErrorBox } from "@/components/admin/ui";

type Order = {
  _id: string;
  number: string;
  status: OrderStatus;
  channel: Channel;
  paymentStatus: PaymentStatus;
  amountPaid: number;
  lines: { slug: string; name: string; variant: string; flavour: string; message: string; qty: number; unitPrice: number }[];
  subtotal: number; deliveryFee: number; slotFee: number; codFee: number; total: number;
  sender: { name: string; phone: string; email: string };
  recipient: { name: string; phone: string };
  address: { line1: string; line2: string; city: string; pin: string; landmark: string };
  deliveryDate: string; slot: string; payment: string; surprise: boolean;
  notes: string;
  statusHistory: { status: OrderStatus; at: string; note: string }[];
  createdAt: string;
};

type Txn = {
  _id: string; kind: string; method: string; amount: number;
  status: string; reference: string; note: string; createdAt: string;
};

export default function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, error, loading, reload } = useApi<{ item: Order; transactions: Txn[] }>(
    `/api/admin/orders/${id}`,
  );

  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [notes, setNotes] = useState<string | null>(null);

  if (loading) return <Loading />;
  if (error) return <ErrorBox message={error} onRetry={reload} />;
  if (!data) return null;

  const o = data.item;
  const allowed = nextStatuses(o.status, o.channel);

  async function move(status: OrderStatus) {
    setBusy(true);
    setProblem(null);
    try {
      await send(`/api/admin/orders/${id}`, "PATCH", { status });
      await reload();
    } catch (err) {
      setProblem(err instanceof Error ? err.message : "Could not update the order");
    } finally {
      setBusy(false);
    }
  }

  async function saveNotes() {
    setBusy(true);
    setProblem(null);
    try {
      await send(`/api/admin/orders/${id}`, "PATCH", { notes: notes ?? "" });
      await reload();
      setNotes(null);
    } catch (err) {
      setProblem(err instanceof Error ? err.message : "Could not save the note");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHead title={`Order ${o.number}`} sub={`Placed ${new Date(o.createdAt).toLocaleString("en-IN")}`}>
        <Link href="/admin/orders" className="btn btn-outline px-4 py-2 text-[0.82rem]">
          ← All orders
        </Link>
      </PageHead>

      {problem && (
        <p role="alert" className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-[0.85rem] text-red-800">
          {problem}
        </p>
      )}

      <Panel className="mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <Badge value={o.status} label={STATUS_LABEL[o.status] ?? o.status} />
          <Badge value={o.paymentStatus} label={PAYMENT_LABEL[o.paymentStatus] ?? "Unpaid"} />
          <span className="rounded-full border border-brand-900/12 px-2.5 py-1 text-[0.66rem] font-bold uppercase tracking-[0.1em] text-brand-700">
            {CHANNEL_LABEL[o.channel] ?? "Online"}
          </span>
          {allowed.length === 0 ? (
            <span className="text-[0.84rem] text-brand-700/60">
              This order is final — nothing more to do.
            </span>
          ) : (
            <>
              <span className="text-[0.8rem] text-brand-700/60">Move to</span>
              {allowed.map((s) => (
                <button
                  key={s}
                  disabled={busy}
                  onClick={() => move(s)}
                  className={`btn px-4 py-2 text-[0.82rem] ${
                    s === "cancelled" ? "btn-outline text-red-700" : "btn-gold"
                  }`}
                >
                  {STATUS_LABEL[s]}
                </button>
              ))}
            </>
          )}
        </div>
      </Panel>

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-4">
          <Panel title="What was ordered">
            {o.lines.map((l, i) => (
              <div key={i} className="flex items-start justify-between gap-4 border-b border-brand-900/6 py-2.5 first:pt-0 last:border-0 last:pb-0">
                <div className="min-w-0">
                  <p className="text-[0.9rem] font-semibold text-brand-900">
                    {l.name} <span className="font-normal text-brand-700/60">×{l.qty}</span>
                  </p>
                  <p className="text-[0.78rem] text-brand-700/70">
                    {[l.variant, l.flavour].filter(Boolean).join(" · ")}
                  </p>
                  {l.message && (
                    <p className="mt-1 rounded bg-gold-50 px-2 py-1 text-[0.78rem] italic text-gold-800">
                      “{l.message}”
                    </p>
                  )}
                </div>
                <p className="shrink-0 font-semibold text-brand-900">{money(l.unitPrice * l.qty)}</p>
              </div>
            ))}

            <dl className="mt-4 space-y-1.5 border-t border-brand-900/8 pt-3 text-[0.85rem]">
              {([
                ["Subtotal", o.subtotal],
                ["Delivery", o.deliveryFee],
                ["Slot charge", o.slotFee],
                ["COD handling", o.codFee],
              ] as const)
                .filter(([, v]) => v > 0 || true)
                .map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <dt className="text-brand-700/75">{k}</dt>
                    <dd className="font-medium text-brand-900">{v === 0 ? "—" : money(v)}</dd>
                  </div>
                ))}
              <div className="flex justify-between border-t border-brand-900/8 pt-2">
                <dt className="font-display text-base font-semibold text-brand-900">Total</dt>
                <dd className="font-display text-lg font-semibold text-brand-900">{money(o.total)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-brand-700/75">Collected</dt>
                <dd className={o.amountPaid >= o.total ? "font-semibold text-emerald-700" : "font-semibold text-amber-700"}>
                  {money(o.amountPaid ?? 0)}
                  {o.amountPaid < o.total && ` · ${money(o.total - (o.amountPaid ?? 0))} outstanding`}
                </dd>
              </div>
            </dl>
          </Panel>

          <Panel title="Payments">
            {data.transactions.length === 0 ? (
              <p className="text-[0.85rem] text-brand-700/60">Nothing recorded against this order.</p>
            ) : (
              data.transactions.map((t) => (
                <div key={t._id} className="flex items-center justify-between gap-3 border-b border-brand-900/6 py-2.5 first:pt-0 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2.5">
                    <Badge value={t.kind} />
                    <Badge value={t.status} />
                    <span className="text-[0.78rem] uppercase text-brand-700/70">{t.method}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-brand-900">{money(t.amount)}</p>
                    <p className="text-[0.7rem] text-brand-700/55">
                      {new Date(t.createdAt).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                </div>
              ))
            )}
            <Link href={`/admin/billing?q=${o.number}`} className="btn btn-outline mt-4 px-4 py-2 text-[0.8rem]">
              Record a payment or refund
            </Link>
          </Panel>

          <Panel title="History">
            <ol className="space-y-2.5">
              {o.statusHistory.map((h, i) => (
                <li key={i} className="flex items-baseline gap-3 text-[0.84rem]">
                  <span className="w-36 shrink-0 font-mono text-[0.72rem] text-brand-700/55">
                    {new Date(h.at).toLocaleString("en-IN")}
                  </span>
                  <Badge value={h.status} label={STATUS_LABEL[h.status]} />
                  <span className="text-brand-700/70">{h.note}</span>
                </li>
              ))}
            </ol>
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel title="Deliver to">
            <p className="text-[0.95rem] font-semibold text-brand-900">{o.recipient?.name}</p>
            <p className="text-[0.85rem] text-brand-700/80">{o.recipient?.phone}</p>
            <address className="mt-3 not-italic text-[0.85rem] leading-relaxed text-brand-800/85">
              {o.address?.line1}
              <br />
              {o.address?.line2}
              <br />
              {o.address?.city} {o.address?.pin}
              {o.address?.landmark && (
                <>
                  <br />
                  <span className="text-brand-700/60">Landmark: {o.address.landmark}</span>
                </>
              )}
            </address>
            <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-brand-900/8 pt-3 text-[0.82rem]">
              <div>
                <dt className="text-[0.66rem] font-bold uppercase tracking-[0.14em] text-gold-700">Date</dt>
                <dd className="mt-0.5 text-brand-900">{o.deliveryDate || "—"}</dd>
              </div>
              <div>
                <dt className="text-[0.66rem] font-bold uppercase tracking-[0.14em] text-gold-700">Slot</dt>
                <dd className="mt-0.5 text-brand-900">{o.slot}</dd>
              </div>
            </dl>
            {o.surprise && (
              <p className="mt-3 rounded-lg bg-gold-50 px-3 py-2 text-[0.78rem] text-gold-800">
                Keep it a surprise — do not name the sender at the door.
              </p>
            )}
          </Panel>

          <Panel title="From">
            <p className="text-[0.9rem] font-semibold text-brand-900">{o.sender?.name}</p>
            <p className="text-[0.85rem] text-brand-700/80">{o.sender?.phone}</p>
            <p className="truncate text-[0.85rem] text-brand-700/80">{o.sender?.email}</p>
          </Panel>

          <Panel title="Kitchen note">
            <Field label="Visible to staff only">
              <textarea
                rows={4}
                value={notes ?? o.notes ?? ""}
                onChange={(e) => setNotes(e.target.value)}
                className="field resize-y"
                placeholder="Anything the kitchen or the rider needs to know."
              />
            </Field>
            <button
              onClick={saveNotes}
              disabled={busy || notes === null}
              className="btn btn-emerald mt-3 px-4 py-2 text-[0.82rem]"
            >
              {busy ? "Saving…" : "Save note"}
            </button>
          </Panel>
        </div>
      </div>
    </>
  );
}
