"use client";

import Link from "next/link";
import { use, useState } from "react";
import { useApi, send, PageHead, Panel, Field, Loading, ErrorBox } from "@/components/admin/ui";

type Block = { key: string; label: string; data: Record<string, unknown> };

/**
 * Blocks whose shape is a flat list of strings get a friendly line-per-item
 * editor. Everything else is edited as JSON, which is honest about what it is
 * rather than pretending a generated form can cover every shape.
 */
const STRING_LISTS: Record<string, { field: string; label: string; hint: string }> = {
  announcements: { field: "items", label: "Announcements", hint: "One per line. They scroll across the top of every page." },
};

export default function ContentEditor({ params }: { params: Promise<{ key: string }> }) {
  const { key } = use(params);
  const { data, error, loading, reload } = useApi<{ item: Block }>(`/api/admin/content/${key}`);

  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const simple = STRING_LISTS[key];

  // Load the editor from the payload the first time it arrives, and again
  // after a save-and-reload, without synchronising through an effect.
  const [seededFrom, setSeededFrom] = useState<Block | null>(null);
  if (data?.item && data.item !== seededFrom) {
    setSeededFrom(data.item);
    setText(
      simple
        ? ((data.item.data[simple.field] ?? []) as string[]).join("\n")
        : JSON.stringify(data.item.data, null, 2),
    );
  }

  if (loading) return <Loading />;
  if (error) return <ErrorBox message={error} onRetry={reload} />;
  if (!data) return null;

  async function save() {
    setBusy(true);
    setProblem(null);
    setSaved(false);
    try {
      let payload: unknown;
      if (simple) {
        payload = { [simple.field]: text.split("\n").map((l) => l.trim()).filter(Boolean) };
      } else {
        try {
          payload = JSON.parse(text);
        } catch (err) {
          throw new Error(
            `That is not valid JSON — ${err instanceof Error ? err.message : "check the brackets and commas"}`,
          );
        }
      }
      await send(`/api/admin/content/${key}`, "PUT", { data: payload });
      setSaved(true);
      await reload();
    } catch (err) {
      setProblem(err instanceof Error ? err.message : "Could not save");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHead title={data.item.label || key} sub={simple ? simple.hint : "Edit the block below, then save."}>
        <Link href="/admin/content" className="btn btn-outline px-4 py-2 text-[0.82rem]">
          ← All content
        </Link>
        <Link href="/" target="_blank" className="btn btn-outline px-4 py-2 text-[0.82rem]">
          View shop ↗
        </Link>
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
          Saved and pushed to the shop.
        </p>
      )}

      <Panel>
        <Field label={simple ? simple.label : "Content"} hint={simple ? undefined : "JSON. Keep the shape — the site reads these keys by name."}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            spellCheck={!!simple}
            rows={simple ? 10 : 26}
            className="field resize-y font-mono text-[0.8rem] leading-relaxed"
          />
        </Field>
      </Panel>
    </>
  );
}
