import Link from "next/link";
import ProductArt from "@/components/art/ProductArt";
import ProductCard from "@/components/ProductCard";
import SectionHead from "@/components/SectionHead";
import Stars from "@/components/Stars";
import Reveal from "@/components/Reveal";
import Carousel from "@/components/Carousel";
import FlowStrip from "@/components/FlowStrip";
import HeroStory from "@/components/HeroStory";
import ProcessScroll from "@/components/ProcessScroll";
import { filterProducts } from "@/lib/catalog";
import { getProducts, getCategories, getOccasions, getProcess, getContent, getSections } from "@/server/queries";
import type { HeroContent } from "@/components/HeroStory";

function PromiseIcon({ name }: { name: string }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" {...common}>
      {name === "leaf" && <path d="M20 4c0 9-5 14-12 14H5c0-8 5-13 12-13h3ZM5 20c2.5-4.5 5.5-7 9-9" />}
      {name === "oven" && (
        <>
          <rect x="3.5" y="4" width="17" height="16" rx="2.5" />
          <path d="M3.5 9h17M7 6.6h3" />
          <rect x="7" y="12" width="10" height="5" rx="1.5" />
        </>
      )}
      {name === "box" && (
        <>
          <path d="M3.5 8.5 12 4.5l8.5 4v7L12 19.5 3.5 15.5v-7Z" />
          <path d="M3.5 8.5 12 12.5l8.5-4M12 12.5v7" />
        </>
      )}
      {name === "camera" && (
        <>
          <path d="M3.5 8.5h3.2l1.4-2.2h7.8l1.4 2.2h3.2v10H3.5v-10Z" />
          <circle cx="12" cy="13" r="3.2" />
        </>
      )}
    </svg>
  );
}

type Promise_ = { icon: string; title: string; body: string };
type Review = { name: string; city: string; rating: number; text: string };

export default async function HomePage() {
  const [products, CATEGORIES, OCCASIONS, steps, hero, promiseBlock, reviewBlock, S, cta] =
    await Promise.all([
      getProducts(),
      getCategories(),
      getOccasions(),
      getProcess(),
      getContent<Partial<HeroContent>>("hero", {}),
      getContent<{ items: Promise_[] }>("promises", { items: [] }),
      getContent<{ items: Review[] }>("reviews", { items: [] }),
      getSections(),
      getContent<Record<string, string>>("cta", {}),
    ]);

  // Falls back to the shipped copy if a heading has been cleared in the admin.
  const t = (key: string, fallback: string) => S[key] || fallback;

  const PROMISES = promiseBlock.items;
  const REVIEWS = reviewBlock.items;

  const bestsellers = products.filter((p) => p.bestseller);
  const cakes = filterProducts(products, { category: "cakes" });
  const flowers = filterProducts(products, { category: "flowers" });
  const flowA = [...bestsellers, ...cakes.slice(0, 4)];
  const flowB = [...flowers.slice(0, 5), ...filterProducts(products, { category: "hampers" })];

  return (
    <>
      <HeroStory content={hero} />

      {/* ------------------------------------------------------ CATEGORIES */}
      <section id="start" className="wrap scroll-mt-[150px] py-16">
        <Reveal>
          <SectionHead
            eyebrow={t("categoriesEyebrow", "Start here")}
            title={t("categoriesTitle", "Five things, done properly")}
            sub={t("categoriesSub", "We deliberately keep the list short.")}
            href="/shop"
            hrefLabel={t("categoriesLink", "Browse everything")}
          />
        </Reveal>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {CATEGORIES.map((c, i) => (
            <Reveal key={c.slug} from="zoom" delay={i * 70}>
              <Link
                href={`/shop?category=${c.slug}`}
                className="card group flex h-full flex-col items-center p-4 text-center"
              >
                <div className="w-full overflow-hidden rounded-xl">
                  <ProductArt
                    kind={c.art}
                    hues={c.hues}
                    seed={`cat-${c.slug}`}
                    className="w-full transition duration-700 group-hover:scale-110 group-hover:-rotate-2"
                  />
                </div>
                <h3 className="mt-3.5 font-display text-lg font-semibold text-brand-900">{c.name}</h3>
                <p className="mt-1 text-[0.78rem] leading-snug text-brand-700/70">{c.blurb}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-[0.72rem] font-bold uppercase tracking-[0.16em] text-gold-600">
                  Shop
                  <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* -------------------------------------------- FLOWING IMAGE RIBBON */}
      <section className="overflow-hidden border-y border-brand-800/10 bg-white py-12">
        <div className="wrap mb-7">
          <Reveal>
            <p className="eyebrow">{t("flowEyebrow", "Leaving the kitchen today")}</p>
            <h2 className="mt-2 font-display text-[1.6rem] font-semibold tracking-tight text-brand-900 sm:text-[2rem]">
              {t("flowTitle", "A live look at what is being boxed right now")}
            </h2>
          </Reveal>
        </div>
        <div className="space-y-4">
          <FlowStrip products={flowA} duration={58} />
          <FlowStrip products={flowB} duration={72} reverse />
        </div>
      </section>

      {/* -------------------------------------------------------- PROMISES */}
      <section className="bg-cream">
        <div className="wrap grid gap-8 py-14 sm:grid-cols-2 lg:grid-cols-4">
          {PROMISES.map((p, i) => (
            <Reveal key={p.title} from="up" delay={i * 90} className="flex gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-gold-400/50 bg-gold-50 text-gold-700 transition duration-500 hover:rotate-6 hover:border-gold-500">
                <PromiseIcon name={p.icon} />
              </div>
              <div>
                <p className="text-[0.62rem] font-bold uppercase tracking-[0.2em] text-gold-600">
                  0{i + 1}
                </p>
                <h3 className="mt-1 font-display text-lg font-semibold text-brand-900">{p.title}</h3>
                <p className="mt-1.5 text-[0.84rem] leading-relaxed text-brand-700/75">{p.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------------------------------- PINNED PROCESS SCRUB */}
      <ProcessScroll steps={steps} headings={{ eyebrow: S.processEyebrow, title: S.processTitle }} />

      {/* ----------------------------------------------------- BESTSELLERS */}
      <section className="wrap py-16">
        <Reveal>
          <SectionHead
            eyebrow={t("bestsellersEyebrow", "Ordered most")}
            title={t("bestsellersTitle", "What people keep coming back for")}
            sub={t("bestsellersSub", "Ranked by repeat orders, not by margin.")}
            href="/shop"
          />
        </Reveal>
        <Reveal from="right">
          <Carousel label="bestsellers">
            {bestsellers.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </Carousel>
        </Reveal>
      </section>

      {/* -------------------------------------------------------- OCCASIONS */}
      <section className="relative overflow-hidden bg-brand-800 py-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 80% 15%, rgba(201,162,39,0.22), transparent 40%), radial-gradient(circle at 10% 90%, rgba(28,133,96,0.5), transparent 45%)",
          }}
        />
        <div className="wrap relative">
          <Reveal>
            <SectionHead
              tone="dark"
              eyebrow={t("occasionsEyebrow", "Tell us the reason")}
              title={t("occasionsTitle", "Shop by occasion")}
              sub={t("occasionsSub", "Each one filters to what we would actually send.")}
            />
          </Reveal>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {OCCASIONS.map((o, i) => (
              <Reveal key={o.slug} from="zoom" delay={i * 55}>
                <Link
                  href={`/shop?occasion=${o.slug}`}
                  className="group block h-full rounded-xl border border-gold-400/25 bg-brand-900/40 p-5 transition duration-300 hover:-translate-y-1 hover:border-gold-400/70 hover:bg-brand-900/70 hover:shadow-[0_20px_40px_-24px_rgba(0,0,0,0.9)]"
                >
                  <h3 className="font-display text-lg font-semibold text-gold-50">{o.name}</h3>
                  <p className="mt-1.5 text-[0.78rem] leading-snug text-gold-100/60">{o.blurb}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-gold-400 opacity-0 transition duration-300 group-hover:opacity-100">
                    Browse
                    <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ CAKES */}
      <section className="wrap py-16">
        <Reveal>
          <SectionHead
            eyebrow={t("cakesEyebrow", "From the kitchen")}
            title={t("cakesTitle", "Cakes")}
            sub={t("cakesSub", "Every one available eggless.")}
            href="/shop?category=cakes"
          />
        </Reveal>
        <Reveal from="right">
          <Carousel label="cakes">
            {cakes.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </Carousel>
        </Reveal>
      </section>

      {/* ---------------------------------------------------------- FLOWERS */}
      <section className="wrap pb-16">
        <Reveal>
          <SectionHead
            eyebrow={t("flowersEyebrow", "From the market")}
            title={t("flowersTitle", "Flowers")}
            sub={t("flowersSub", "Graded by head size before wrapping.")}
            href="/shop?category=flowers"
          />
        </Reveal>
        <Reveal from="right">
          <Carousel label="flowers">
            {flowers.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </Carousel>
        </Reveal>
      </section>

      {/* ------------------------------------------------------ TESTIMONIALS */}
      <section className="border-y border-brand-800/10 bg-white py-16">
        <div className="wrap">
          <Reveal>
            <SectionHead center eyebrow={t("reviewsEyebrow", "Unedited")} title={t("reviewsTitle", "What the reviews actually say")} sub={S.reviewsSub || undefined} />
          </Reveal>
          <div className="grid gap-5 md:grid-cols-3">
            {REVIEWS.map((r, i) => (
              <Reveal key={r.name} from="up" delay={i * 110}>
                <figure className="h-full rounded-2xl border border-brand-800/8 bg-cream p-6 transition duration-300 hover:-translate-y-1 hover:border-gold-400/50 hover:shadow-[0_24px_44px_-30px_rgba(11,61,46,0.6)]">
                  <Stars rating={r.rating} size={15} />
                  <blockquote className="mt-3.5 text-[0.92rem] leading-relaxed text-brand-800/85">
                    “{r.text}”
                  </blockquote>
                  <figcaption className="mt-4 flex items-center gap-3 border-t border-brand-800/8 pt-4">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-800 font-display text-sm font-semibold text-gold-300">
                      {r.name[0]}
                    </span>
                    <span className="text-sm">
                      <span className="block font-semibold text-brand-900">{r.name}</span>
                      <span className="block text-[0.75rem] text-brand-700/60">{r.city}</span>
                    </span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------- CTA */}
      <section className="wrap py-16">
        <Reveal from="zoom">
          <div className="relative overflow-hidden rounded-[1.5rem] bg-brand-900 px-6 py-14 text-center sm:px-14">
            <div
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 0%, rgba(201,162,39,0.35), transparent 45%), radial-gradient(circle at 80% 100%, rgba(28,133,96,0.55), transparent 45%)",
              }}
            />
            <div className="relative">
              <p className="eyebrow text-gold-400">{cta.eyebrow || "Never miss one again"}</p>
              <h2 className="mx-auto mt-3 max-w-2xl font-display text-[1.9rem] font-semibold leading-tight text-gold-50 sm:text-[2.4rem]">
                {cta.title || "We will remind you the week before the date."}
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-[0.95rem] leading-relaxed text-gold-100/70">
                {cta.body || "Add a birthday or anniversary once."}
              </p>
              <form className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  required
                  placeholder={cta.placeholder || "you@example.com"}
                  aria-label="Email address"
                  className="field flex-1"
                />
                <button type="submit" className="btn btn-gold px-7 py-3">
                  {cta.button || "Set a reminder"}
                </button>
              </form>
              <p className="mt-3 text-[0.72rem] text-gold-100/45">
                {cta.note || "Demo storefront — this form does not send anything."}
              </p>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
