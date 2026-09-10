import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProcessScene, { type SceneName } from "@/components/art/ProcessScene";
import ProductCard from "@/components/ProductCard";
import Carousel from "@/components/Carousel";
import Reveal from "@/components/Reveal";
import SectionHead from "@/components/SectionHead";
import { getProcess, getProducts } from "@/server/queries";

const SCENES: SceneName[] = ["order", "market", "kitchen", "boxed", "doorstep"];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ step: string }>;
}): Promise<Metadata> {
  const { step } = await params;
  const s = (await getProcess()).find((x) => x.slug === step);
  if (!s) return { title: "Not found" };
  return { title: s.title, description: s.standfirst };
}

export default async function ProcessStepPage({
  params,
}: {
  params: Promise<{ step: string }>;
}) {
  const { step } = await params;
  const [PROCESS, products] = await Promise.all([getProcess(), getProducts()]);
  const s = PROCESS.find((x) => x.slug === step);
  if (!s) notFound();

  const index = PROCESS.findIndex((x) => x.slug === step);
  const prev = PROCESS[index - 1];
  const next = PROCESS[index + 1];
  const picks = products.filter((p) => p.bestseller);

  return (
    <>
      {/* -------------------------------------------------------------- head */}
      <div className="relative overflow-hidden bg-brand-800">
        <div
          className="pointer-events-none absolute inset-0 opacity-55"
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 25%, rgba(201,162,39,0.26), transparent 44%), radial-gradient(circle at 85% 78%, rgba(28,133,96,0.5), transparent 46%)",
          }}
        />
        <div className="wrap relative grid items-center gap-10 py-12 lg:grid-cols-[1.1fr_1fr] lg:py-16">
          <div>
            <nav className="mb-7 flex flex-wrap items-center gap-2 text-[0.76rem] text-gold-100/55">
              <Link href="/" className="hover:text-gold-300">Home</Link>
              <span>/</span>
              <Link href="/how-it-works" className="hover:text-gold-300">How it is made</Link>
              <span>/</span>
              <span className="text-gold-200">{s.title}</span>
            </nav>

            <p className="flex flex-wrap items-center gap-3 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-gold-400">
              {s.phase}
              <span className="h-px w-10 bg-gold-400/50" />
              <span className="font-mono normal-case tracking-normal text-gold-100/60">
                {s.clock}
              </span>
            </p>

            <h1 className="mt-3 font-display text-[2.2rem] font-semibold leading-[1.1] tracking-tight text-gold-50 sm:text-[3rem]">
              {s.title}
            </h1>
            <div className="gold-rule mt-5 w-28" />
            <p className="mt-5 max-w-xl text-[1rem] leading-relaxed text-gold-100/75">
              {s.standfirst}
            </p>

            {/* progress through the five stages */}
            <ol className="mt-8 flex gap-1.5">
              {PROCESS.map((x, i) => (
                <li key={x.slug} className="flex-1">
                  <Link
                    href={`/how-it-works/${x.slug}`}
                    aria-label={x.title}
                    aria-current={i === index}
                    className={`block h-1 rounded-full transition-colors ${
                      i === index
                        ? "bg-gold-400"
                        : i < index
                          ? "bg-gold-400/45"
                          : "bg-gold-100/15 hover:bg-gold-100/35"
                    }`}
                  />
                </li>
              ))}
            </ol>
          </div>

          <div className="mx-auto w-full max-w-[380px]">
            <ProcessScene
              name={SCENES[index]}
              className="w-full drop-shadow-[0_34px_66px_rgba(0,0,0,0.5)]"
            />
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------- body */}
      <article className="wrap grid gap-12 py-14 lg:grid-cols-[1fr_300px]">
        <div>
          <Reveal>
            <p className="font-display text-[1.25rem] leading-relaxed text-brand-900 sm:text-[1.4rem]">
              {s.intro}
            </p>
          </Reveal>

          <div className="mt-10 space-y-9">
            {s.detail.map((d, i) => (
              <Reveal key={d.heading} from="up" delay={i * 80}>
                <section>
                  <h2 className="flex items-baseline gap-3 font-display text-[1.3rem] font-semibold text-brand-900">
                    <span className="font-mono text-[0.8rem] text-gold-600">0{i + 1}</span>
                    {d.heading}
                  </h2>
                  <div className="gold-rule mt-2.5 w-16" />
                  <p className="mt-3 text-[0.95rem] leading-relaxed text-brand-800/85">{d.body}</p>
                </section>
              </Reveal>
            ))}
          </div>

          <Reveal from="zoom">
            <aside className="mt-11 rounded-2xl border border-gold-400/45 bg-gold-50 p-6">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-gold-700">
                What goes wrong here
              </p>
              <p className="mt-2.5 text-[0.95rem] leading-relaxed text-brand-800/90">
                {s.goesWrong}
              </p>
            </aside>
          </Reveal>

          {/* prev / next */}
          <nav className="mt-11 grid gap-3 border-t border-brand-800/10 pt-6 sm:grid-cols-2">
            {prev ? (
              <Link
                href={`/how-it-works/${prev.slug}`}
                className="group rounded-xl border border-brand-800/10 bg-white p-4 transition hover:border-gold-500"
              >
                <span className="text-[0.66rem] font-bold uppercase tracking-[0.18em] text-gold-600">
                  ← {prev.phase}
                </span>
                <span className="mt-1 block font-display text-lg font-semibold text-brand-900">
                  {prev.title}
                </span>
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link
                href={`/how-it-works/${next.slug}`}
                className="group rounded-xl border border-brand-800/10 bg-white p-4 text-right transition hover:border-gold-500 sm:col-start-2"
              >
                <span className="text-[0.66rem] font-bold uppercase tracking-[0.18em] text-gold-600">
                  {next.phase} →
                </span>
                <span className="mt-1 block font-display text-lg font-semibold text-brand-900">
                  {next.title}
                </span>
              </Link>
            )}
          </nav>
        </div>

        {/* --------------------------------------------------------- aside */}
        <aside className="lg:sticky lg:top-[170px] lg:self-start">
          <div className="rounded-2xl border border-brand-800/10 bg-white p-6">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-gold-600">
              This stage in numbers
            </p>
            <dl className="mt-4 space-y-4">
              {s.facts.map(([big, small]) => (
                <div key={big}>
                  <dt className="font-display text-2xl font-semibold text-brand-900">{big}</dt>
                  <dd className="mt-0.5 text-[0.78rem] leading-snug text-brand-700/70">{small}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="mt-4 rounded-2xl bg-brand-800 p-6">
            <p className="font-display text-lg font-semibold text-gold-50">
              Every stage, in order
            </p>
            <ol className="mt-3 space-y-1.5">
              {PROCESS.map((x, i) => (
                <li key={x.slug}>
                  <Link
                    href={`/how-it-works/${x.slug}`}
                    className={`flex gap-2.5 rounded-lg px-2.5 py-1.5 text-[0.84rem] transition ${
                      i === index
                        ? "bg-brand-900 font-semibold text-gold-200"
                        : "text-gold-100/65 hover:bg-brand-900/60 hover:text-gold-100"
                    }`}
                  >
                    <span className="font-mono text-[0.72rem] text-gold-400">0{i + 1}</span>
                    {x.title}
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </article>

      <section className="wrap pb-6">
        <Reveal>
          <SectionHead
            eyebrow="Made this way"
            title="What comes out the other end"
            href="/shop"
          />
        </Reveal>
        <Reveal from="right">
          <Carousel label="bestsellers">
            {picks.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </Carousel>
        </Reveal>
      </section>
    </>
  );
}
