import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProductCard from "@/components/ProductCard";
import BuyBox from "@/components/BuyBox";
import ProductGallery from "@/components/ProductGallery";
import Reveal from "@/components/Reveal";
import Carousel from "@/components/Carousel";
import Stars from "@/components/Stars";
import SectionHead from "@/components/SectionHead";
import { getProduct, getProducts, getCategories, getOccasions } from "@/server/queries";
import { money, discountPct } from "@/lib/format";

export async function generateStaticParams() {
  return (await getProducts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Not found" };
  return { title: product.name, description: product.tagline };
}

const DELIVERY_NOTES = [
  ["Same-day", "Order before 6 PM and it goes out today in the 9 AM – 9 PM window."],
  ["Midnight", "Cut-off 8 PM. The rider arrives between 11 PM and 12 AM — no doorbell if you ask."],
  ["Fixed window", "Pick a two-hour slot at checkout for ₹120."],
  ["Substitutions", "If a variety is short we call you first. We never swap without asking."],
];

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [product, all, CATEGORIES, OCCASIONS] = await Promise.all([
    getProduct(slug),
    getProducts(),
    getCategories(),
    getOccasions(),
  ]);
  if (!product) notFound();

  const category =
    CATEGORIES.find((c) => c.slug === product.category) ??
    // The category block can be renamed in the admin; the product page must
    // still render rather than 500.
    {
      slug: product.category,
      name: product.category,
      blurb: "",
      art: product.art,
      hues: product.hues,
    };
  const off = discountPct(product.price, product.mrp);
  const related = all.filter(
    (p) => p.slug !== product.slug && (p.category === product.category || p.occasions.some((o) => product.occasions.includes(o))),
  ).slice(0, 4);

  return (
    <>
      <div className="border-b border-brand-800/10 bg-white">
        <nav className="wrap flex flex-wrap items-center gap-2 py-4 text-[0.76rem] text-brand-700/60">
          <Link href="/" className="hover:text-gold-600">Home</Link>
          <span>/</span>
          <Link href={`/shop?category=${category.slug}`} className="hover:text-gold-600">
            {category.name}
          </Link>
          <span>/</span>
          <span className="text-brand-800">{product.name}</span>
        </nav>
      </div>

      <div className="wrap grid gap-10 py-10 lg:grid-cols-2 lg:gap-14">
        {/* --------------------------------------------------------- media */}
        <div className="lg:sticky lg:top-[150px] lg:self-start">
          <ProductGallery product={product} category={category} />
        </div>

        {/* --------------------------------------------------------- detail */}
        <Reveal from="right">
          <div className="flex flex-wrap items-center gap-2">
            {product.bestseller && (
              <span className="rounded-full bg-brand-800 px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-gold-200">
                Bestseller
              </span>
            )}
            {product.eggless && (
              <span className="rounded-full border border-brand-500/40 px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-brand-600">
                Eggless available
              </span>
            )}
            {product.sameDay && (
              <span className="rounded-full border border-gold-500/50 px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-gold-700">
                Same-day
              </span>
            )}
          </div>

          <h1 className="mt-4 font-display text-[2rem] font-semibold leading-tight tracking-tight text-brand-900 sm:text-[2.5rem]">
            {product.name}
          </h1>
          <p className="mt-2 text-[1.02rem] text-brand-700/80">{product.tagline}</p>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            <span className="flex items-center gap-1.5">
              <Stars rating={product.rating} size={15} />
              <strong className="text-brand-900">{product.rating}</strong>
            </span>
            <span className="text-brand-700/60">
              {product.reviews.toLocaleString("en-IN")} reviews
            </span>
          </div>

          <div className="mt-5 flex flex-wrap items-baseline gap-3">
            <span className="font-display text-[2rem] font-semibold text-brand-900">
              {money(product.price)}
            </span>
            {product.mrp && (
              <>
                <span className="text-lg text-brand-700/45 line-through">{money(product.mrp)}</span>
                <span className="rounded-full bg-gold-500 px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-wider text-brand-900">
                  Save {off}%
                </span>
              </>
            )}
            <span className="text-[0.76rem] text-brand-700/55">inclusive of all taxes</span>
          </div>

          <BuyBox product={product} />

          <p className="mt-7 text-[0.92rem] leading-relaxed text-brand-800/85">{product.description}</p>

          <div className="mt-7 rounded-2xl border border-brand-800/10 bg-white p-5">
            <h2 className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-gold-600">
              What arrives
            </h2>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {product.contains.map((c) => (
                <li key={c} className="flex items-start gap-2 text-[0.88rem] text-brand-800/85">
                  <svg viewBox="0 0 20 20" className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" fill="currentColor">
                    <path d="M8 13.4 4.6 10l-1.2 1.2L8 15.8 17 6.8 15.8 5.6 8 13.4Z" />
                  </svg>
                  {c}
                </li>
              ))}
            </ul>
            <p className="mt-4 border-t border-brand-800/10 pt-3 text-[0.82rem] text-brand-700/75">
              <strong className="text-brand-800">Care · </strong>
              {product.care}
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {DELIVERY_NOTES.map(([t, b]) => (
              <div key={t} className="rounded-xl border border-brand-800/10 bg-brand-50/60 p-4">
                <p className="text-[0.8rem] font-bold text-brand-900">{t}</p>
                <p className="mt-1 text-[0.8rem] leading-relaxed text-brand-700/75">{b}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {product.occasions.map((o) => {
              const occ = OCCASIONS.find((x) => x.slug === o);
              if (!occ) return null;
              return (
                <Link
                  key={o}
                  href={`/shop?occasion=${o}`}
                  className="rounded-full border border-brand-800/12 bg-white px-3.5 py-1.5 text-[0.78rem] font-medium text-brand-800 transition hover:border-gold-500"
                >
                  {occ.name}
                </Link>
              );
            })}
          </div>
        </Reveal>
      </div>

      {related.length > 0 && (
        <section className="wrap pb-4 pt-10">
          <Reveal>
            <SectionHead
              eyebrow="Ordered together"
              title="People also sent"
              href={`/shop?category=${category.slug}`}
            />
          </Reveal>
          <Reveal from="right">
            <Carousel label="related products">
              {related.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </Carousel>
          </Reveal>
        </section>
      )}
    </>
  );
}
