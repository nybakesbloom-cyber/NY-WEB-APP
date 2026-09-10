/**
 * Shapes and pure helpers only. The data itself lives in MongoDB and reaches
 * the client through <StoreProvider>; server components read it directly with
 * the helpers in src/server/queries.ts.
 */

export type ArtKind = "cake" | "bouquet" | "basket" | "combo" | "plant" | "hamper";

export type Category = {
  slug: string;
  name: string;
  blurb: string;
  art: ArtKind;
  hues: [string, string];
};

export type Occasion = {
  slug: string;
  name: string;
  blurb: string;
};

export type Variant = { label: string; delta: number };

export type Product = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  category: string;
  occasions: string[];
  price: number;
  mrp?: number;
  rating: number;
  reviews: number;
  art: ArtKind;
  hues: [string, string];
  /** Set when an image has been uploaded in the admin; overrides the drawn art. */
  imageUrl: string | null;
  imageAlt: string;
  variants: Variant[];
  flavours?: string[];
  contains: string[];
  description: string;
  care: string;
  bestseller?: boolean;
  eggless?: boolean;
  sameDay?: boolean;
};

export type Settings = {
  freeDeliveryOver: number;
  deliveryFee: number;
  codFee: number;
  currency: string;
  orderPrefix: string;
};

export const DEFAULT_SETTINGS: Settings = {
  freeDeliveryOver: 1499,
  deliveryFee: 99,
  codFee: 40,
  currency: "INR",
  orderPrefix: "NY",
};

export const DELIVERY_SLOTS = [
  { id: "standard", label: "Standard (9 AM – 9 PM)", fee: 0 },
  { id: "fixed", label: "Fixed 2-hour window", fee: 120 },
  { id: "midnight", label: "Midnight (11 PM – 12 AM)", fee: 250 },
  { id: "early", label: "Early morning (6 AM – 8 AM)", fee: 200 },
];

export function productPrice(product: Product, variantLabel?: string) {
  const variant =
    product.variants.find((v) => v.label === variantLabel) ?? product.variants[0];
  return product.price + (variant?.delta ?? 0);
}

export function filterProducts(
  products: Product[],
  opts: {
    category?: string;
    occasion?: string;
    maxPrice?: number;
    sort?: string;
    query?: string;
  },
) {
  let list = products.slice();

  if (opts.category) list = list.filter((p) => p.category === opts.category);
  if (opts.occasion) list = list.filter((p) => p.occasions.includes(opts.occasion!));
  if (opts.maxPrice) list = list.filter((p) => p.price <= opts.maxPrice!);
  if (opts.query) {
    const q = opts.query.toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
        p.category.includes(q),
    );
  }

  switch (opts.sort) {
    case "price-asc":
      list.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      list.sort((a, b) => b.price - a.price);
      break;
    case "rating":
      list.sort((a, b) => b.rating - a.rating);
      break;
    default:
      list.sort(
        (a, b) => Number(!!b.bestseller) - Number(!!a.bestseller) || b.reviews - a.reviews,
      );
  }

  return list;
}
