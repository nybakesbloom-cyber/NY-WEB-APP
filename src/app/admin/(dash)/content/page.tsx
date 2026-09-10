"use client";

import Link from "next/link";
import { CONTENT_SCHEMA, BLOCK_ORDER } from "@/lib/contentSchema";
import { useApi, PageHead, Loading, ErrorBox, Empty } from "@/components/admin/ui";

type Block = { _id: string; key: string; label: string; updatedAt: string; updatedBy: string };

export default function ContentPage() {
  const { data, error, loading, reload } = useApi<{ items: Block[] }>("/api/admin/content");

  // Down the page, roughly top to bottom, with anything unrecognised last.
  const ordered = (data?.items ?? []).slice().sort((a, b) => {
    const ai = BLOCK_ORDER.indexOf(a.key);
    const bi = BLOCK_ORDER.indexOf(b.key);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  return (
    <>
      <PageHead
        title="Site content"
        sub="Every heading, description, image and colour on the public site — header to footer, section by section."
      />

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorBox message={error} onRetry={reload} />
      ) : ordered.length === 0 ? (
        <Empty>No content blocks yet. Load them from Import &amp; export.</Empty>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {ordered.map((b, i) => {
            const schema = CONTENT_SCHEMA[b.key];
            return (
              <Link
                key={b._id}
                href={`/admin/content/${b.key}`}
                className="group rounded-xl border border-brand-900/8 bg-white p-4 transition hover:border-gold-500 hover:shadow-[0_16px_32px_-24px_rgba(11,61,46,0.5)]"
              >
                <p className="font-mono text-[0.66rem] text-gold-600">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <p className="mt-1 font-display text-[1.05rem] font-semibold text-brand-900">
                  {schema?.label ?? b.label ?? b.key}
                </p>
                <p className="mt-1 text-[0.8rem] leading-relaxed text-brand-700/70">
                  {schema?.where ?? "A content block."}
                </p>
                <p className="mt-2.5 flex items-center gap-2 font-mono text-[0.66rem] text-brand-700/45">
                  {b.key}
                  {!schema && (
                    <span className="rounded bg-brand-50 px-1.5 py-0.5 not-italic text-brand-700/70">
                      JSON
                    </span>
                  )}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
