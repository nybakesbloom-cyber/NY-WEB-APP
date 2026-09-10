"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { productPrice, type Product } from "@/lib/catalog";
import { useStore } from "./StoreProvider";

export type CartLine = {
  id: string;
  slug: string;
  variant: string;
  flavour?: string;
  message?: string;
  qty: number;
};

type CartState = {
  lines: CartLine[];
  ready: boolean;
  count: number;
  subtotal: number;
  add: (line: Omit<CartLine, "id">) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  /** Slide-over mini cart */
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  /** The line most recently added, for the confirmation toast */
  toast: CartLine | null;
  dismissToast: () => void;
};

const CartContext = createContext<CartState | null>(null);
const KEY = "ny-bakes-and-bloom-cart-v1";

function lineId(l: Omit<CartLine, "id">) {
  return [l.slug, l.variant, l.flavour ?? "", l.message ?? ""].join("|");
}

export function unitPrice(line: CartLine, product?: Product) {
  if (!product) return 0;
  return productPrice(product, line.variant);
}

const EMPTY: CartLine[] = [];
const noopSubscribe = () => () => {};

function loadStored(): CartLine[] {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CartLine[]) : EMPTY;
  } catch {
    /* private mode, cleared storage — start empty */
    return EMPTY;
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  /**
   * The server has no cart, so the first client render has to match it — an
   * empty one — and only then reveal what is in storage. `useSyncExternalStore`
   * gives that gate without a setState-in-effect round trip.
   */
  const { bySlug } = useStore();
  const ready = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const [stored, setLines] = useState<CartLine[]>(loadStored);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toast, setToast] = useState<CartLine | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);
  const lines = useMemo(
    () => (ready ? stored.filter((l) => bySlug.has(l.slug)) : EMPTY),
    [ready, stored, bySlug],
  );

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(stored));
    } catch {
      /* nothing we can do, cart just won't persist */
    }
  }, [stored, ready]);

  const add = useCallback((line: Omit<CartLine, "id">) => {
    const id = lineId(line);
    setToast({ ...line, id });
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 4200);
    setLines((prev) => {
      const found = prev.find((l) => l.id === id);
      if (found) {
        return prev.map((l) => (l.id === id ? { ...l, qty: Math.min(l.qty + line.qty, 20) } : l));
      }
      return [...prev, { ...line, id }];
    });
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    setLines((prev) =>
      qty <= 0
        ? prev.filter((l) => l.id !== id)
        : prev.map((l) => (l.id === id ? { ...l, qty: Math.min(qty, 20) } : l)),
    );
  }, []);

  const remove = useCallback((id: string) => {
    setLines((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const clear = useCallback(() => setLines([]), []);
  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const dismissToast = useCallback(() => setToast(null), []);

  // The page behind the drawer must not scroll while it is open.
  useEffect(() => {
    if (!drawerOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [drawerOpen]);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  const value = useMemo<CartState>(() => {
    const count = lines.reduce((n, l) => n + l.qty, 0);
    const subtotal = lines.reduce((n, l) => n + unitPrice(l, bySlug.get(l.slug)) * l.qty, 0);
    return {
      lines, ready, count, subtotal,
      add, setQty, remove, clear,
      drawerOpen, openDrawer, closeDrawer,
      toast, dismissToast,
    };
  }, [
    lines, ready, bySlug, add, setQty, remove, clear,
    drawerOpen, openDrawer, closeDrawer, toast, dismissToast,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
