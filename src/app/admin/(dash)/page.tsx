"use client";

import Link from "next/link";
import { money } from "@/lib/format";
import { STATUS_LABEL, type OrderStatus } from "@/lib/orders";
import { useApi, PageHead, Panel, Stat, Badge, Loading, ErrorBox, Empty } from "@/components/admin/ui";

type Stats = {
  orders: { counts: Record<string, number>; open: number; total: number; last30: number };
  revenue: { collected: number; payments: number };
  products: { total: number; active: number };
  recent: {
    _id: string;
    number: string;
    status: OrderStatus;
    total: number;
    createdAt: string;
    recipient: { name: string };
    address: { city: string };
  }[];
  topProducts: { _id: string; qty: number; value: number }[];
};

const PIPELINE: OrderStatus[] = ["placed", "in_kitchen", "packed", "out_for_delivery", "delivered"];

export default function AdminDashboard() {
  const { data, error, loading, reload } = useApi<Stats>("/api/admin/stats");

  if (loading) return <Loading />;
  if (error) return <ErrorBox message={error} onRetry={reload} />;
  if (!data) return null;

  return (
    <>
      <PageHead title="Today" sub="Everything that needs a decision, in one place.">
        <Link href="/admin/orders" className="btn btn-emerald px-4 py-2 text-[0.82rem]">
          Open orders
        </Link>
      </PageHead>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Open orders" value={data.orders.open} hint="not yet delivered" tone="gold" />
        <Stat label="Collected" value={money(data.revenue.collected)} hint={`${data.revenue.payments} payments`} tone="emerald" />
        <Stat label="Orders, 30 days" value={data.orders.last30} hint={`${data.orders.total} all time`} />
        <Stat label="Products live" value={`${data.products.active} / ${data.products.total}`} hint="active / total" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Panel title="The pipeline">
          <ol className="grid gap-2 sm:grid-cols-5">
            {PIPELINE.map((s) => (
              <li key={s}>
                <Link
                  href={`/admin/orders?status=${s}`}
                  className="block rounded-lg border border-brand-900/8 p-3 transition hover:border-gold-500"
                >
                  <span className="font-display text-2xl font-semibold text-brand-900">
                    {data.orders.counts[s] ?? 0}
                  </span>
                  <span className="mt-0.5 block text-[0.7rem] leading-tight text-brand-700/70">
                    {STATUS_LABEL[s]}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
          {(data.orders.counts.cancelled ?? 0) > 0 && (
            <p className="mt-3 text-[0.78rem] text-brand-700/60">
              {data.orders.counts.cancelled} cancelled.
            </p>
          )}
        </Panel>

        <Panel title="Most ordered">
          {data.topProducts.length === 0 ? (
            <Empty>Nothing ordered yet.</Empty>
          ) : (
            <ol className="space-y-2.5">
              {data.topProducts.map((p, i) => (
                <li key={p._id} className="flex items-center gap-3">
                  <span className="w-5 font-mono text-[0.72rem] text-gold-600">0{i + 1}</span>
                  <span className="min-w-0 flex-1 truncate text-[0.86rem] text-brand-900">{p._id}</span>
                  <span className="text-[0.78rem] font-semibold text-brand-800">×{p.qty}</span>
                  <span className="w-20 text-right text-[0.78rem] text-brand-700/70">
                    {money(p.value)}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </Panel>
      </div>

      <Panel
        title="Latest orders"
        className="mt-4"
        actions={
          <Link href="/admin/orders" className="text-[0.75rem] font-semibold text-gold-700 hover:text-gold-600">
            See all →
          </Link>
        }
      >
        {data.recent.length === 0 ? (
          <Empty>No orders yet. Place one from the shop to see it here.</Empty>
        ) : (
          <div className="-mx-5 -my-5">
            {data.recent.map((o) => (
              <Link
                key={o._id}
                href={`/admin/orders/${o._id}`}
                className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-3 border-b border-brand-900/6 px-5 py-3 text-[0.86rem] transition last:border-0 hover:bg-brand-50"
              >
                <span className="font-mono text-[0.8rem] font-semibold text-brand-900">{o.number}</span>
                <span className="min-w-0 truncate text-brand-700/80">
                  {o.recipient?.name}
                  {o.address?.city ? ` · ${o.address.city}` : ""}
                </span>
                <Badge value={o.status} label={STATUS_LABEL[o.status]} />
                <span className="w-20 text-right font-semibold text-brand-900">{money(o.total)}</span>
              </Link>
            ))}
          </div>
        )}
      </Panel>
    </>
  );
}
