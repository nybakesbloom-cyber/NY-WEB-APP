"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { useApi, send, PageHead, Panel, Field, Loading, ErrorBox } from "@/components/admin/ui";

type Draft = {
  _id?: string;
  slug: string; title: string; excerpt: string; body: string;
  author: string; tags: string[];
  cover: string | null;
  art: { kind: string; hues: string[] };
  published: boolean;
};

type MediaItem = { _id: string; filename: string };

const BLANK: Draft = {
  slug: "", title: "", excerpt: "", body: "", author: "", tags: [],
  cover: null, art: { kind: "bouquet", hues: ["#A6122B", "#E8607A"] }, published: false,
};

const ART_KINDS = ["cake", "bouquet", "basket", "combo", "plant", "hamper"];

export default function PostEditor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const isNew = id === "new";
  const router = useRouter();

  const { data, error, loading, reload } = useApi<{ item: Draft }>(isNew ? null : `/api/admin/posts/${id}`);
  const media = useApi<{ items: MediaItem[] }>("/api/admin/media?limit=100");

  const [draft, setDraft] = useState<Draft | null>(isNew ? BLANK : null);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [seededFrom, setSeededFrom] = useState<Draft | null>(null);
  if (data?.item && data.item !== seededFrom) {
    setSeededFrom(data.item);
    setDraft({ ...BLANK, ...data.item });
  }

  if (!isNew && loading) return <Loading />;
  if (error) return <ErrorBox message={error} onRetry={reload} />;
  if (!draft) return <Loading />;

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) =>
    setDraft((d) => (d ? { ...d, [k]: v } : d));

  async function save(publish?: boolean) {
    if (!draft) return;
    const payload = publish === undefined ? draft : { ...draft, published: publish };
    setBusy(true);
    setProblem(null);
    setSaved(false);
    try {
      if (isNew) {
        const r = await send<{ item: { _id: string } }>("/api/admin/posts", "POST", payload);
        router.replace(`/admin/posts/${r.item._id}`);
      } else {
        await send(`/api/admin/posts/${id}`, "PATCH", payload);
        if (publish !== undefined) set("published", publish);
        setSaved(true);
      }
    } catch (err) {
      setProblem(err instanceof Error ? err.message : "Could not save");
    } finally {
      setBusy(false);
    }
  }

  const words = draft.body.trim().split(/\s+/).filter(Boolean).length;

  return (
    <>
      <PageHead
        title={isNew ? "New post" : draft.title || "Post"}
        sub={isNew ? "Save it as a draft first — nothing is public until you publish." : `/blog/${draft.slug}`}
      >
        <Link href="/admin/posts" className="btn btn-outline px-4 py-2 text-[0.82rem]">← All posts</Link>
        {!isNew && draft.published && (
          <Link href={`/blog/${draft.slug}`} target="_blank" className="btn btn-outline px-4 py-2 text-[0.82rem]">
            View ↗
          </Link>
        )}
        <button onClick={() => save()} disabled={busy} className="btn btn-outline px-4 py-2 text-[0.82rem]">
          {busy ? "Saving…" : "Save draft"}
        </button>
        <button onClick={() => save(!draft.published)} disabled={busy} className="btn btn-gold px-5 py-2 text-[0.82rem]">
          {draft.published ? "Unpublish" : "Publish"}
        </button>
      </PageHead>

      {problem && <p role="alert" className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-[0.85rem] text-red-800">{problem}</p>}
      {saved && <p className="mb-4 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-[0.85rem] text-emerald-800">Saved.</p>}

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-4">
          <Panel title="The post">
            <div className="space-y-3">
              <Field label="Title">
                <input
                  value={draft.title}
                  onChange={(e) => {
                    set("title", e.target.value);
                    // Only auto-slug a new post, so published URLs never move.
                    if (isNew) set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
                  }}
                  className="field"
                />
              </Field>
              <Field label="Slug" hint="The URL. Changing it on a published post breaks existing links.">
                <input value={draft.slug} onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} className="field font-mono text-[0.85rem]" />
              </Field>
              <Field label="Standfirst" hint="Shown on the card and under the headline.">
                <textarea rows={2} value={draft.excerpt} onChange={(e) => set("excerpt", e.target.value)} className="field resize-y" />
              </Field>
              <Field label="Body" hint="A blank line starts a new paragraph. Begin a line with ## for a sub-heading.">
                <textarea rows={20} value={draft.body} onChange={(e) => set("body", e.target.value)} className="field resize-y leading-relaxed" />
              </Field>
              <p className="text-[0.74rem] text-brand-700/55">
                {words} words · about {Math.max(1, Math.round(words / 200))} min read
              </p>
            </div>
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel title="Cover">
            <div className="mb-3 aspect-[4/3] overflow-hidden rounded-xl border border-brand-900/8 bg-brand-50">
              {draft.cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={`/api/media/${draft.cover}`} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full w-full place-items-center text-center text-[0.78rem] text-brand-900/60"
                     style={{ background: `linear-gradient(135deg, ${draft.art.hues[0]}, ${draft.art.hues[1]})` }}>
                  Drawn artwork
                </div>
              )}
            </div>
            <Field label="Image">
              <select value={draft.cover ?? ""} onChange={(e) => set("cover", e.target.value || null)} className="field">
                <option value="">None — use the drawn artwork</option>
                {media.data?.items.map((m) => <option key={m._id} value={m._id}>{m.filename}</option>)}
              </select>
            </Field>
            <div className="mt-3 grid grid-cols-2 gap-3 border-t border-brand-900/8 pt-3">
              <Field label="Artwork style">
                <select value={draft.art.kind} onChange={(e) => set("art", { ...draft.art, kind: e.target.value })} className="field">
                  {ART_KINDS.map((k) => <option key={k} value={k}>{k}</option>)}
                </select>
              </Field>
              <div className="grid grid-cols-2 gap-2">
                {[0, 1].map((i) => (
                  <Field key={i} label={i === 0 ? "Subject" : "Ground"}>
                    <input type="color" value={draft.art.hues[i] ?? "#A6122B"}
                           onChange={(e) => { const hues = [...draft.art.hues]; hues[i] = e.target.value; set("art", { ...draft.art, hues }); }}
                           className="h-10 w-full cursor-pointer rounded-lg border border-brand-900/12" />
                  </Field>
                ))}
              </div>
            </div>
          </Panel>

          <Panel title="Details">
            <Field label="Author">
              <input value={draft.author} onChange={(e) => set("author", e.target.value)} className="field" placeholder="The kitchen" />
            </Field>
            <div className="mt-3">
              <Field label="Tags" hint="Comma separated. The first one shows on the card.">
                <input value={draft.tags.join(", ")}
                       onChange={(e) => set("tags", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))}
                       className="field" placeholder="Flowers, Behind the scenes" />
              </Field>
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}
