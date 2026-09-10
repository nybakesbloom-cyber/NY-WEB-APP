"use client";

import Link from "next/link";
import { useState } from "react";
import { useApi, PageHead, Toolbar, Chip, Badge, Loading, ErrorBox, Empty, Pager, type Paged } from "@/components/admin/ui";

type Row = {
  _id: string; slug: string; title: string; excerpt: string;
  published: boolean; publishedAt: string | null; readMinutes: number;
  tags: string[]; cover: string | null; author: string;
};

export default function PostsPage() {
  const [state, setState] = useState("all");
  const [q, setQ] = useState("");
  const [applied, setApplied] = useState("");
  const [page, setPage] = useState(1);

  const url = `/api/admin/posts?page=${page}${state !== "all" ? `&published=${state}` : ""}${
    applied ? `&q=${encodeURIComponent(applied)}` : ""
  }`;
  const { data, error, loading, reload } = useApi<Paged<Row>>(url);

  const filter = (fn: () => void) => { fn(); setPage(1); };

  return (
    <>
      <PageHead title="Journal" sub="Posts for the blog section of the site.">
        <Link href="/blog" target="_blank" className="btn btn-outline px-4 py-2 text-[0.82rem]">
          View blog ↗
        </Link>
        <Link href="/admin/posts/new" className="btn btn-gold px-4 py-2 text-[0.82rem]">
          + New post
        </Link>
      </PageHead>

      <Toolbar>
        <Chip active={state === "all"} onClick={() => filter(() => setState("all"))}>All</Chip>
        <Chip active={state === "true"} onClick={() => filter(() => setState("true"))}>Published</Chip>
        <Chip active={state === "false"} onClick={() => filter(() => setState("false"))}>Drafts</Chip>
        <form onSubmit={(e) => { e.preventDefault(); filter(() => setApplied(q.trim())); }} className="ml-auto flex gap-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search titles"
                 aria-label="Search posts" className="field w-52 py-2 text-[0.82rem]" />
          <button className="btn btn-outline px-4 py-2 text-[0.8rem]">Search</button>
        </form>
      </Toolbar>

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorBox message={error} onRetry={reload} />
      ) : !data || data.items.length === 0 ? (
        <Empty>No posts yet. Write the first one.</Empty>
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-brand-900/8 bg-white">
            {data.items.map((p) => (
              <Link
                key={p._id}
                href={`/admin/posts/${p._id}`}
                className="flex items-center gap-3 border-b border-brand-900/6 px-4 py-3 transition last:border-0 hover:bg-brand-50"
              >
                <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-brand-50">
                  {p.cover && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`/api/media/${p.cover}`} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[0.9rem] font-semibold text-brand-900">{p.title}</p>
                  <p className="truncate text-[0.78rem] text-brand-700/65">{p.excerpt}</p>
                  <p className="mt-0.5 font-mono text-[0.68rem] text-brand-700/45">{p.slug}</p>
                </div>
                <span className="shrink-0 text-[0.74rem] text-brand-700/55">{p.readMinutes} min</span>
                <Badge value={p.published ? "paid" : "pending"} label={p.published ? "Published" : "Draft"} />
              </Link>
            ))}
          </div>
          <Pager data={data} onPage={setPage} noun="posts" />
        </>
      )}
    </>
  );
}
