"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { useApi, send, PageHead, Panel, Field, Loading, ErrorBox } from "@/components/admin/ui";

type Variant = { label: string; delta: number };
type Draft = {
  _id?: string;
  slug: string; name: string; tagline: string; category: string;
  occasions: string[]; price: number; mrp?: number;
  rating: number; reviews: number;
  art: { kind: string; hues: string[] };
  image: string | null;
  variants: Variant[]; flavours: string[]; contains: string[];
  description: string; care: string;
  bestseller: boolean; eggless: boolean; sameDay: boolean;
  active: boolean; sort: number;
};

type MediaItem = { _id: string; filename: string; alt: string };

const BLANK: Draft = {
  slug: "", name: "", tagline: "", category: "cakes", occasions: [],
  price: 0, rating: 4.5, reviews: 0,
  art: { kind: "cake", hues: ["#C9A227", "#F0E1B4"] },
  image: null,
  variants: [{ label: "Standard", delta: 0 }],
  flavours: [], contains: [], description: "", care: "",
  bestseller: false, eggless: false, sameDay: false, active: true, sort: 0,
};

const CATEGORIES = ["cakes", "flowers", "combos", "plants", "hampers"];
const ART_KINDS = ["cake", "bouquet", "basket", "combo", "plant", "hamper"];
const OCCASIONS = ["birthday", "anniversary", "love", "congratulations", "wedding", "thank-you", "new-baby", "sympathy"];

const list = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);

export default function ProductEditor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const isNew = id === "new";
  const router = useRouter();

  const { data, error, loading, reload } = useApi<{ item: Draft }>(
    isNew ? null : `/api/admin/products/${id}`,
  );
  const media = useApi<{ items: MediaItem[] }>("/api/admin/media");

  const [draft, setDraft] = useState<Draft | null>(isNew ? BLANK : null);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Seed the form the first time a payload arrives, and again after a reload.
  // Adjusting state during render on a changed value is React's documented
  // alternative to synchronising with an effect.
  const [seededFrom, setSeededFrom] = useState<Draft | null>(null);
  if (data?.item && data.item !== seededFrom) {
    setSeededFrom(data.item);
    setDraft({ ...BLANK, ...data.item });
  }

  if (!isNew && loading) return <Loading />;
  if (error) return <ErrorBox message={error} onRetry={reload} />;
  if (!draft) return <Loading />;

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((d) => (d ? { ...d, [key]: value } : d));

  async function save() {
    if (!draft) return;
    setBusy(true);
    setProblem(null);
    setSaved(false);
    try {
      if (isNew) {
        const res = await send<{ item: { _id: string } }>("/api/admin/products", "POST", draft);
        router.replace(`/admin/products/${res.item._id}`);
      } else {
        await send(`/api/admin/products/${id}`, "PATCH", draft);
        setSaved(true);
      }
    } catch (err) {
      setProblem(err instanceof Error ? err.message : "Could not save");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHead
        title={isNew ? "New product" : draft.name || "Product"}
        sub={isNew ? "It goes live as soon as you save it." : `/product/${draft.slug}`}
      >
        <Link href="/admin/products" className="btn btn-outline px-4 py-2 text-[0.82rem]">
          ← All products
        </Link>
        {!isNew && (
          <Link href={`/product/${draft.slug}`} target="_blank" className="btn btn-outline px-4 py-2 text-[0.82rem]">
            View on shop ↗
          </Link>
        )}
        <button onClick={save} disabled={busy} className="btn btn-gold px-5 py-2 text-[0.82rem]">
          {busy ? "Saving…" : "Save"}
        </button>
      </PageHead>

      {problem && (
        <p role="alert" className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-[0.85rem] text-red-800">
          {problem}
        </p>
      )}
      {saved && (
        <p className="mb-4 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-[0.85rem] text-emerald-800">
          Saved. The shop picks this up on its next load.
        </p>
      )}

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          <Panel title="The basics">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Name">
                <input value={draft.name} onChange={(e) => set("name", e.target.value)} className="field" />
              </Field>
              <Field label="Slug" hint="The URL. Changing it breaks existing links.">
                <input
                  value={draft.slug}
                  onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                  className="field font-mono text-[0.85rem]"
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Tagline">
                  <input value={draft.tagline} onChange={(e) => set("tagline", e.target.value)} className="field" />
                </Field>
              </div>
              <Field label="Category">
                <select value={draft.category} onChange={(e) => set("category", e.target.value)} className="field">
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Sort order" hint="Lower shows first.">
                <input type="number" value={draft.sort} onChange={(e) => set("sort", Number(e.target.value))} className="field" />
              </Field>
            </div>
          </Panel>

          <Panel title="Price">
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Price (₹)">
                <input type="number" min="0" value={draft.price} onChange={(e) => set("price", Number(e.target.value))} className="field" />
              </Field>
              <Field label="Was (₹)" hint="Leave blank for no discount badge.">
                <input
                  type="number"
                  min="0"
                  value={draft.mrp ?? ""}
                  onChange={(e) => set("mrp", e.target.value === "" ? undefined : Number(e.target.value))}
                  className="field"
                />
              </Field>
              <Field label="Rating">
                <input type="number" min="0" max="5" step="0.1" value={draft.rating} onChange={(e) => set("rating", Number(e.target.value))} className="field" />
              </Field>
            </div>

            <div className="mt-4">
              <p className="mb-2 text-[0.76rem] font-semibold text-brand-800">
                Weight / size options
                <span className="ml-2 font-normal text-brand-700/55">extra added to the price</span>
              </p>
              {draft.variants.map((v, i) => (
                <div key={i} className="mb-2 flex gap-2">
                  <input
                    value={v.label}
                    onChange={(e) => {
                      const next = [...draft.variants];
                      next[i] = { ...v, label: e.target.value };
                      set("variants", next);
                    }}
                    className="field flex-1"
                    placeholder="500 g"
                  />
                  <input
                    type="number"
                    value={v.delta}
                    onChange={(e) => {
                      const next = [...draft.variants];
                      next[i] = { ...v, delta: Number(e.target.value) };
                      set("variants", next);
                    }}
                    className="field w-28"
                  />
                  <button
                    onClick={() => set("variants", draft.variants.filter((_, j) => j !== i))}
                    disabled={draft.variants.length === 1}
                    className="rounded-lg border border-red-200 px-3 text-[0.8rem] text-red-700 disabled:opacity-30"
                    aria-label="Remove option"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                onClick={() => set("variants", [...draft.variants, { label: "", delta: 0 }])}
                className="btn btn-outline mt-1 px-3 py-1.5 text-[0.78rem]"
              >
                + Add an option
              </button>
            </div>
          </Panel>

          <Panel title="Copy">
            <div className="space-y-3">
              <Field label="Description">
                <textarea rows={4} value={draft.description} onChange={(e) => set("description", e.target.value)} className="field resize-y" />
              </Field>
              <Field label="Care note">
                <textarea rows={2} value={draft.care} onChange={(e) => set("care", e.target.value)} className="field resize-y" />
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="What arrives" hint="One per line.">
                  <textarea rows={5} value={draft.contains.join("\n")} onChange={(e) => set("contains", list(e.target.value))} className="field resize-y font-mono text-[0.8rem]" />
                </Field>
                <Field label="Flavours" hint="One per line. Leave empty for non-cakes.">
                  <textarea rows={5} value={draft.flavours.join("\n")} onChange={(e) => set("flavours", list(e.target.value))} className="field resize-y font-mono text-[0.8rem]" />
                </Field>
              </div>
            </div>
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel title="Picture">
            <div className="mb-3 aspect-square overflow-hidden rounded-xl border border-brand-900/8 bg-brand-50">
              {draft.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={`/api/media/${draft.image}`} alt="" className="h-full w-full object-cover" />
              ) : (
                <div
                  className="grid h-full w-full place-items-center text-center text-[0.78rem] text-brand-900/60"
                  style={{ background: `linear-gradient(135deg, ${draft.art.hues[0]}, ${draft.art.hues[1]})` }}
                >
                  Drawn artwork
                </div>
              )}
            </div>

            <Field label="Use an uploaded photo">
              <select
                value={draft.image ?? ""}
                onChange={(e) => set("image", e.target.value || null)}
                className="field"
              >
                <option value="">None — use the drawn artwork</option>
                {media.data?.items.map((m) => (
                  <option key={m._id} value={m._id}>{m.filename}</option>
                ))}
              </select>
            </Field>
            <Link href="/admin/media" className="mt-2 inline-block text-[0.78rem] font-semibold text-gold-700 hover:text-gold-600">
              Upload images →
            </Link>

            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-brand-900/8 pt-4">
              <Field label="Artwork style">
                <select
                  value={draft.art.kind}
                  onChange={(e) => set("art", { ...draft.art, kind: e.target.value })}
                  className="field"
                >
                  {ART_KINDS.map((k) => <option key={k} value={k}>{k}</option>)}
                </select>
              </Field>
              <div className="grid grid-cols-2 gap-2">
                {[0, 1].map((i) => (
                  <Field key={i} label={i === 0 ? "Subject" : "Ground"}>
                    <input
                      type="color"
                      value={draft.art.hues[i] ?? "#C9A227"}
                      onChange={(e) => {
                        const hues = [...draft.art.hues];
                        hues[i] = e.target.value;
                        set("art", { ...draft.art, hues });
                      }}
                      className="h-10 w-full cursor-pointer rounded-lg border border-brand-900/12"
                    />
                  </Field>
                ))}
              </div>
            </div>
          </Panel>

          <Panel title="Where it shows">
            <p className="mb-2 text-[0.76rem] font-semibold text-brand-800">Occasions</p>
            <div className="flex flex-wrap gap-1.5">
              {OCCASIONS.map((o) => {
                const on = draft.occasions.includes(o);
                return (
                  <button
                    key={o}
                    onClick={() =>
                      set("occasions", on ? draft.occasions.filter((x) => x !== o) : [...draft.occasions, o])
                    }
                    className={`rounded-full px-3 py-1.5 text-[0.76rem] font-medium transition ${
                      on ? "bg-brand-800 text-gold-100" : "border border-brand-900/12 text-brand-800 hover:border-gold-500"
                    }`}
                  >
                    {o}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 space-y-2 border-t border-brand-900/8 pt-4">
              {([
                ["active", "Live on the shop"],
                ["bestseller", "Show as a bestseller"],
                ["eggless", "Eggless available"],
                ["sameDay", "Same-day delivery"],
              ] as const).map(([key, label]) => (
                <label key={key} className="flex items-center gap-2.5 text-[0.85rem] text-brand-800">
                  <input
                    type="checkbox"
                    checked={draft[key] as boolean}
                    onChange={(e) => set(key, e.target.checked as Draft[typeof key])}
                    className="h-4 w-4 accent-[#C9A227]"
                  />
                  {label}
                </label>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}
