import Link from "next/link";
import type { Metadata } from "next";
import ProductArt from "@/components/art/ProductArt";
import Reveal from "@/components/Reveal";
import { getPosts, getContent } from "@/server/queries";

export const metadata: Metadata = {
  title: "Journal",
  description: "Notes from the kitchen and the flower market.",
};

const PER_PAGE = 9;

type SP = Record<string, string | string[] | undefined>;

export default async function BlogIndex({ searchParams }: { searchParams: Promise<SP> }) {
  const [sp, posts, copy] = await Promise.all([
    searchParams,
    getPosts(200),
    getContent<{ eyebrow?: string; title?: string; sub?: string }>("blog", {}),
  ]);

  const raw = sp.page;
  const asked = Math.max(1, Number(Array.isArray(raw) ? raw[0] : raw) || 1);
  const pages = Math.max(1, Math.ceil(posts.length / PER_PAGE));
  const current = Math.min(asked, pages);
  const slice = posts.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  return (
    <>
      <div className="relative overflow-hidden bg-brand-800">
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 25%, rgba(201,162,39,0.26), transparent 44%), radial-gradient(circle at 82% 80%, rgba(28,133,96,0.5), transparent 46%)",
          }}
        />
        <div className="wrap relative py-14 lg:py-20">
          <nav className="mb-4 flex items-center gap-2 text-[0.76rem] text-gold-100/55">
            <Link href="/" className="hover:text-gold-300">Home</Link>
            <span>/</span>
            <span className="text-gold-200">{copy.title || "Journal"}</span>
          </nav>
          <p className="eyebrow text-gold-400">{copy.eyebrow || "From the kitchen"}</p>
          <h1 className="mt-3 max-w-3xl font-display text-[2.2rem] font-semibold leading-[1.1] tracking-tight text-gold-50 sm:text-[3rem]">
            {copy.title || "Journal"}
          </h1>
          <div className="gold-rule mt-5 w-32" />
          <p className="mt-5 max-w-2xl text-[1rem] leading-relaxed text-gold-100/75">
            {copy.sub || "Notes from the kitchen and the flower market — what we bake, what we buy, and why."}
          </p>
        </div>
      </div>

      <div className="wrap py-14">
        {slice.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-brand-800/20 bg-white px-6 py-14 text-center text-[0.9rem] text-brand-700/60">
            Nothing published yet.
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {slice.map((post, i) => (
              <Reveal key={post.slug} from="up" delay={(i % 3) * 90}>
                <Link href={`/blog/${post.slug}`} className="card group flex h-full flex-col">
                  <div className="overflow-hidden">
                    {post.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={post.imageUrl}
                        alt=""
                        className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <ProductArt
                        kind={post.art}
                        hues={post.hues}
                        seed={post.slug}
                        className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <p className="flex flex-wrap items-center gap-2 text-[0.66rem] font-bold uppercase tracking-[0.16em] text-gold-600">
                      {post.tags[0] ?? "Notes"}
                      <span className="h-px w-5 bg-gold-500/40" />
                      <span className="font-normal normal-case tracking-normal text-brand-700/55">
                        {post.readMinutes} min read
                      </span>
                    </p>
                    <h2 className="mt-2 font-display text-[1.2rem] font-semibold leading-snug text-brand-900">
                      {post.title}
                    </h2>
                    <p className="mt-2 line-clamp-3 text-[0.86rem] leading-relaxed text-brand-700/75">
                      {post.excerpt}
                    </p>
                    <p className="mt-auto pt-4 text-[0.74rem] text-brand-700/55">
                      {post.author && `${post.author} · `}
                      {post.publishedAt &&
                        new Date(post.publishedAt).toLocaleDateString("en-IN", {
                          day: "numeric", month: "long", year: "numeric",
                        })}
                    </p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        )}

        {pages > 1 && (
          <nav className="mt-10 flex flex-wrap items-center justify-center gap-1.5" aria-label="Pagination">
            {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
              <Link
                key={n}
                href={n === 1 ? "/blog" : `/blog?page=${n}`}
                aria-current={n === current ? "page" : undefined}
                className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition ${
                  n === current
                    ? "bg-brand-800 text-gold-100"
                    : "border border-brand-800/12 bg-white text-brand-800 hover:border-gold-500"
                }`}
              >
                {n}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </>
  );
}
