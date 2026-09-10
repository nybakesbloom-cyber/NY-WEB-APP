import Link from "next/link";
import type { Metadata } from "next";
import ProductCard from "@/components/ProductCard";
import SortSelect from "@/components/SortSelect";
import Reveal from "@/components/Reveal";
import { filterProducts } from "@/lib/catalog";
import { getProducts, getCategories, getOccasions } from "@/server/queries";

const PRICE_BANDS = [
  { label: "Under ₹999", value: "999" },
  { label: "Under ₹1,499", value: "1499" },
  { label: "Under ₹2,499", value: "2499" },
];

type SP = Record<string, string | string[] | undefined>;

function one(sp: SP, key: string) {
  const v = sp[key];
  return Array.isArray(v) ? v[0] : v;
}

export const metadata: Metadata = { title: "Shop" };

function buildHref(sp: SP, patch: Record<string, string | undefined>) {
  const out = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    const s = Array.isArray(v) ? v[0] : v;
    if (s) out.set(k, s);
  }
  for (const [k, v] of Object.entries(patch)) {
    if (v === undefined) out.delete(k);
    else out.set(k, v);
  }
  const qs = out.toString();
  return qs ? `/shop?${qs}` : "/shop";
}

export default async function ShopPage({ searchParams }: { searchParams: Promise<SP> }) {
  const [sp, all, CATEGORIES, OCCASIONS] = await Promise.all([
    searchParams,
    getProducts(),
    getCategories(),
    getOccasions(),
  ]);
  const category = one(sp, "category");
  const occasion = one(sp, "occasion");
  const maxPrice = one(sp, "max");
  const sort = one(sp, "sort") ?? "popular";
  const query = one(sp, "q");

  const products = filterProducts(all, {
    category,
    occasion,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    sort,
    query,
  });

  const cat = CATEGORIES.find((c) => c.slug === category);
  const occ = OCCASIONS.find((o) => o.slug === occasion);

  const heading = query
    ? `Results for “${query}”`
    : cat && occ
      ? `${cat.name} for ${occ.name}`
      : (cat?.name ?? occ?.name ?? "Everything we make");

  const blurb = query
    ? `${products.length} ${products.length === 1 ? "match" : "matches"} in the catalogue.`
    : (cat?.blurb ?? occ?.blurb ?? "Twenty-four things, each made or arranged the day it goes out.");

  const activeFilters = [category, occasion, maxPrice, query].filter(Boolean).length;

  return (
    <>
      <div className="border-b border-brand-800/10 bg-white">
        <div className="wrap py-9">
          <nav className="mb-3 flex items-center gap-2 text-[0.76rem] text-brand-700/60">
            <Link href="/" className="hover:text-gold-600">Home</Link>
            <span>/</span>
            <span className="text-brand-800">{heading}</span>
          </nav>
          <h1 className="font-display text-[2rem] font-semibold tracking-tight text-brand-900 sm:text-[2.4rem]">
            {heading}
          </h1>
          <div className="gold-rule mt-3 w-28" />
          <p className="mt-3 max-w-xl text-[0.92rem] leading-relaxed text-brand-700/75">{blurb}</p>
        </div>
      </div>

      <div className="wrap grid gap-8 py-10 lg:grid-cols-[240px_1fr]">
        {/* ------------------------------------------------------- filters */}
        <aside className="lg:sticky lg:top-[150px] lg:self-start">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-brand-900">Filters</h2>
            {activeFilters > 0 && (
              <Link href="/shop" className="text-[0.75rem] font-semibold text-gold-600 hover:text-gold-700">
                Clear all
              </Link>
            )}
          </div>

          <FilterGroup title="Category">
            {CATEGORIES.map((c) => (
              <FilterLink
                key={c.slug}
                href={buildHref(sp, { category: category === c.slug ? undefined : c.slug })}
                active={category === c.slug}
              >
                {c.name}
              </FilterLink>
            ))}
          </FilterGroup>

          <FilterGroup title="Occasion">
            {OCCASIONS.map((o) => (
              <FilterLink
                key={o.slug}
                href={buildHref(sp, { occasion: occasion === o.slug ? undefined : o.slug })}
                active={occasion === o.slug}
              >
                {o.name}
              </FilterLink>
            ))}
          </FilterGroup>

          <FilterGroup title="Price">
            {PRICE_BANDS.map((b) => (
              <FilterLink
                key={b.value}
                href={buildHref(sp, { max: maxPrice === b.value ? undefined : b.value })}
                active={maxPrice === b.value}
              >
                {b.label}
              </FilterLink>
            ))}
          </FilterGroup>

          <div className="mt-8 rounded-xl border border-gold-400/40 bg-gold-50 p-4">
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-gold-700">
              Cut-off today
            </p>
            <p className="mt-1.5 text-[0.84rem] leading-relaxed text-brand-800/80">
              Order before <strong>6:00 PM</strong> for same-day, or <strong>8:00 PM</strong> for a
              midnight drop.
            </p>
          </div>
        </aside>

        {/* -------------------------------------------------------- results */}
        <div>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-brand-700/75">
              <strong className="text-brand-900">{products.length}</strong>{" "}
              {products.length === 1 ? "product" : "products"}
            </p>
            <SortSelect value={sort} />
          </div>

          {products.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-brand-800/20 bg-white p-12 text-center">
              <p className="font-display text-xl font-semibold text-brand-900">
                Nothing matches that combination.
              </p>
              <p className="mx-auto mt-2 max-w-sm text-[0.88rem] text-brand-700/70">
                We keep a short catalogue on purpose. Loosen a filter and something will turn up.
              </p>
              <Link href="/shop" className="btn btn-emerald mt-6 px-6 py-2.5 text-sm">
                Show everything
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
              {products.map((p, i) => (
                <Reveal key={p.slug} from="up" delay={(i % 3) * 90}>
                  <ProductCard product={p} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="mb-2.5 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-gold-600">
        {title}
      </h3>
      <div className="flex flex-wrap gap-1.5 lg:flex-col lg:gap-0.5">{children}</div>
    </div>
  );
}

function FilterLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded-lg px-3 py-1.5 text-sm transition ${
        active
          ? "bg-brand-800 font-semibold text-gold-100"
          : "text-brand-800 hover:bg-brand-50 hover:text-brand-900"
      }`}
    >
      {children}
    </Link>
  );
}
