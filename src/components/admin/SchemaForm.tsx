"use client";

import { useState } from "react";
import { useApi } from "./ui";
import type { Field } from "@/lib/contentSchema";

type Value = Record<string, unknown>;

/** "primary.label" reaches into a nested object without a special field type. */
function readPath(obj: Value, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, part) => {
    if (acc && typeof acc === "object") return (acc as Value)[part];
    return undefined;
  }, obj);
}

function writePath(obj: Value, path: string, value: unknown): Value {
  const [head, ...rest] = path.split(".");
  if (rest.length === 0) return { ...obj, [head]: value };
  const child = (obj[head] && typeof obj[head] === "object" ? obj[head] : {}) as Value;
  return { ...obj, [head]: writePath(child, rest.join("."), value) };
}
type MediaItem = { _id: string; filename: string; alt: string };

/* ------------------------------------------------------------------ bits */

function Label({ field, children }: { field: Field; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[0.76rem] font-semibold text-brand-800">{field.label}</span>
      {children}
      {"hint" in field && field.hint && (
        <span className="mt-1 block text-[0.7rem] leading-relaxed text-brand-700/55">{field.hint}</span>
      )}
    </label>
  );
}

function ImagePicker({
  value,
  onChange,
  media,
}: {
  value: string;
  onChange: (v: string) => void;
  media: MediaItem[];
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-brand-900/10 bg-brand-50">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`/api/media/${value}`} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="grid h-full w-full place-items-center text-[0.6rem] text-brand-700/45">none</span>
        )}
      </div>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="field flex-1">
        <option value="">No image — use the drawn artwork</option>
        {media.map((m) => (
          <option key={m._id} value={m._id}>{m.filename}</option>
        ))}
      </select>
    </div>
  );
}

function StringList({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  return (
    <div className="space-y-1.5">
      {value.map((line, i) => (
        <div key={i} className="flex gap-1.5">
          <input
            value={line}
            onChange={(e) => onChange(value.map((v, j) => (j === i ? e.target.value : v)))}
            className="field flex-1"
          />
          <button
            type="button"
            onClick={() => onChange(value.filter((_, j) => j !== i))}
            aria-label="Remove"
            className="rounded-lg border border-red-200 px-3 text-[0.8rem] text-red-700 hover:bg-red-50"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...value, ""])}
        className="btn btn-outline px-3 py-1.5 text-[0.76rem]"
      >
        + Add
      </button>
    </div>
  );
}

/* ---------------------------------------------------------------- fields */

function FieldInput({
  field,
  value,
  onChange,
  media,
}: {
  field: Field;
  value: unknown;
  onChange: (v: unknown) => void;
  media: MediaItem[];
}) {
  switch (field.type) {
    case "textarea":
      return (
        <Label field={field}>
          <textarea
            rows={field.rows ?? 3}
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
            className="field resize-y"
          />
        </Label>
      );

    case "number":
      return (
        <Label field={field}>
          <input
            type="number"
            min={field.min}
            max={field.max}
            step="any"
            value={value === undefined || value === null ? "" : Number(value)}
            onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
            className="field"
          />
        </Label>
      );

    case "color":
      return (
        <Label field={field}>
          <div className="flex gap-2">
            <input
              type="color"
              value={String(value ?? "#C9A227")}
              onChange={(e) => onChange(e.target.value)}
              className="h-10 w-14 cursor-pointer rounded-lg border border-brand-900/12"
            />
            <input
              value={String(value ?? "")}
              onChange={(e) => onChange(e.target.value)}
              className="field flex-1 font-mono text-[0.82rem]"
              placeholder="#C9A227"
            />
          </div>
        </Label>
      );

    case "boolean":
      return (
        <label className="flex items-center gap-2.5 pt-6 text-[0.85rem] text-brand-800">
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => onChange(e.target.checked)}
            className="h-4 w-4 accent-[#C9A227]"
          />
          {field.label}
        </label>
      );

    case "select":
      return (
        <Label field={field}>
          <select value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} className="field">
            {field.options.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </Label>
      );

    case "image":
      return (
        <Label field={field}>
          <ImagePicker value={String(value ?? "")} onChange={onChange} media={media} />
        </Label>
      );

    case "strings":
      return (
        <Label field={field}>
          <StringList value={Array.isArray(value) ? (value as string[]) : []} onChange={onChange} />
        </Label>
      );

    case "list":
      return (
        <ListEditor
          field={field}
          value={Array.isArray(value) ? (value as Value[]) : []}
          onChange={onChange}
          media={media}
        />
      );

    default:
      return (
        <Label field={field}>
          <input
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
            placeholder={"placeholder" in field ? field.placeholder : undefined}
            className="field"
          />
        </Label>
      );
  }
}

function ListEditor({
  field,
  value,
  onChange,
  media,
}: {
  field: Extract<Field, { type: "list" }>;
  value: Value[];
  onChange: (v: Value[]) => void;
  media: MediaItem[];
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const set = (i: number, key: string, v: unknown) =>
    onChange(value.map((row, j) => (j === i ? { ...row, [key]: v } : row)));

  const move = (i: number, by: number) => {
    const j = i + by;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
    setOpenIndex(j);
  };

  return (
    <div>
      <p className="mb-2 text-[0.76rem] font-semibold text-brand-800">{field.label}</p>
      {field.hint && <p className="mb-2 text-[0.7rem] text-brand-700/55">{field.hint}</p>}

      <div className="space-y-2">
        {value.map((row, i) => {
          const open = openIndex === i;
          const title =
            String(row.name ?? row.title ?? row.label ?? row.text ?? row.clock ?? "") ||
            `${field.itemLabel} ${i + 1}`;
          return (
            <div key={i} className="rounded-lg border border-brand-900/10 bg-white">
              <div className="flex items-center gap-2 px-3 py-2">
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? null : i)}
                  className="min-w-0 flex-1 text-left text-[0.85rem] font-semibold text-brand-900"
                >
                  <span className="mr-2 font-mono text-[0.7rem] text-gold-600">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="truncate">{title}</span>
                </button>
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0}
                  aria-label="Move up" className="rounded px-1.5 text-brand-700 disabled:opacity-25">↑</button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === value.length - 1}
                  aria-label="Move down" className="rounded px-1.5 text-brand-700 disabled:opacity-25">↓</button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Remove ${title}?`)) onChange(value.filter((_, j) => j !== i));
                  }}
                  aria-label="Remove"
                  className="rounded border border-red-200 px-2 py-0.5 text-[0.72rem] text-red-700 hover:bg-red-50"
                >
                  Remove
                </button>
              </div>

              {open && (
                <div className="grid gap-3 border-t border-brand-900/8 p-3 sm:grid-cols-2">
                  {field.fields.map((f) => (
                    <div key={f.key} className={f.type === "textarea" || f.type === "list" ? "sm:col-span-2" : ""}>
                      <FieldInput field={f} value={row[f.key]} onChange={(v) => set(i, f.key, v)} media={media} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => {
          onChange([...value, {}]);
          setOpenIndex(value.length);
        }}
        className="btn btn-outline mt-2 px-3 py-1.5 text-[0.76rem]"
      >
        + Add {field.itemLabel.toLowerCase()}
      </button>
    </div>
  );
}

/* ----------------------------------------------------------------- form */

export default function SchemaForm({
  fields,
  value,
  onChange,
}: {
  fields: Field[];
  value: Value;
  onChange: (v: Value) => void;
}) {
  const media = useApi<{ items: MediaItem[] }>("/api/admin/media?limit=100");

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map((f) => (
        <div
          key={f.key}
          className={f.type === "list" || f.type === "strings" || f.type === "textarea" ? "sm:col-span-2" : ""}
        >
          <FieldInput
            field={f}
            value={readPath(value, f.key)}
            onChange={(v) => onChange(writePath(value, f.key, v))}
            media={media.data?.items ?? []}
          />
        </div>
      ))}
    </div>
  );
}
