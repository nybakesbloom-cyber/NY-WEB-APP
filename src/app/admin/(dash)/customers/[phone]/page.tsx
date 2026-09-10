"use client";

import Link from "next/link";
import { use } from "react";
import { money } from "@/lib/format";
import { STATUS_LABEL, PAYMENT_LABEL, CHANNEL_LABEL, type OrderStatus, type PaymentStatus, type Channel } from "@/lib/orders";
import { useApi, PageHead, Panel, Stat, Badge, Loading, ErrorBox } from "@/components/admin/ui";

type Order = {
  _id: string; number: string; status: OrderStatus; paymentStatus: PaymentStatus;
  channel: Channel; total: number; createdAt: string; deliveryDate: string;
  lines: { name: string; qty: number }[];
};

type Payload = {
  phone: string; name: string; email: string;
  orders: Order[];
  stats: { count: number; spent: number; collected: number; outstanding: number; average: number; first: string; last: string };
  favourites: { name: string; qty: number }[];
};

export default function CustomerPage({ params }: { params: Promise<{ phone: string }> }) {
  const { phone } = use(params);
  const { data, error, loading, reload } = useApi<Payload>(`/api/admin/customers/${phone}`);

  if (loading) return <Loading />;
  if (error) return <ErrorBox message={error} onRetry={reload} />;
  if (!data) return null;

  return (
    <>
      <PageHead
        title={data.name || data.phone}
        sub={`${data.phone}${data.email ? ` · ${data.email}` : ""}`}
      >
        <Link href="/admin/customers" className="btn btn-outline px-4 py-2 text-[0.82rem]">
          ← All customers
        </Link>
        <Link href="/admin/orders/new" className="btn btn-gold px-4 py-2 text-[0.82rem]">
          + Counter sale
        </Link>
      </PageHead>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Orders" value={data.stats.count} tone={data.stats.count >= 2 ? "gold" : "plain"}
              hint={data.stats.count >= 2 ? "a repeat customer" : "first-time"} />
        <Stat label="Spent" value={money(data.stats.spent)} tone="emerald" />
        <Stat label="Average order" value={money(data.stats.average)} />
        <Stat label="Outstanding" value={data.stats.outstanding > 0 ? money(data.stats.outstanding) : "—"}
              hint={data.stats.outstanding > 0 ? "not yet collected" : "all settled"} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <Panel title={`Orders (${data.orders.length})`}>
          <div className="-mx-5 -my-5">
            {data.orders.map((o) => (
              <Link
                key={o._id}
                href={`/admin/orders/${o._id}`}
                className="grid gap-1.5 border-b border-brand-900/6 px-5 py-3 text-[0.85rem] transition last:border-0 hover:bg-brand-50 sm:grid-cols-[100px_1fr_auto_auto_90px] sm:items-center sm:gap-3"
              >
                <span className="font-mono text-[0.8rem] font-semibold text-brand-900">{o.number}</span>
                <span className="min-w-0 truncate text-brand-700/80">
                  {o.lines.map((l) => `${l.name} ×${l.qty}`).join(", ")}
                </span>
                <Badge value={o.status} label={STATUS_LABEL[o.status]} />
                <Badge value={o.paymentStatus} label={PAYMENT_LABEL[o.paymentStatus]} />
                <span className="font-semibold text-brand-900 sm:text-right">{money(o.total)}</span>
              </Link>
            ))}
          </div>
        </Panel>

        <div className="space-y-4">
          <Panel title="Usually orders">
            {data.favourites.length === 0 ? (
              <p className="text-[0.85rem] text-brand-700/60">Nothing yet.</p>
            ) : (
              <ol className="space-y-2">
                {data.favourites.map((f, i) => (
                  <li key={f.name} className="flex items-center gap-3 text-[0.86rem]">
                    <span className="w-5 font-mono text-[0.72rem] text-gold-600">0{i + 1}</span>
                    <span className="min-w-0 flex-1 truncate text-brand-900">{f.name}</span>
                    <span className="font-semibold text-brand-800">×{f.qty}</span>
                  </li>
                ))}
              </ol>
            )}
          </Panel>

          <Panel title="History">
            <dl className="space-y-3 text-[0.85rem]">
              <div className="flex justify-between">
                <dt className="text-brand-700/75">First order</dt>
                <dd className="text-brand-900">{new Date(data.stats.first).toLocaleDateString("en-IN")}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-brand-700/75">Most recent</dt>
                <dd className="text-brand-900">{new Date(data.stats.last).toLocaleDateString("en-IN")}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-brand-700/75">Ordered through</dt>
                <dd className="text-brand-900">
                  {[...new Set(data.orders.map((o) => CHANNEL_LABEL[o.channel] ?? "Online"))].join(", ")}
                </dd>
              </div>
            </dl>
          </Panel>
        </div>
      </div>
    </>
  );
}
