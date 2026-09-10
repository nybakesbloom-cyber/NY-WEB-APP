import "server-only";
import { connectDB } from "./db";
import { Product as ProductModel } from "./models/Product";
import { Content } from "./models/Content";
import { Media } from "./models/Media";
import {
  DEFAULT_SETTINGS,
  type Category,
  type Occasion,
  type Product,
  type Settings,
} from "@/lib/catalog";
import type { ProcessStep } from "@/lib/process";

type Lean = Record<string, unknown>;

function toProduct(doc: Lean, imageAlt = ""): Product {
  const art = (doc.art ?? {}) as { kind?: string; hues?: string[] };
  const hues = (art.hues ?? ["#C9A227", "#F0E1B4"]) as string[];
  return {
    id: String(doc._id),
    slug: String(doc.slug),
    name: String(doc.name),
    tagline: String(doc.tagline ?? ""),
    category: String(doc.category),
    occasions: (doc.occasions ?? []) as string[],
    price: Number(doc.price),
    mrp: doc.mrp ? Number(doc.mrp) : undefined,
    rating: Number(doc.rating ?? 4.5),
    reviews: Number(doc.reviews ?? 0),
    art: (art.kind ?? "cake") as Product["art"],
    hues: [hues[0] ?? "#C9A227", hues[1] ?? "#F0E1B4"],
    imageUrl: doc.image ? `/api/media/${String(doc.image)}` : null,
    imageAlt,
    variants: (doc.variants ?? [{ label: "Standard", delta: 0 }]) as Product["variants"],
    flavours: (doc.flavours ?? []) as string[],
    contains: (doc.contains ?? []) as string[],
    description: String(doc.description ?? ""),
    care: String(doc.care ?? ""),
    bestseller: !!doc.bestseller,
    eggless: !!doc.eggless,
    sameDay: !!doc.sameDay,
  };
}

export async function getProducts(): Promise<Product[]> {
  await connectDB();
  const docs = await ProductModel.find({ active: true }).sort({ sort: 1, name: 1 }).lean();

  // One extra round trip for alt text rather than one per product.
  const imageIds = docs.map((d) => d.image).filter(Boolean).map(String);
  const alts = new Map<string, string>();
  if (imageIds.length) {
    const media = await Media.find({ _id: { $in: imageIds } }).select("alt").lean();
    for (const m of media) alts.set(String(m._id), m.alt ?? "");
  }

  return docs.map((d) => toProduct(d as Lean, alts.get(String(d.image)) ?? ""));
}

export async function getProduct(slug: string): Promise<Product | null> {
  await connectDB();
  const doc = await ProductModel.findOne({ slug, active: true }).lean();
  if (!doc) return null;
  let alt = "";
  if (doc.image) {
    const media = await Media.findById(doc.image).select("alt").lean();
    alt = media?.alt ?? "";
  }
  return toProduct(doc as Lean, alt);
}

/** One content block, with a fallback so a missing document never 500s a page. */
export async function getContent<T>(key: string, fallback: T): Promise<T> {
  await connectDB();
  const doc = await Content.findOne({ key }).lean();
  return (doc?.data as T) ?? fallback;
}

export async function getCategories() {
  const { items } = await getContent<{ items: Category[] }>("categories", { items: [] });
  return items;
}

export async function getOccasions() {
  const { items } = await getContent<{ items: Occasion[] }>("occasions", { items: [] });
  return items;
}

export async function getProcess() {
  const { items } = await getContent<{ items: ProcessStep[] }>("process", { items: [] });
  return items;
}

export async function getAnnouncements() {
  const { items } = await getContent<{ items: string[] }>("announcements", { items: [] });
  return items;
}

export type Sections = Record<string, string>;

export async function getSections() {
  return getContent<Sections>("sections", {});
}

export async function getTheme() {
  return getContent<Record<string, string>>("theme", {});
}

export async function getHeader() {
  return getContent<{
    searchPlaceholder?: string;
    cities?: string[];
    cutoffLabel?: string;
    cutoffRolledLabel?: string;
    cartLabel?: string;
  }>("header", {});
}

export async function getSettings(): Promise<Settings> {
  return { ...DEFAULT_SETTINGS, ...(await getContent<Partial<Settings>>("settings", {})) };
}

/** Everything the client bundle needs, fetched once in the root layout. */
export async function getStore() {
  const [products, categories, occasions, settings, announcements, header, theme] =
    await Promise.all([
      getProducts(),
      getCategories(),
      getOccasions(),
      getSettings(),
      getAnnouncements(),
      getHeader(),
      getTheme(),
    ]);
  return { products, categories, occasions, settings, announcements, header, theme };
}
