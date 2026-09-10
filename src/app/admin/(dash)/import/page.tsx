"use client";

import { useRef, useState } from "react";
import { csvToObjects, PRODUCT_COLUMNS } from "@/lib/csv";
import { send, PageHead, Panel, Field, ErrorBox } from "@/components/admin/ui";

type Issue = { row: number; slug: string; error: string };

type DryRun = {
  ok: boolean;
  willCreate: number;
  willUpdate: number;
  issues: Issue[];
  preview: { slug: string; name: string; price: number }[];
};

export default function ImportPage() {
  const file = useRef<HTMLInputElement>(null);

  const [rows, setRows] = useState<Record<string, unknown>[] | null>(null);
  const [fileName, setFileName] = useState("");
  const [check, setCheck] = useState<DryRun | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  /* ------------------------------------------------ starter catalogue */
  async function loadStarter(replace: boolean) {
    const what = replace
      ? "Overwrite the catalogue and all site copy with the built-in starter set?"
      : "Add the built-in starter catalogue? Anything already here is left alone.";
    if (!confirm(what)) return;

    setBusy(true);
    setError(null);
    setDone(null);
    try {
      const r = await send<{ products: { written: number; skipped: number }; content: { written: number; skipped: number } }>(
        "/api/admin/import",
        "POST",
        { kind: "starter", replace },
      );
      setDone(
        `Products: ${r.products.written} written, ${r.products.skipped} left alone. ` +
          `Site copy: ${r.content.written} written, ${r.content.skipped} left alone.`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setBusy(false);
    }
  }

  /* ------------------------------------------------------- file import */
  async function pick(files: FileList | null) {
    const f = files?.[0];
    if (!f) return;
    setError(null);
    setDone(null);
    setCheck(null);
    setIssues([]);
    setFileName(f.name);

    try {
      const text = await f.text();
      const parsed = f.name.toLowerCase().endsWith(".json")
        ? (JSON.parse(text) as Record<string, unknown>[])
        : csvToObjects(text);

      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error("No rows found in that file");
      }
      setRows(parsed);

      // Validate before anything is written.
      const res = await fetch("/api/admin/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "products", rows: parsed, dryRun: true }),
      });
      const data = await res.json();
      if (res.status === 422) setIssues(data.issues ?? []);
      else if (!res.ok) throw new Error(data.error ?? "Could not read that file");
      else setCheck(data as DryRun);
    } catch (err) {
      setRows(null);
      setError(err instanceof Error ? err.message : "Could not read that file");
    }
  }

  async function commit() {
    if (!rows) return;
    setBusy(true);
    setError(null);
    try {
      const r = await send<{ created: number; updated: number }>("/api/admin/import", "POST", {
        kind: "products",
        rows,
        replace: true,
      });
      setDone(`Imported ${r.created} new and updated ${r.updated} existing products.`);
      setRows(null);
      setCheck(null);
      setFileName("");
      if (file.current) file.current.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHead
        title="Import & export"
        sub="Load the starter catalogue, or bring your own products in from a spreadsheet."
      />

      {error && <div className="mb-4"><ErrorBox message={error} /></div>}
      {done && (
        <p className="mb-4 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-[0.88rem] text-emerald-800">
          {done}
        </p>
      )}

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Starter catalogue">
          <p className="text-[0.88rem] leading-relaxed text-brand-700/80">
            Writes the 24 built-in products and the 9 blocks of site copy — hero, promises,
            reviews, categories, occasions, the five production stages, footer and store settings.
            This is the same data the command-line seed writes, so you never need a terminal to get
            a fresh database going.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={() => loadStarter(false)} disabled={busy} className="btn btn-gold px-5 py-2.5 text-[0.84rem]">
              {busy ? "Working…" : "Add what is missing"}
            </button>
            <button onClick={() => loadStarter(true)} disabled={busy} className="btn btn-outline px-5 py-2.5 text-[0.84rem] text-red-700">
              Overwrite everything
            </button>
          </div>
          <p className="mt-3 text-[0.75rem] leading-relaxed text-brand-700/55">
            <strong>Add what is missing</strong> leaves anything you have already edited alone.
            <strong> Overwrite</strong> replaces all 24 products and every content block with the
            originals — your own edits to those are lost.
          </p>
        </Panel>

        <Panel title="Export">
          <p className="text-[0.88rem] leading-relaxed text-brand-700/80">
            Download the catalogue as a spreadsheet, edit prices or copy in Excel or Sheets, then
            bring it back with the importer below. The two formats match, so a round trip is safe.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <a href="/api/admin/export?format=csv" className="btn btn-emerald px-5 py-2.5 text-[0.84rem]">
              Download CSV
            </a>
            <a href="/api/admin/export?format=json" className="btn btn-outline px-5 py-2.5 text-[0.84rem]">
              Download JSON
            </a>
          </div>
        </Panel>
      </div>

      <Panel title="Import products from a file" className="mt-4">
        <Field label="Choose a CSV or JSON file" hint="It is checked before anything is written.">
          <input
            ref={file}
            type="file"
            accept=".csv,.json,text/csv,application/json"
            onChange={(e) => pick(e.target.files)}
            className="text-[0.85rem] file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-brand-800 file:px-4 file:py-2 file:text-[0.8rem] file:font-semibold file:text-gold-100"
          />
        </Field>

        {issues.length > 0 && (
          <div className="mt-4 rounded-lg border border-red-300 bg-red-50 p-4">
            <p className="text-[0.85rem] font-semibold text-red-800">
              {fileName} has {issues.length} problem{issues.length === 1 ? "" : "s"}. Nothing was
              written — fix the file and choose it again.
            </p>
            <ul className="mt-2.5 space-y-1 text-[0.8rem] text-red-800/90">
              {issues.map((i, n) => (
                <li key={n}>
                  <span className="font-mono">row {i.row}</span>
                  {i.slug && <span className="font-mono"> ({i.slug})</span>} — {i.error}
                </li>
              ))}
            </ul>
          </div>
        )}

        {check?.ok && (
          <div className="mt-4 rounded-lg border border-gold-400/50 bg-gold-50 p-4">
            <p className="text-[0.88rem] font-semibold text-brand-900">
              {fileName} checks out — {check.willCreate} new, {check.willUpdate} to update.
            </p>
            {check.preview.length > 0 && (
              <ul className="mt-2.5 space-y-0.5 text-[0.8rem] text-brand-800/85">
                {check.preview.map((p) => (
                  <li key={p.slug}>
                    <span className="font-mono text-brand-700/60">{p.slug}</span> — {p.name} · ₹
                    {p.price}
                  </li>
                ))}
                {check.willCreate + check.willUpdate > check.preview.length && (
                  <li className="text-brand-700/55">
                    …and {check.willCreate + check.willUpdate - check.preview.length} more
                  </li>
                )}
              </ul>
            )}
            <button onClick={commit} disabled={busy} className="btn btn-gold mt-4 px-5 py-2.5 text-[0.84rem]">
              {busy ? "Importing…" : `Import ${check.willCreate + check.willUpdate} products`}
            </button>
          </div>
        )}

        <details className="mt-5 rounded-lg border border-brand-900/8 bg-brand-50/50 p-4">
          <summary className="cursor-pointer text-[0.82rem] font-semibold text-brand-900">
            What the file should look like
          </summary>
          <p className="mt-2.5 text-[0.82rem] leading-relaxed text-brand-700/80">
            One row per product. <code className="font-mono">slug</code>,{" "}
            <code className="font-mono">name</code> and <code className="font-mono">price</code> are
            required; everything else falls back to a sensible default. Lists use a{" "}
            <code className="font-mono">|</code> between values, and weight options are{" "}
            <code className="font-mono">label:extra</code> — so{" "}
            <code className="font-mono">500 g:0|1 kg:550</code> means a kilo costs ₹550 more.
            Matching happens on <code className="font-mono">slug</code>, so re-importing an edited
            export updates rather than duplicates.
          </p>
          <pre className="mt-3 overflow-x-auto rounded bg-white p-3 font-mono text-[0.72rem] leading-relaxed text-brand-800">
{PRODUCT_COLUMNS.join(",")}
{"\n"}rose-box,Roses boxed,Twelve stems in a hat box,flowers,love|anniversary,1299,1599,4.8,120,bouquet,#A6122B,#E8607A,Standard:0|Large:600,,12 roses|Hat box,A dozen roses in a lined box.,Recut the stems.,yes,no,yes,yes,0
          </pre>
        </details>
      </Panel>
    </>
  );
}
