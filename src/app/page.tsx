import Link from "next/link";
import ProductArt from "@/components/art/ProductArt";
import ProductCard from "@/components/ProductCard";
import SectionHead from "@/components/SectionHead";
import Stars from "@/components/Stars";
import { CATEGORIES, OCCASIONS, PRODUCTS, filterProducts } from "@/lib/catalog";

const PROMISES = [
  {
    title: "Cut this morning",
    body: "Stems come off the market floor at 5 AM and are wrapped by 9. Nothing sits in cold storage for a week.",
    icon: "leaf",
  },
  {
    title: "Baked to the order",
    body: "The oven goes on after you check out. No trays of yesterday's sponge waiting for a buyer.",
    icon: "oven",
  },
  {
    title: "One slot, both gifts",
    body: "Order a cake and flowers together and they arrive on the same doorbell — not two, four hours apart.",
    icon: "box",
  },
  {
    title: "A photo before we leave",
    body: "The rider photographs the handover. You see what actually got delivered, not a status code.",
    icon: "camera",
  },
];

const REVIEWS = [
  {
    name: "Ananya R.",
    city: "Bengaluru",
    rating: 5,
    text: "Ordered the midnight truffle at 9 PM for a 12 AM delivery. It landed at 11:52 and the ganache was still sharp at the edges. My sister cried, which was the plan.",
  },
  {
    name: "Vikram S.",
    city: "Pune",
    rating: 5,
    text: "The hundred roses actually had a hundred roses. I counted, because I have been burned before by a florist in Kothrud.",
  },
  {
    name: "Meera J.",
    city: "Delhi NCR",
    rating: 4,
    text: "Tulips arrived tighter than I expected and I thought something was wrong. Two days later they were fully open and still going a week on. Fine, they knew better.",
  },
];

function PromiseIcon({ name }: { name: string }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
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

export default function HomePage() {
  const bestsellers = PRODUCTS.filter((p) => p.bestseller);
  const cakes = filterProducts({ category: "cakes" }).slice(0, 4);
  const flowers = filterProducts({ category: "flowers" }).slice(0, 4);
  const hero = PRODUCTS.find((p) => p.slug === "anniversary-gold-set")!;
  const heroSmallA = PRODUCTS.find((p) => p.slug === "hundred-red-roses")!;
  const heroSmallB = PRODUCTS.find((p) => p.slug === "red-velvet-crown")!;

  return (
    <>
      {/* ---------------------------------------------------------- HERO */}
      <section className="relative overflow-hidden bg-brand-800">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.5]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 20%, rgba(201,162,39,0.28), transparent 42%), radial-gradient(circle at 85% 78%, rgba(28,133,96,0.5), transparent 45%)",
          }}
        />
        <div className="wrap relative grid items-center gap-12 py-14 lg:grid-cols-[1.05fr_1fr] lg:py-20">
          <div className="animate-rise">
            <p className="eyebrow text-gold-400">Est. 2019 · 12 cities · 1.4 lakh deliveries</p>
            <h1 className="mt-4 font-display text-[2.5rem] font-semibold leading-[1.08] tracking-tight text-gold-50 sm:text-[3.4rem]">
              Cakes and flowers,
              <br />
              <span className="text-gold-400">made the day</span> they
              <br />
              reach the door.
            </h1>
            <p className="mt-6 max-w-lg text-[1.02rem] leading-relaxed text-gold-100/75">
              We do two things. We bake, and we buy stems at the morning market. Everything on this
              site is put together after you order it — which is the whole reason it tastes and
              looks the way it does.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/shop?category=cakes" className="btn btn-gold px-7 py-3.5">
                Shop cakes
              </Link>
              <Link href="/shop?category=flowers" className="btn px-7 py-3.5 border border-gold-400/50 text-gold-100 hover:bg-gold-400/10">
                Shop flowers
              </Link>
            </div>

            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-6 border-t border-gold-400/20 pt-7">
              {[
                ["4.8 / 5", "across 18,400 reviews"],
                ["6 PM", "cut-off for same-day"],
                ["11:52 PM", "median midnight drop"],
              ].map(([big, small]) => (
                <div key={big}>
                  <dt className="font-display text-2xl font-semibold text-gold-400">{big}</dt>
                  <dd className="mt-1 text-[0.76rem] leading-snug text-gold-100/60">{small}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* hero art stack */}
          <div className="relative animate-fade">
            <div className="overflow-hidden rounded-[1.5rem] border border-gold-400/35 bg-cream shadow-[0_40px_80px_-30px_rgba(0,0,0,0.6)]">
              <ProductArt kind={hero.art} hues={hero.hues} seed={hero.slug} className="w-full" />
            </div>

            <div className="absolute -left-3 bottom-6 hidden w-36 overflow-hidden rounded-2xl border border-gold-400/40 bg-cream shadow-2xl sm:block lg:-left-10">
              <ProductArt kind={heroSmallA.art} hues={heroSmallA.hues} seed={heroSmallA.slug} className="w-full" />
            </div>

            <div className="absolute -right-2 -top-4 hidden w-32 overflow-hidden rounded-2xl border border-gold-400/40 bg-cream shadow-2xl sm:block lg:-right-8">
              <ProductArt kind={heroSmallB.art} hues={heroSmallB.hues} seed={heroSmallB.slug} className="w-full" />
            </div>

            <div className="absolute -bottom-5 right-4 rounded-xl border border-gold-400/40 bg-brand-900/95 px-4 py-3 backdrop-blur lg:right-10">
              <p className="text-[0.62rem] font-bold uppercase tracking-[0.18em] text-gold-400">
                Delivering tonight
              </p>
              <p className="mt-1 text-sm font-semibold text-gold-50">
                Midnight slot · 214 orders out
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ CATEGORIES */}
      <section className="wrap py-16">
        <SectionHead
          eyebrow="Start here"
          title="Five things, done properly"
          sub="We deliberately keep the list short. Everything below is made or arranged in our own kitchens and studios."
          href="/shop"
          hrefLabel="Browse everything"
        />

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {CATEGORIES.map((c, i) => (
            <Link
              key={c.slug}
              href={`/shop?category=${c.slug}`}
              className="card group animate-rise flex flex-col items-center p-4 text-center"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="w-full overflow-hidden rounded-xl">
                <ProductArt
                  kind={c.art}
                  hues={c.hues}
                  seed={`cat-${c.slug}`}
                  className="w-full transition duration-500 group-hover:scale-105"
                />
              </div>
              <h3 className="mt-3.5 font-display text-lg font-semibold text-brand-900">{c.name}</h3>
              <p className="mt-1 text-[0.78rem] leading-snug text-brand-700/70">{c.blurb}</p>
              <span className="mt-3 text-[0.72rem] font-bold uppercase tracking-[0.16em] text-gold-600 transition group-hover:text-gold-700">
                Shop →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* -------------------------------------------------------- PROMISES */}
      <section className="border-y border-brand-800/10 bg-white">
        <div className="wrap grid gap-8 py-14 sm:grid-cols-2 lg:grid-cols-4">
          {PROMISES.map((p, i) => (
            <div key={p.title} className="flex gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-gold-400/50 bg-gold-50 text-gold-700">
                <PromiseIcon name={p.icon} />
              </div>
              <div>
                <p className="text-[0.62rem] font-bold uppercase tracking-[0.2em] text-gold-600">
                  0{i + 1}
                </p>
                <h3 className="mt-1 font-display text-lg font-semibold text-brand-900">{p.title}</h3>
                <p className="mt-1.5 text-[0.84rem] leading-relaxed text-brand-700/75">{p.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ----------------------------------------------------- BESTSELLERS */}
      <section className="wrap py-16">
        <SectionHead
          eyebrow="Ordered most"
          title="What people keep coming back for"
          sub="Ranked by repeat orders, not by margin."
          href="/shop"
        />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {bestsellers.map((p, i) => (
            <ProductCard key={p.slug} product={p} index={i} />
          ))}
        </div>
      </section>

      {/* -------------------------------------------------------- OCCASIONS */}
      <section className="bg-brand-800 py-16">
        <div className="wrap">
          <SectionHead
            tone="dark"
            eyebrow="Tell us the reason"
            title="Shop by occasion"
            sub="Each one filters to what we would actually send. Sympathy orders skip the ribbons and go out first on the route."
          />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {OCCASIONS.map((o, i) => (
              <Link
                key={o.slug}
                href={`/shop?occasion=${o.slug}`}
                className="animate-rise group rounded-xl border border-gold-400/25 bg-brand-900/40 p-5 transition hover:border-gold-400/70 hover:bg-brand-900/70"
                style={{ animationDelay: `${i * 45}ms` }}
              >
                <h3 className="font-display text-lg font-semibold text-gold-50">{o.name}</h3>
                <p className="mt-1.5 text-[0.78rem] leading-snug text-gold-100/60">{o.blurb}</p>
                <span className="mt-3 inline-block text-[0.7rem] font-bold uppercase tracking-[0.16em] text-gold-400 opacity-0 transition group-hover:opacity-100">
                  Browse →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ CAKES */}
      <section className="wrap py-16">
        <SectionHead
          eyebrow="From the kitchen"
          title="Cakes"
          sub="Every one available eggless. Name piping is free; we just need it typed at checkout."
          href="/shop?category=cakes"
        />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {cakes.map((p, i) => (
            <ProductCard key={p.slug} product={p} index={i} />
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------- FLOWERS */}
      <section className="wrap pb-16">
        <SectionHead
          eyebrow="From the market"
          title="Flowers"
          sub="Graded by head size before wrapping. If a variety is short on the day we call you before substituting."
          href="/shop?category=flowers"
        />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {flowers.map((p, i) => (
            <ProductCard key={p.slug} product={p} index={i} />
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------ TESTIMONIALS */}
      <section className="border-y border-brand-800/10 bg-white py-16">
        <div className="wrap">
          <SectionHead
            center
            eyebrow="Unedited"
            title="What the reviews actually say"
          />
          <div className="grid gap-5 md:grid-cols-3">
            {REVIEWS.map((r, i) => (
              <figure
                key={r.name}
                className="animate-rise rounded-2xl border border-brand-800/8 bg-cream p-6"
                style={{ animationDelay: `${i * 80}ms` }}
              >
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
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------- CTA */}
      <section className="wrap py-16">
        <div className="relative overflow-hidden rounded-[1.5rem] bg-brand-900 px-6 py-14 text-center sm:px-14">
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 0%, rgba(201,162,39,0.35), transparent 45%), radial-gradient(circle at 80% 100%, rgba(28,133,96,0.55), transparent 45%)",
            }}
          />
          <div className="relative">
            <p className="eyebrow text-gold-400">Never miss one again</p>
            <h2 className="mx-auto mt-3 max-w-2xl font-display text-[1.9rem] font-semibold leading-tight text-gold-50 sm:text-[2.4rem]">
              We will remind you the week before the date.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[0.95rem] leading-relaxed text-gold-100/70">
              Add a birthday or anniversary once. We send one message seven days out and another on
              the morning of — nothing else, ever.
            </p>
            <form className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
              <input
                type="email"
                required
                placeholder="you@example.com"
                aria-label="Email address"
                className="field flex-1"
              />
              <button type="submit" className="btn btn-gold px-7 py-3">
                Set a reminder
              </button>
            </form>
            <p className="mt-3 text-[0.72rem] text-gold-100/45">
              Demo storefront — this form does not send anything.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
