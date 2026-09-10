"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

/* ------------------------------------------------------------------ data */

/** GET a JSON endpoint with loading/error state and a manual refresh. */
export function useApi<T>(url: string | null) {
  const [state, setState] = useState<{ data: T | null; error: string | null; loading: boolean }>({
    data: null,
    error: null,
    loading: !!url,
  });
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (!url) return;
    let cancelled = false;

    // Everything here happens after an await, so the effect body itself never
    // calls setState and cannot cascade a render.
    (async () => {
      try {
        const res = await fetch(url);
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok) throw new Error(json.error ?? `Request failed (${res.status})`);
        setState({ data: json as T, error: null, loading: false });
      } catch (err) {
        if (cancelled) return;
        setState({
          data: null,
          error: err instanceof Error ? err.message : "Request failed",
          loading: false,
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [url, nonce]);

  const reload = useCallback(() => {
    setState((s) => ({ ...s, loading: true }));
    setNonce((n) => n + 1);
  }, []);

  return { ...state, reload };
}

export async function send<T>(
  url: string,
  method: "POST" | "PATCH" | "PUT" | "DELETE",
  payload?: unknown,
): Promise<T> {
  const res = await fetch(url, {
    method,
    ...(payload === undefined
      ? {}
      : { headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error ?? `Request failed (${res.status})`);
  return json as T;
}

/* ------------------------------------------------------------------- ui */

export function PageHead({
  title,
  sub,
  children,
}: {
  title: string;
  sub?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-[1.7rem] font-semibold tracking-tight text-brand-900">
          {title}
        </h1>
        {sub && <p className="mt-1 text-[0.86rem] text-brand-700/70">{sub}</p>}
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}

export function Panel({
  title,
  children,
  className = "",
  actions,
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}) {
  return (
    <section className={`rounded-xl border border-brand-900/8 bg-white ${className}`}>
      {(title || actions) && (
        <header className="flex items-center justify-between gap-3 border-b border-brand-900/8 px-5 py-3.5">
          {title && (
            <h2 className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-gold-700">
              {title}
            </h2>
          )}
          {actions}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function Stat({
  label,
  value,
  hint,
  tone = "plain",
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "plain" | "gold" | "emerald";
}) {
  const ring =
    tone === "gold"
      ? "border-gold-400/50 bg-gold-50"
      : tone === "emerald"
        ? "border-brand-500/30 bg-brand-50"
        : "border-brand-900/8 bg-white";
  return (
    <div className={`rounded-xl border p-4 ${ring}`}>
      <p className="text-[0.66rem] font-bold uppercase tracking-[0.16em] text-gold-700">{label}</p>
      <p className="mt-1.5 font-display text-2xl font-semibold text-brand-900">{value}</p>
      {hint && <p className="mt-0.5 text-[0.74rem] text-brand-700/60">{hint}</p>}
    </div>
  );
}

const STATUS_TONE: Record<string, string> = {
  placed: "bg-blue-100 text-blue-800",
  in_kitchen: "bg-amber-100 text-amber-800",
  packed: "bg-violet-100 text-violet-800",
  out_for_delivery: "bg-cyan-100 text-cyan-900",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-rose-100 text-rose-800",
  paid: "bg-emerald-100 text-emerald-800",
  pending: "bg-amber-100 text-amber-800",
  failed: "bg-rose-100 text-rose-800",
  refunded: "bg-slate-200 text-slate-700",
  charge: "bg-emerald-100 text-emerald-800",
  refund: "bg-rose-100 text-rose-800",
};

export function Badge({ value, label }: { value: string; label?: string }) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-[0.66rem] font-bold uppercase tracking-[0.1em] ${
        STATUS_TONE[value] ?? "bg-slate-100 text-slate-700"
      }`}
    >
      {label ?? value.replace(/_/g, " ")}
    </span>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[0.76rem] font-semibold text-brand-800">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[0.7rem] text-brand-700/55">{hint}</span>}
    </label>
  );
}

export function Toolbar({ children }: { children: React.ReactNode }) {
  return <div className="mb-4 flex flex-wrap items-center gap-2">{children}</div>;
}

export function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3.5 py-1.5 text-[0.78rem] font-semibold transition ${
        active
          ? "bg-brand-800 text-gold-100"
          : "border border-brand-900/12 bg-white text-brand-800 hover:border-gold-500"
      }`}
    >
      {children}
    </button>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-brand-900/15 bg-white px-6 py-10 text-center text-[0.88rem] text-brand-700/60">
      {children}
    </p>
  );
}

export function Loading() {
  return <Empty>Loading…</Empty>;
}

export function ErrorBox({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="rounded-xl border border-red-300 bg-red-50 px-5 py-4 text-[0.88rem] text-red-800">
      <p className="font-semibold">Something went wrong</p>
      <p className="mt-1">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-outline mt-3 px-4 py-1.5 text-[0.78rem]">
          Try again
        </button>
      )}
    </div>
  );
}

export function Row({ href, children }: { href?: string; children: React.ReactNode }) {
  const cls =
    "grid items-center gap-3 border-b border-brand-900/6 px-4 py-3 text-[0.86rem] last:border-0";
  return href ? (
    <Link href={href} className={`${cls} transition hover:bg-brand-50`}>
      {children}
    </Link>
  ) : (
    <div className={cls}>{children}</div>
  );
}

/** Shape every paginated admin endpoint returns. */
export type Paged<T> = {
  items: T[];
  page: number;
  pages: number;
  total: number;
  limit: number;
  from: number;
  to: number;
};

export function Pager({
  data,
  onPage,
  noun = "items",
}: {
  data: Pick<Paged<unknown>, "page" | "pages" | "total" | "from" | "to">;
  onPage: (page: number) => void;
  noun?: string;
}) {
  if (data.total === 0) return null;

  // A window of pages around the current one, so 200 pages do not fill the row.
  const span = 2;
  const numbers: (number | "gap")[] = [];
  for (let n = 1; n <= data.pages; n++) {
    if (n === 1 || n === data.pages || Math.abs(n - data.page) <= span) numbers.push(n);
    else if (numbers[numbers.length - 1] !== "gap") numbers.push("gap");
  }

  return (
    <nav className="mt-5 flex flex-wrap items-center justify-between gap-3" aria-label="Pagination">
      <p className="text-[0.8rem] text-brand-700/70">
        <strong className="text-brand-900">{data.from}–{data.to}</strong> of {data.total} {noun}
      </p>

      {data.pages > 1 && (
        <div className="flex flex-wrap items-center gap-1">
          <button
            onClick={() => onPage(data.page - 1)}
            disabled={data.page <= 1}
            className="rounded-lg border border-brand-900/12 bg-white px-3 py-1.5 text-[0.8rem] font-semibold text-brand-800 transition hover:border-gold-500 disabled:opacity-35"
          >
            ← Prev
          </button>

          {numbers.map((n, i) =>
            n === "gap" ? (
              <span key={`gap${i}`} className="px-1.5 text-brand-700/45">…</span>
            ) : (
              <button
                key={n}
                onClick={() => onPage(n)}
                aria-current={n === data.page ? "page" : undefined}
                className={`min-w-9 rounded-lg px-3 py-1.5 text-[0.8rem] font-semibold transition ${
                  n === data.page
                    ? "bg-brand-800 text-gold-100"
                    : "border border-brand-900/12 bg-white text-brand-800 hover:border-gold-500"
                }`}
              >
                {n}
              </button>
            ),
          )}

          <button
            onClick={() => onPage(data.page + 1)}
            disabled={data.page >= data.pages}
            className="rounded-lg border border-brand-900/12 bg-white px-3 py-1.5 text-[0.8rem] font-semibold text-brand-800 transition hover:border-gold-500 disabled:opacity-35"
          >
            Next →
          </button>
        </div>
      )}
    </nav>
  );
}
