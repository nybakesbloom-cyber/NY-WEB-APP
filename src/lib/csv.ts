/**
 * A small CSV reader/writer. Shop catalogues arrive as spreadsheet exports, so
 * this has to cope with quoted fields containing commas and newlines — which is
 * most of what a CSV parser is for.
 */

export function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  // Strip a BOM — Excel adds one and it corrupts the first header.
  const src = text.replace(/^﻿/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  for (let i = 0; i < src.length; i++) {
    const c = src[i];

    if (inQuotes) {
      if (c === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
      continue;
    }

    if (c === '"') inQuotes = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += c;
  }

  if (field !== "" || row.length) {
    row.push(field);
    rows.push(row);
  }

  // Drop trailing blank lines.
  return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
}

/** Header row plus objects keyed by that header. */
export function csvToObjects(text: string): Record<string, string>[] {
  const rows = parseCSV(text);
  if (rows.length < 2) return [];
  const header = rows[0].map((h) => h.trim());
  return rows.slice(1).map((r) => {
    const o: Record<string, string> = {};
    header.forEach((h, i) => (o[h] = (r[i] ?? "").trim()));
    return o;
  });
}

function escape(value: unknown) {
  const s = value === null || value === undefined ? "" : String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCSV(header: string[], rows: Record<string, unknown>[]) {
  return [header.join(","), ...rows.map((r) => header.map((h) => escape(r[h])).join(","))].join("\n");
}

/* ------------------------------------------------------------------ *
 * Product shape used by both import and export, so a file exported from
 * the admin can be edited in a spreadsheet and imported straight back.
 * ------------------------------------------------------------------ */

export const PRODUCT_COLUMNS = [
  "slug", "name", "tagline", "category", "occasions",
  "price", "mrp", "rating", "reviews",
  "art", "hue1", "hue2",
  "variants", "flavours", "contains",
  "description", "care",
  "bestseller", "eggless", "sameDay", "active", "sort",
] as const;

const ART_KINDS = ["cake", "bouquet", "basket", "combo", "plant", "hamper"];

const list = (v: string) => v.split("|").map((x) => x.trim()).filter(Boolean);
const bool = (v: string) => /^(1|true|yes|y)$/i.test(v.trim());
const num = (v: string) => (v.trim() === "" ? undefined : Number(v));

export type ImportIssue = { row: number; slug: string; error: string };

/** Turn one CSV/JSON row into a product document, or explain why it cannot. */
export function rowToProduct(
  raw: Record<string, unknown>,
  index: number,
): { doc?: Record<string, unknown>; issue?: ImportIssue } {
  const get = (k: string) => String(raw[k] ?? "").trim();
  const slug = get("slug").toLowerCase().replace(/[^a-z0-9-]/g, "-");
  const at = index + 2; // +1 for the header, +1 for 1-based rows

  if (!slug) return { issue: { row: at, slug: "", error: "slug is required" } };
  if (!get("name")) return { issue: { row: at, slug, error: "name is required" } };

  const price = num(get("price"));
  if (price === undefined || !Number.isFinite(price) || price < 0) {
    return { issue: { row: at, slug, error: `price must be a number (got "${get("price")}")` } };
  }

  const art = get("art") || "cake";
  if (!ART_KINDS.includes(art)) {
    return { issue: { row: at, slug, error: `art must be one of ${ART_KINDS.join(", ")}` } };
  }

  // "500 g:0 | 1 kg:550"
  const variants = list(get("variants")).map((v) => {
    const idx = v.lastIndexOf(":");
    return idx === -1
      ? { label: v, delta: 0 }
      : { label: v.slice(0, idx).trim(), delta: Number(v.slice(idx + 1)) || 0 };
  });

  const mrp = num(get("mrp"));
  if (mrp !== undefined && mrp < price) {
    return { issue: { row: at, slug, error: "mrp is lower than price" } };
  }

  return {
    doc: {
      slug,
      name: get("name"),
      tagline: get("tagline"),
      category: get("category") || "cakes",
      occasions: list(get("occasions")),
      price,
      ...(mrp === undefined ? {} : { mrp }),
      rating: num(get("rating")) ?? 4.5,
      reviews: num(get("reviews")) ?? 0,
      art: { kind: art, hues: [get("hue1") || "#C9A227", get("hue2") || "#F0E1B4"] },
      variants: variants.length ? variants : [{ label: "Standard", delta: 0 }],
      flavours: list(get("flavours")),
      contains: list(get("contains")),
      description: get("description"),
      care: get("care"),
      bestseller: bool(get("bestseller")),
      eggless: bool(get("eggless")),
      sameDay: bool(get("sameDay")),
      active: raw.active === undefined || raw.active === "" ? true : bool(get("active")),
      sort: num(get("sort")) ?? 0,
    },
  };
}

/** The inverse, for export. */
export function productToRow(p: Record<string, unknown>) {
  const art = (p.art ?? {}) as { kind?: string; hues?: string[] };
  const variants = (p.variants ?? []) as { label: string; delta: number }[];
  return {
    slug: p.slug,
    name: p.name,
    tagline: p.tagline,
    category: p.category,
    occasions: ((p.occasions ?? []) as string[]).join("|"),
    price: p.price,
    mrp: p.mrp ?? "",
    rating: p.rating,
    reviews: p.reviews,
    art: art.kind ?? "cake",
    hue1: art.hues?.[0] ?? "",
    hue2: art.hues?.[1] ?? "",
    variants: variants.map((v) => `${v.label}:${v.delta}`).join("|"),
    flavours: ((p.flavours ?? []) as string[]).join("|"),
    contains: ((p.contains ?? []) as string[]).join("|"),
    description: p.description,
    care: p.care,
    bestseller: p.bestseller ? "yes" : "no",
    eggless: p.eggless ? "yes" : "no",
    sameDay: p.sameDay ? "yes" : "no",
    active: p.active ? "yes" : "no",
    sort: p.sort ?? 0,
  };
}
