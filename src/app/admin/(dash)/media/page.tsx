"use client";

import { useRef, useState } from "react";
import { useApi, send, PageHead, Panel, Loading, ErrorBox, Empty, Pager, type Paged } from "@/components/admin/ui";

type Item = {
  _id: string; filename: string; contentType: string;
  size: number; alt: string; createdAt: string;
};

const kb = (n: number) => (n < 1024 * 1024 ? `${Math.round(n / 1024)} KB` : `${(n / 1024 / 1024).toFixed(1)} MB`);

export default function MediaPage() {
  const [page, setPage] = useState(1);
  const { data, error, loading, reload } = useApi<Paged<Item>>(`/api/admin/media?page=${page}`);
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setProblem(null);
    try {
      for (const file of Array.from(files)) {
        const form = new FormData();
        form.append("file", file);
        form.append("alt", file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "));
        const res = await fetch("/api/admin/media", { method: "POST", body: form });
        const json = await res.json();
        if (!res.ok) throw new Error(`${file.name}: ${json.error ?? "upload failed"}`);
      }
      setPage(1);
      await reload();
    } catch (err) {
      setProblem(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  async function remove(item: Item) {
    if (!confirm(`Delete ${item.filename}? Any product using it goes back to drawn artwork.`)) return;
    setBusy(true);
    setProblem(null);
    try {
      await send(`/api/admin/media/${item._id}`, "DELETE");
      await reload();
    } catch (err) {
      setProblem(err instanceof Error ? err.message : "Could not delete");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHead title="Images" sub="Upload a photo here, then pick it on a product. Anything without a photo falls back to the drawn artwork." />

      <Panel className="mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <input
            ref={input}
            type="file"
            accept="image/*"
            multiple
            disabled={busy}
            onChange={(e) => upload(e.target.files)}
            className="text-[0.85rem] file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-brand-800 file:px-4 file:py-2 file:text-[0.8rem] file:font-semibold file:text-gold-100"
          />
          <span className="text-[0.78rem] text-brand-700/60">
            JPEG, PNG, WebP, AVIF, GIF or SVG · up to 5 MB each
          </span>
          {busy && <span className="text-[0.8rem] font-semibold text-gold-700">Working…</span>}
        </div>
        {problem && (
          <p role="alert" className="mt-3 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-[0.82rem] text-red-800">
            {problem}
          </p>
        )}
      </Panel>

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorBox message={error} onRetry={reload} />
      ) : !data || data.items.length === 0 ? (
        <Empty>No images yet. Every product is using its drawn artwork.</Empty>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
          {data.items.map((m) => (
            <figure key={m._id} className="overflow-hidden rounded-xl border border-brand-900/8 bg-white">
              <div className="aspect-square bg-brand-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/api/media/${m._id}`} alt={m.alt} className="h-full w-full object-cover" />
              </div>
              <figcaption className="p-2.5">
                <p className="truncate text-[0.78rem] font-semibold text-brand-900">{m.filename}</p>
                <p className="text-[0.7rem] text-brand-700/55">{kb(m.size)}</p>
                <div className="mt-2 flex gap-1.5">
                  <button
                    onClick={() => navigator.clipboard?.writeText(`/api/media/${m._id}`)}
                    className="flex-1 rounded border border-brand-900/12 px-2 py-1 text-[0.68rem] font-semibold text-brand-800 hover:border-gold-500"
                  >
                    Copy path
                  </button>
                  <button
                    onClick={() => remove(m)}
                    disabled={busy}
                    className="rounded border border-red-200 px-2 py-1 text-[0.68rem] font-semibold text-red-700 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
      {data && <Pager data={data} onPage={setPage} noun="images" />}
    </>
  );
}
