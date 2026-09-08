"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Countdown from "./Countdown";
import Logo from "./Logo";
import { CATEGORIES, OCCASIONS } from "@/lib/catalog";
import { useCart } from "./CartProvider";

const CITIES = ["Bengaluru", "Mumbai", "Delhi NCR", "Hyderabad", "Chennai", "Pune", "Kolkata"];

function CartIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.4a2 2 0 0 0 2-1.55L20.5 8H6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="10" cy="20" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="17.5" cy="20" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function Header() {
  const { count, ready, openDrawer } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState<"cat" | "occ" | null>(null);
  const [city, setCity] = useState(CITIES[0]);
  const [q, setQ] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  const navRef = useRef<HTMLDivElement>(null);

  // Navigating anywhere closes whatever is open. Adjusting state during render
  // on a changed value is the documented alternative to an effect here.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
    setMenu(null);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setMenu(null);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function search(e: React.FormEvent) {
    e.preventDefault();
    router.push(q.trim() ? `/shop?q=${encodeURIComponent(q.trim())}` : "/shop");
  }

  return (
    <header className="sticky top-0 z-50">
      {/* announcement strip */}
      <div className="overflow-hidden bg-brand-900 py-2 text-[0.72rem] font-medium tracking-wide text-gold-200">
        <div className="marquee-track flex w-max gap-12 whitespace-nowrap pl-4">
          {[0, 1].map((k) => (
            <span key={k} className="flex gap-12">
              <span>✦ Same-day delivery in 7 cities — order before 6 PM</span>
              <span>✦ Midnight delivery available for birthdays</span>
              <span>✦ Free delivery over ₹1,499</span>
              <span>✦ Flowers cut the morning they are delivered</span>
              <span>✦ 100% eggless options on every cake</span>
            </span>
          ))}
        </div>
      </div>

      <div
        className={`border-b border-brand-800/10 bg-cream/92 backdrop-blur-md transition-shadow duration-300 ${
          scrolled ? "shadow-[0_14px_30px_-24px_rgba(11,61,46,0.85)]" : ""
        }`}
      >
        <div
          className={`wrap flex items-center gap-4 transition-[height] duration-300 ${
            scrolled ? "h-[58px]" : "h-[70px]"
          }`}
        >
          <button
            className="-ml-1 rounded-lg p-2 text-brand-800 lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={open}
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" stroke="currentColor" strokeWidth="1.8" fill="none">
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              )}
            </svg>
          </button>

          <Link href="/" aria-label="Felicet Bloom home">
            <Logo />
          </Link>

          <form onSubmit={search} className="ml-auto hidden max-w-md flex-1 md:block">
            <div className="relative">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search cakes, roses, hampers…"
                className="field pl-10"
                aria-label="Search products"
              />
              <svg
                viewBox="0 0 24 24"
                className="pointer-events-none absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-brand-600"
                style={{ height: 18, width: 18 }}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
              </svg>
            </div>
          </form>

          <label className="ml-auto hidden items-center gap-1.5 text-sm text-brand-800 md:ml-0 md:flex">
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-gold-600" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" />
              <circle cx="12" cy="10" r="2.4" />
            </svg>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="cursor-pointer border-0 bg-transparent pr-1 text-sm font-medium outline-none"
              aria-label="Delivery city"
            >
              {CITIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>

          <button
            onClick={openDrawer}
            aria-label={`Open cart, ${count} ${count === 1 ? "item" : "items"}`}
            className="relative ml-auto flex items-center gap-2 rounded-full border border-brand-800/12 bg-white px-3.5 py-2 text-sm font-semibold text-brand-800 transition hover:-translate-y-0.5 hover:border-gold-500 hover:shadow-[0_10px_22px_-14px_rgba(11,61,46,0.9)] md:ml-2"
          >
            <CartIcon className="h-5 w-5" />
            <span className="hidden sm:inline">Cart</span>
            {ready && count > 0 && (
              <span
                key={count}
                className="pop-in absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-gold-500 px-1 text-[0.68rem] font-bold text-brand-900"
              >
                {count}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* desktop nav */}
      <div ref={navRef} className="hidden border-b border-brand-800/10 bg-brand-800 lg:block">
        <div className="wrap flex items-center gap-1 text-[0.82rem] font-semibold tracking-wide text-gold-100">
          <Dropdown
            label="Shop by Category"
            open={menu === "cat"}
            onToggle={() => setMenu(menu === "cat" ? null : "cat")}
          >
            {CATEGORIES.map((c) => (
              <Link key={c.slug} href={`/shop?category=${c.slug}`} className="group block rounded-lg px-3 py-2.5 hover:bg-brand-50">
                <span className="block font-semibold text-brand-800 group-hover:text-brand-900">{c.name}</span>
                <span className="block text-xs font-normal text-brand-600">{c.blurb}</span>
              </Link>
            ))}
          </Dropdown>

          <Dropdown
            label="Shop by Occasion"
            open={menu === "occ"}
            onToggle={() => setMenu(menu === "occ" ? null : "occ")}
            wide
          >
            {OCCASIONS.map((o) => (
              <Link key={o.slug} href={`/shop?occasion=${o.slug}`} className="group block rounded-lg px-3 py-2.5 hover:bg-brand-50">
                <span className="block font-semibold text-brand-800">{o.name}</span>
                <span className="block text-xs font-normal text-brand-600">{o.blurb}</span>
              </Link>
            ))}
          </Dropdown>

          <NavLink href="/shop?category=cakes">Cakes</NavLink>
          <NavLink href="/shop?category=flowers">Flowers</NavLink>
          <NavLink href="/shop?category=combos">Combos</NavLink>
          <NavLink href="/shop?category=plants">Plants</NavLink>
          <NavLink href="/shop?category=hampers">Hampers</NavLink>
          <NavLink href="/shop?sort=price-asc">Under ₹999</NavLink>
          <NavLink href="/how-it-works">How it&apos;s made</NavLink>

          <span className="ml-auto hidden shrink-0 items-center gap-1.5 whitespace-nowrap py-3 text-[0.78rem] font-medium text-gold-100/80 xl:flex">
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-gold-400" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" strokeLinecap="round" />
            </svg>
            <Countdown />
          </span>
        </div>
      </div>

      {/* mobile drawer */}
      {open && (
        <div className="animate-fade border-b border-brand-800/10 bg-white lg:hidden">
          <div className="wrap py-4">
            <form onSubmit={search} className="mb-4 md:hidden">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search cakes, roses, hampers…"
                className="field"
                aria-label="Search products"
              />
            </form>
            <p className="eyebrow mb-2">Categories</p>
            <div className="mb-4 grid grid-cols-2 gap-1.5">
              {CATEGORIES.map((c) => (
                <Link
                  key={c.slug}
                  href={`/shop?category=${c.slug}`}
                  className="rounded-lg bg-brand-50 px-3 py-2 text-sm font-semibold text-brand-800"
                >
                  {c.name}
                </Link>
              ))}
            </div>
            <Link
              href="/how-it-works"
              className="mb-4 block rounded-lg bg-brand-800 px-3 py-2.5 text-sm font-semibold text-gold-100"
            >
              How it&apos;s made — all five stages
            </Link>
            <p className="eyebrow mb-2">Occasions</p>
            <div className="grid grid-cols-2 gap-1.5">
              {OCCASIONS.map((o) => (
                <Link
                  key={o.slug}
                  href={`/shop?occasion=${o.slug}`}
                  className="rounded-lg border border-brand-800/10 px-3 py-2 text-sm font-medium text-brand-800"
                >
                  {o.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-md px-3 py-3 transition hover:bg-brand-700 hover:text-white"
    >
      {children}
    </Link>
  );
}

function Dropdown({
  label,
  open,
  onToggle,
  children,
  wide,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        aria-expanded={open}
        className={`flex items-center gap-1.5 px-3 py-3 transition hover:bg-brand-700 hover:text-white ${
          open ? "bg-brand-700 text-white" : ""
        }`}
      >
        {label}
        <svg
          viewBox="0 0 24 24"
          className={`h-3.5 w-3.5 transition ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div
          className={`animate-fade absolute left-0 top-full z-50 mt-0 rounded-b-xl border border-t-0 border-gold-300/60 bg-white p-2 shadow-[0_28px_48px_-24px_rgba(11,61,46,0.5)] ${
            wide ? "grid w-[520px] grid-cols-2 gap-1" : "w-[320px]"
          }`}
        >
          {children}
        </div>
      )}
    </div>
  );
}
