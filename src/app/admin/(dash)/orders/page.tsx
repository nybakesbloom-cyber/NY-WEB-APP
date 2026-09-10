"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { money } from "@/lib/format";
import { ORDER_STATUSES, STATUS_LABEL, type OrderStatus } from "@/lib/orders";
import { useApi, PageHead, Badge, Toolbar, Chip, Loading, ErrorBox, Empty, Pager, type Paged } from "@/components/admin/ui";

type OrderRow = {
  _id: string;
  number: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  deliveryDate: string;
  slot: string;
  payment: string;
  lines: { name: string; qty: number }[];
  recipient: { name: string };
  address: { city: string };
};

function OrdersInner() {
  const params = useSearchParams();
  const [status, setStatus] = useState<string>(params.get("status") ?? "all");
  const [q, setQ] = useState("");
  const [applied, setApplied] = useState("");
  const [page, setPage] = useState(1);

  const url = `/api/admin/orders?status=${encodeURIComponent(status)}&page=${page}${
    applied ? `&q=${encodeURIComponent(applied)}` : ""
  }`;
  const { data, error, loading, reload } = useApi<
    Paged<OrderRow> & { counts: Record<string, number> }
  >(url);

  // Any change of filter puts you back on the first page.
  const filter = (fn: () => void) => {
    fn();
    setPage(1);
  };

  return (
    <>
      <PageHead title="Orders" sub="Move an order along as it goes through the kitchen and out the door." />

      <Toolbar>
        <Chip active={status === "all"} onClick={() => filter(() => setStatus("all"))}>
          All{data ? ` (${data.total})` : ""}
        </Chip>
        {ORDER_STATUSES.map((s) => (
          <Chip key={s} active={status === s} onClick={() => filter(() => setStatus(s))}>
            {STATUS_LABEL[s]}
            {data?.counts?.[s] ? ` (${data.counts[s]})` : ""}
          </Chip>
        ))}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            filter(() => setApplied(q.trim()));
          }}
          className="ml-auto flex gap-2"
        >
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Order no., name, phone, city"
            className="field w-56 py-2 text-[0.82rem]"
            aria-label="Search orders"
          />
          <button className="btn btn-outline px-4 py-2 text-[0.8rem]">Search</button>
        </form>
      </Toolbar>

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorBox message={error} onRetry={reload} />
      ) : !data || data.items.length === 0 ? (
        <Empty>No orders match that.</Empty>
      ) : (
        <div className="overflow-hidden rounded-xl border border-brand-900/8 bg-white">
          <div className="hidden grid-cols-[110px_1fr_130px_140px_120px_90px] gap-3 border-b border-brand-900/8 bg-brand-50/60 px-4 py-2.5 text-[0.66rem] font-bold uppercase tracking-[0.14em] text-brand-700/70 lg:grid">
            <span>Order</span>
            <span>Items &amp; recipient</span>
            <span>Deliver on</span>
            <span>Status</span>
            <span>Payment</span>
            <span className="text-right">Total</span>
          </div>

          {data.items.map((o) => (
            <Link
              key={o._id}
              href={`/admin/orders/${o._id}`}
              className="grid gap-2 border-b border-brand-900/6 px-4 py-3 text-[0.86rem] transition last:border-0 hover:bg-brand-50 lg:grid-cols-[110px_1fr_130px_140px_120px_90px] lg:items-center lg:gap-3"
            >
              <span className="font-mono text-[0.8rem] font-semibold text-brand-900">{o.number}</span>
              <span className="min-w-0">
                <span className="block truncate text-brand-900">
                  {o.lines.map((l) => `${l.name} ×${l.qty}`).join(", ")}
                </span>
                <span className="block truncate text-[0.76rem] text-brand-700/60">
                  {o.recipient?.name}
                  {o.address?.city ? ` · ${o.address.city}` : ""}
                </span>
              </span>
              <span className="text-[0.8rem] text-brand-700/80">
                {o.deliveryDate || "—"}
                <span className="block text-[0.7rem] text-brand-700/50">{o.slot}</span>
              </span>
              <span><Badge value={o.status} label={STATUS_LABEL[o.status]} /></span>
              <span className="text-[0.78rem] uppercase text-brand-700/70">{o.payment}</span>
              <span className="font-semibold text-brand-900 lg:text-right">{money(o.total)}</span>
            </Link>
          ))}
          <Pager data={data} onPage={setPage} noun="orders" />
        </div>
      )}
    </>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<Loading />}>
      <OrdersInner />
    </Suspense>
  );
}
