import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProductArt from "@/components/art/ProductArt";
import Reveal from "@/components/Reveal";
import { getPost, getPosts } from "@/server/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Not found" };
  return { title: post.title, description: post.excerpt };
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [post, all] = await Promise.all([getPost(slug), getPosts(20)]);
  if (!post) notFound();

  const more = all.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <>
      <article>
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
              <nav className="mb-6 flex flex-wrap items-center gap-2 text-[0.76rem] text-gold-100/55">
                <Link href="/" className="hover:text-gold-300">Home</Link>
                <span>/</span>
                <Link href="/blog" className="hover:text-gold-300">Journal</Link>
                <span>/</span>
                <span className="truncate text-gold-200">{post.title}</span>
              </nav>

              <p className="flex flex-wrap items-center gap-3 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-gold-400">
                {post.tags[0] ?? "Notes"}
                <span className="h-px w-10 bg-gold-400/50" />
                <span className="font-normal normal-case tracking-normal text-gold-100/60">
                  {post.readMinutes} min read
                </span>
              </p>

              <h1 className="mt-3 font-display text-[2.1rem] font-semibold leading-[1.1] tracking-tight text-gold-50 sm:text-[2.9rem]">
                {post.title}
              </h1>
              <div className="gold-rule mt-5 w-28" />
              <p className="mt-5 max-w-xl text-[1rem] leading-relaxed text-gold-100/75">
                {post.excerpt}
              </p>
              <p className="mt-6 text-[0.8rem] text-gold-100/55">
                {post.author && `${post.author} · `}
                {post.publishedAt &&
                  new Date(post.publishedAt).toLocaleDateString("en-IN", {
                    day: "numeric", month: "long", year: "numeric",
                  })}
              </p>
            </div>

            <div className="mx-auto w-full max-w-[420px] overflow-hidden rounded-[1.4rem] border border-gold-400/35 bg-cream shadow-[0_34px_66px_rgba(0,0,0,0.4)]">
              {post.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={post.imageUrl} alt="" className="aspect-[4/3] w-full object-cover" />
              ) : (
                <ProductArt kind={post.art} hues={post.hues} seed={post.slug} className="w-full" />
              )}
            </div>
          </div>
        </div>

        <div className="wrap max-w-[46rem] py-14">
          {post.body.split(/\n{2,}/).map((para, i) => {
            const text = para.trim();
            if (!text) return null;
            // A line starting with ## is a sub-heading; everything else is prose.
            if (text.startsWith("## ")) {
              return (
                <Reveal key={i}>
                  <h2 className="mt-9 font-display text-[1.4rem] font-semibold text-brand-900 first:mt-0">
                    {text.slice(3)}
                  </h2>
                  <div className="gold-rule mt-2.5 w-16" />
                </Reveal>
              );
            }
            return (
              <Reveal key={i}>
                <p className="mt-4 text-[1rem] leading-[1.75] text-brand-800/90">{text}</p>
              </Reveal>
            );
          })}

          {post.tags.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-2 border-t border-brand-800/10 pt-6">
              {post.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-brand-800/12 bg-white px-3.5 py-1.5 text-[0.76rem] font-medium text-brand-800"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>

      {more.length > 0 && (
        <section className="border-t border-brand-800/10 bg-white py-14">
          <div className="wrap">
            <p className="eyebrow">Also in the journal</p>
            <div className="mt-6 grid gap-5 sm:grid-cols-3">
              {more.map((p) => (
                <Link key={p.slug} href={`/blog/${p.slug}`} className="card group flex h-full flex-col">
                  <div className="overflow-hidden">
                    {p.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.imageUrl} alt="" className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-105" />
                    ) : (
                      <ProductArt kind={p.art} hues={p.hues} seed={p.slug} className="aspect-[4/3] w-full" />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-display text-[1.05rem] font-semibold leading-snug text-brand-900">
                      {p.title}
                    </h3>
                    <p className="mt-1.5 line-clamp-2 text-[0.82rem] text-brand-700/70">{p.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
