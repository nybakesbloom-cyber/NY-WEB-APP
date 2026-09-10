"use client";

import Link from "next/link";
import { useState } from "react";
import { money } from "@/lib/format";
import { useApi, PageHead, Stat, Toolbar, Chip, Loading, ErrorBox, Empty, Pager, type Paged } from "@/components/admin/ui";

type Customer = {
  _id: string;
  name: string;
  email: string;
  orders: number;
  spent: number;
  collected: number;
  lastOrder: string;
  firstOrder: string;
  cities: string[];
  channels: string[];
};

export default function CustomersPage() {
  const [repeat, setRepeat] = useState(false);
  const [q, setQ] = useState("");
  const [applied, setApplied] = useState("");
  const [page, setPage] = useState(1);

  const url = `/api/admin/customers?page=${page}&repeat=${repeat}${
    applied ? `&q=${encodeURIComponent(applied)}` : ""
  }`;
  const { data, error, loading, reload } = useApi<
    Paged<Customer> & { summary: { people: number; repeat: number } }
  >(url);

  const filter = (fn: () => void) => {
    fn();
    setPage(1);
  };

  return (
    <>
      <PageHead
        title="Customers"
        sub="Grouped by mobile number, so anyone who has ordered twice shows up as a repeat customer."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="People" value={data?.summary.people ?? 0} hint="who have ever ordered" />
        <Stat label="Repeat customers" value={data?.summary.repeat ?? 0} hint="two orders or more" tone="gold" />
        <Stat
          label="Repeat rate"
          value={
            data?.summary.people
              ? `${Math.round((data.summary.repeat / data.summary.people) * 100)}%`
              : "—"
          }
          tone="emerald"
        />
      </div>

      <Toolbar>
        <Chip active={!repeat} onClick={() => filter(() => setRepeat(false))}>Everyone</Chip>
        <Chip active={repeat} onClick={() => filter(() => setRepeat(true))}>Repeat only</Chip>
        <form
          onSubmit={(e) => { e.preventDefault(); filter(() => setApplied(q.trim())); }}
          className="ml-auto flex gap-2"
        >
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Mobile number or name"
            aria-label="Search customers"
            className="field w-56 py-2 text-[0.82rem]"
          />
          <button className="btn btn-outline px-4 py-2 text-[0.8rem]">Search</button>
        </form>
      </Toolbar>

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorBox message={error} onRetry={reload} />
      ) : !data || data.items.length === 0 ? (
        <Empty>No customers match that.</Empty>
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-brand-900/8 bg-white">
            <div className="hidden grid-cols-[150px_1fr_80px_110px_110px_120px] gap-3 border-b border-brand-900/8 bg-brand-50/60 px-4 py-2.5 text-[0.66rem] font-bold uppercase tracking-[0.14em] text-brand-700/70 lg:grid">
              <span>Mobile</span><span>Name</span><span className="text-right">Orders</span>
              <span className="text-right">Spent</span><span className="text-right">Outstanding</span><span>Last order</span>
            </div>
            {data.items.map((c) => (
              <Link
                key={c._id}
                href={`/admin/customers/${c._id}`}
                className="grid gap-1 border-b border-brand-900/6 px-4 py-3 text-[0.86rem] transition last:border-0 hover:bg-brand-50 lg:grid-cols-[150px_1fr_80px_110px_110px_120px] lg:items-center lg:gap-3"
              >
                <span className="font-mono font-semibold text-brand-900">{c._id}</span>
                <span className="min-w-0 truncate text-brand-800">
                  {c.name || "—"}
                  {c.cities?.filter(Boolean).length > 0 && (
                    <span className="ml-2 text-[0.76rem] text-brand-700/55">{c.cities.filter(Boolean).join(", ")}</span>
                  )}
                </span>
                <span className={`lg:text-right ${c.orders >= 2 ? "font-bold text-gold-700" : "text-brand-700/80"}`}>
                  {c.orders}
                </span>
                <span className="font-semibold text-brand-900 lg:text-right">{money(c.spent)}</span>
                <span className={`lg:text-right ${c.spent - c.collected > 0 ? "font-semibold text-amber-700" : "text-brand-700/45"}`}>
                  {c.spent - c.collected > 0 ? money(c.spent - c.collected) : "—"}
                </span>
                <span className="text-[0.78rem] text-brand-700/65">
                  {new Date(c.lastOrder).toLocaleDateString("en-IN")}
                </span>
              </Link>
            ))}
          </div>
          <Pager data={data} onPage={setPage} noun="customers" />
        </>
      )}
    </>
  );
}
