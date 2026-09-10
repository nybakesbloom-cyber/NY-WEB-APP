"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { money } from "@/lib/format";
import {
  ORDER_STATUSES, STATUS_LABEL, PAYMENT_STATUSES, PAYMENT_LABEL, CHANNEL_LABEL,
  type OrderStatus, type PaymentStatus, type Channel,
} from "@/lib/orders";
import Link2 from "next/link";
import { useApi, PageHead, Badge, Toolbar, Chip, Loading, ErrorBox, Empty, Pager, type Paged } from "@/components/admin/ui";

type OrderRow = {
  _id: string;
  number: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  channel: Channel;
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
  const [channel, setChannel] = useState("all");
  const [pay, setPay] = useState("all");

  const url = `/api/admin/orders?status=${encodeURIComponent(status)}&channel=${channel}&payment=${pay}&page=${page}${
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
      <PageHead title="Orders" sub="Move an order along as it goes through the kitchen and out the door.">
        <Link2 href="/admin/orders/new" className="btn btn-gold px-4 py-2 text-[0.82rem]">
          + Counter sale
        </Link2>
      </PageHead>

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

        <span className="mx-1 h-5 w-px bg-brand-900/12" />
        {(["all", "online", "in_shop"] as const).map((c) => (
          <Chip key={c} active={channel === c} onClick={() => filter(() => setChannel(c))}>
            {c === "all" ? "Any channel" : CHANNEL_LABEL[c as Channel]}
          </Chip>
        ))}
        <span className="mx-1 h-5 w-px bg-brand-900/12" />
        <Chip active={pay === "all"} onClick={() => filter(() => setPay("all"))}>Any payment</Chip>
        {PAYMENT_STATUSES.map((s2) => (
          <Chip key={s2} active={pay === s2} onClick={() => filter(() => setPay(s2))}>
            {PAYMENT_LABEL[s2]}
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
              <span className="flex flex-wrap gap-1.5">
                <Badge value={o.status} label={STATUS_LABEL[o.status] ?? o.status} />
                {o.channel === "in_shop" && (
                  <span className="rounded-full border border-brand-900/12 px-2 py-1 text-[0.62rem] font-bold uppercase tracking-wider text-brand-700">
                    shop
                  </span>
                )}
              </span>
              <span className="flex flex-wrap items-center gap-1.5">
                <Badge value={o.paymentStatus} label={PAYMENT_LABEL[o.paymentStatus] ?? "Unpaid"} />
                <span className="text-[0.72rem] uppercase text-brand-700/55">{o.payment}</span>
              </span>
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
