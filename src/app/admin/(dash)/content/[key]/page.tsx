"use client";

import Link from "next/link";
import { use, useState } from "react";
import { CONTENT_SCHEMA } from "@/lib/contentSchema";
import SchemaForm from "@/components/admin/SchemaForm";
import { useApi, send, PageHead, Panel, Field, Loading, ErrorBox } from "@/components/admin/ui";

type Block = { key: string; label: string; data: Record<string, unknown> };

export default function ContentEditor({ params }: { params: Promise<{ key: string }> }) {
  const { key } = use(params);
  const { data, error, loading, reload } = useApi<{ item: Block }>(`/api/admin/content/${key}`);
  const schema = CONTENT_SCHEMA[key];

  const [draft, setDraft] = useState<Record<string, unknown> | null>(null);
  const [text, setText] = useState("");
  const [raw, setRaw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Seed the editor from the payload without synchronising through an effect.
  const [seededFrom, setSeededFrom] = useState<Block | null>(null);
  if (data?.item && data.item !== seededFrom) {
    setSeededFrom(data.item);
    setDraft(data.item.data ?? {});
    setText(JSON.stringify(data.item.data ?? {}, null, 2));
  }

  if (loading) return <Loading />;
  if (error) return <ErrorBox message={error} onRetry={reload} />;
  if (!data || draft === null) return <Loading />;

  async function save() {
    setBusy(true);
    setProblem(null);
    setSaved(false);
    try {
      const usingJson = raw || !schema;
      let payload: unknown = draft;
      if (usingJson) {
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
      setSeededFrom(null); // force a re-seed from the saved payload
      await reload();
    } catch (err) {
      setProblem(err instanceof Error ? err.message : "Could not save");
    } finally {
      setBusy(false);
    }
  }

  function toggleRaw() {
    if (!raw) setText(JSON.stringify(draft, null, 2));
    else {
      try {
        setDraft(JSON.parse(text));
      } catch {
        setProblem("Fix the JSON before switching back to the form.");
        return;
      }
    }
    setRaw(!raw);
    setProblem(null);
  }

  return (
    <>
      <PageHead title={schema?.label ?? data.item.label ?? key} sub={schema?.where}>
        <Link href="/admin/content" className="btn btn-outline px-4 py-2 text-[0.82rem]">
          ← All sections
        </Link>
        <Link href="/" target="_blank" className="btn btn-outline px-4 py-2 text-[0.82rem]">
          View shop ↗
        </Link>
        {schema && (
          <button onClick={toggleRaw} className="btn btn-outline px-4 py-2 text-[0.82rem]">
            {raw ? "Back to the form" : "Edit as JSON"}
          </button>
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
          Saved and pushed to the shop.
        </p>
      )}

      <Panel>
        {schema && !raw ? (
          <SchemaForm fields={schema.fields} value={draft} onChange={setDraft} />
        ) : (
          <Field
            label="Content"
            hint={
              schema
                ? "The form covers everything here — JSON is for bulk edits."
                : "This block has no form yet, so it is edited as JSON. Keep the shape."
            }
          >
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={26}
              className="field resize-y font-mono text-[0.8rem] leading-relaxed"
            />
          </Field>
        )}
      </Panel>
    </>
  );
}
