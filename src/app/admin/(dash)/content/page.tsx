"use client";

import Link from "next/link";
import { useApi, PageHead, Loading, ErrorBox, Empty } from "@/components/admin/ui";

type Block = { _id: string; key: string; label: string; updatedAt: string; updatedBy: string };

const WHERE: Record<string, string> = {
  announcements: "The scrolling strip at the very top of every page",
  hero: "The scroll-driven title sequence on the home page",
  promises: "The four “why us” cards under the image ribbon",
  reviews: "The three customer quotes near the bottom of the home page",
  categories: "The five category cards, and both nav menus",
  occasions: "The eight occasion tiles, and the occasion menu",
  process: "The pinned “How it is made” section and its five detail pages",
  footer: "Blurb, delivery cities, help links and the legal line",
  settings: "Delivery thresholds, fees and the order number prefix",
};

export default function ContentPage() {
  const { data, error, loading, reload } = useApi<{ items: Block[] }>("/api/admin/content");

  return (
    <>
      <PageHead title="Site content" sub="Everything written on the public site. Edits show up on the shop straight away." />

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorBox message={error} onRetry={reload} />
      ) : !data || data.items.length === 0 ? (
        <Empty>No content blocks. Run `npm run seed` to create them.</Empty>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {data.items.map((b) => (
            <Link
              key={b._id}
              href={`/admin/content/${b.key}`}
              className="rounded-xl border border-brand-900/8 bg-white p-4 transition hover:border-gold-500 hover:shadow-[0_16px_32px_-24px_rgba(11,61,46,0.5)]"
            >
              <p className="font-display text-[1.05rem] font-semibold text-brand-900">
                {b.label || b.key}
              </p>
              <p className="mt-1 text-[0.8rem] leading-relaxed text-brand-700/70">
                {WHERE[b.key] ?? "A content block."}
              </p>
              <p className="mt-2.5 font-mono text-[0.68rem] text-brand-700/45">
                {b.key} · edited {new Date(b.updatedAt).toLocaleDateString("en-IN")}
                {b.updatedBy ? ` by ${b.updatedBy}` : ""}
              </p>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
