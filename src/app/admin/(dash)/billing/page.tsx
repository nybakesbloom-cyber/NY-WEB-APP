"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { money } from "@/lib/format";
import {
  useApi, send, PageHead, Panel, Stat, Badge, Field, Toolbar, Chip,
  Loading, ErrorBox, Empty, Pager, type Paged,
} from "@/components/admin/ui";

type Txn = {
  _id: string; orderNumber: string; kind: "charge" | "refund";
  method: string; amount: number; status: string;
  reference: string; note: string; createdAt: string;
};

type Payload = Paged<Txn> & {
  totals: { collected: number; refunded: number; pending: number; net: number };
};

function BillingInner() {
  const params = useSearchParams();
  const [kind, setKind] = useState("all");
  const [q, setQ] = useState(params.get("q") ?? "");
  const [applied, setApplied] = useState(params.get("q") ?? "");
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const url = `/api/admin/transactions?kind=${kind}&page=${page}${applied ? `&q=${encodeURIComponent(applied)}` : ""}`;

  const filter = (fn: () => void) => {
    fn();
    setPage(1);
  };
  const { data, error, loading, reload } = useApi<Payload>(url);

  async function record(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    setProblem(null);
    setDone(null);
    try {
      await send("/api/admin/transactions", "POST", {
        orderNumber: String(form.get("orderNumber") ?? "").trim(),
        kind: String(form.get("kind") ?? "charge"),
        amount: Number(form.get("amount")),
        method: String(form.get("method") ?? "upi"),
        reference: String(form.get("reference") ?? ""),
        note: String(form.get("note") ?? ""),
      });
      (e.target as HTMLFormElement).reset();
      setDone("Recorded.");
      setPage(1);
      await reload();
    } catch (err) {
      setProblem(err instanceof Error ? err.message : "Could not record that");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHead title="Billing" sub="Every charge and refund, and what is still owed." />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Collected" value={money(data?.totals.collected ?? 0)} tone="emerald" />
        <Stat label="Refunded" value={money(data?.totals.refunded ?? 0)} />
        <Stat label="Awaiting payment" value={money(data?.totals.pending ?? 0)} hint="mostly cash on delivery" tone="gold" />
        <Stat label="Net" value={money(data?.totals.net ?? 0)} hint="collected less refunds" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <div>
          <Toolbar>
            {["all", "charge", "refund"].map((k) => (
              <Chip key={k} active={kind === k} onClick={() => filter(() => setKind(k))}>
                {k === "all" ? "Everything" : k === "charge" ? "Charges" : "Refunds"}
              </Chip>
            ))}
            <form
              onSubmit={(e) => { e.preventDefault(); filter(() => setApplied(q.trim())); }}
              className="ml-auto flex gap-2"
            >
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Order no. or reference"
                aria-label="Search transactions"
                className="field w-52 py-2 text-[0.82rem]"
              />
              <button className="btn btn-outline px-4 py-2 text-[0.8rem]">Search</button>
            </form>
          </Toolbar>

          {loading ? (
            <Loading />
          ) : error ? (
            <ErrorBox message={error} onRetry={reload} />
          ) : !data || data.items.length === 0 ? (
            <Empty>No transactions match that.</Empty>
          ) : (
            <div className="overflow-hidden rounded-xl border border-brand-900/8 bg-white">
              {data.items.map((t) => (
                <div
                  key={t._id}
                  className="grid gap-2 border-b border-brand-900/6 px-4 py-3 text-[0.85rem] last:border-0 sm:grid-cols-[110px_1fr_auto_100px] sm:items-center sm:gap-3"
                >
                  <Link href={`/admin/orders?q=${t.orderNumber}`} className="font-mono text-[0.8rem] font-semibold text-brand-900 hover:text-gold-700">
                    {t.orderNumber}
                  </Link>
                  <span className="flex flex-wrap items-center gap-2">
                    <Badge value={t.kind} />
                    <Badge value={t.status} />
                    <span className="text-[0.76rem] uppercase text-brand-700/65">{t.method}</span>
                    {t.reference && <span className="truncate text-[0.72rem] text-brand-700/45">{t.reference}</span>}
                  </span>
                  <span className="text-[0.72rem] text-brand-700/55">
                    {new Date(t.createdAt).toLocaleDateString("en-IN")}
                  </span>
                  <span className={`font-semibold sm:text-right ${t.kind === "refund" ? "text-rose-700" : "text-brand-900"}`}>
                    {t.kind === "refund" ? "−" : ""}{money(t.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
          {data && <Pager data={data} onPage={setPage} noun="transactions" />}
        </div>

        <Panel title="Record a payment or refund">
          <form onSubmit={record} className="space-y-3">
            <Field label="Order number" hint="For example NY100200">
              <input name="orderNumber" required className="field" placeholder="NY100200" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Type">
                <select name="kind" className="field" defaultValue="charge">
                  <option value="charge">Charge</option>
                  <option value="refund">Refund</option>
                </select>
              </Field>
              <Field label="Amount">
                <input name="amount" type="number" min="1" step="1" required className="field" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Method">
                <select name="method" className="field" defaultValue="upi">
                  {["upi", "card", "netbanking", "cod", "bank transfer"].map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </Field>
              <Field label="Reference">
                <input name="reference" className="field" placeholder="UTR / txn id" />
              </Field>
            </div>
            <Field label="Note">
              <input name="note" className="field" placeholder="Why, in a few words" />
            </Field>

            {problem && (
              <p role="alert" className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-[0.8rem] text-red-800">
                {problem}
              </p>
            )}
            {done && (
              <p className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-[0.8rem] text-emerald-800">
                {done}
              </p>
            )}

            <button disabled={busy} className="btn btn-emerald w-full py-2.5 text-[0.85rem]">
              {busy ? "Recording…" : "Record"}
            </button>
            <p className="text-[0.72rem] leading-relaxed text-brand-700/55">
              A refund is checked against what has actually been collected on that order, so you
              cannot refund more than was paid.
            </p>
          </form>
        </Panel>
      </div>
    </>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={<Loading />}>
      <BillingInner />
    </Suspense>
  );
}
