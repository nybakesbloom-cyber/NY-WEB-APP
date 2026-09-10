"use client";

import { createContext, useContext, useMemo } from "react";
import type { Category, Occasion, Product, Settings } from "@/lib/catalog";

export type Store = {
  products: Product[];
  categories: Category[];
  occasions: Occasion[];
  settings: Settings;
  announcements: string[];
  header: {
    searchPlaceholder?: string;
    cities?: string[];
    cutoffLabel?: string;
    cutoffRolledLabel?: string;
    cartLabel?: string;
  };
  theme: Record<string, string>;
};

type StoreValue = Store & {
  bySlug: Map<string, Product>;
  getProduct: (slug: string) => Product | undefined;
};

const StoreContext = createContext<StoreValue | null>(null);

/**
 * The catalogue, fetched once by the root layout and handed to the client so
 * the cart, drawer and toast can resolve a slug without another round trip.
 */
export function StoreProvider({ value, children }: { value: Store; children: React.ReactNode }) {
  const store = useMemo<StoreValue>(() => {
    const bySlug = new Map(value.products.map((p) => [p.slug, p]));
    return { ...value, bySlug, getProduct: (slug) => bySlug.get(slug) };
  }, [value]);

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}
