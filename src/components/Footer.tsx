import Link from "next/link";
import Logo from "./Logo";
import { getCategories, getOccasions, getContent } from "@/server/queries";

type FooterContent = {
  blurb: string;
  cities: string[];
  help: string[];
  socials?: string[];
  legal: string;
};

const FALLBACK: FooterContent = { blurb: "", cities: [], help: [], legal: "" };

export default async function Footer() {
  const [CATEGORIES, OCCASIONS, content] = await Promise.all([
    getCategories(),
    getOccasions(),
    getContent<FooterContent>("footer", FALLBACK),
  ]);
  const CITIES = content.cities;
  return (
    <footer className="mt-24 bg-brand-900 text-gold-100">
      <div className="gold-rule" />

      <div className="wrap grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Logo tone="dark" />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-gold-100/70">
{content.blurb}
          </p>
          <div className="mt-6 flex gap-2.5">
            {(content.socials?.length ? content.socials : ["Instagram", "Facebook", "X", "WhatsApp"]).map((s) => (
              <span
                key={s}
                className="grid h-9 w-9 place-items-center rounded-full border border-gold-500/40 text-[0.62rem] font-bold text-gold-300"
                title={s}
              >
                {s[0]}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h4 className="mb-3.5 text-[0.72rem] font-bold uppercase tracking-[0.2em] text-gold-400">
            Shop
          </h4>
          <ul className="space-y-2 text-sm text-gold-100/75">
            {CATEGORIES.map((c) => (
              <li key={c.slug}>
                <Link href={`/shop?category=${c.slug}`} className="transition hover:text-gold-300">
                  {c.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/shop" className="transition hover:text-gold-300">
                Everything
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3.5 text-[0.72rem] font-bold uppercase tracking-[0.2em] text-gold-400">
            Occasions
          </h4>
          <ul className="space-y-2 text-sm text-gold-100/75">
            {OCCASIONS.slice(0, 6).map((o) => (
              <li key={o.slug}>
                <Link href={`/shop?occasion=${o.slug}`} className="transition hover:text-gold-300">
                  {o.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-3.5 text-[0.72rem] font-bold uppercase tracking-[0.2em] text-gold-400">
            Help
          </h4>
          <ul className="space-y-2 text-sm text-gold-100/75">
            <li>
              <Link href="/how-it-works" className="transition hover:text-gold-300">
                How it is made
              </Link>
            </li>
            {content.help.map((t) => (
              <li key={t}>
                <span className="cursor-default transition hover:text-gold-300">{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="wrap border-t border-gold-500/15 py-7">
        <h4 className="mb-3 text-[0.72rem] font-bold uppercase tracking-[0.2em] text-gold-400">
          We deliver in
        </h4>
        <p className="text-[0.82rem] leading-relaxed text-gold-100/55">
          {CITIES.join(" · ")}
        </p>
      </div>

      <div className="wrap flex flex-col gap-3 border-t border-gold-500/15 py-6 text-[0.78rem] text-gold-100/50 sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} NY Bakes and Bloom. {content.legal}
        </p>
        <p className="flex gap-5">
          <span>Terms</span>
          <span>Privacy</span>
          <span>FSSAI licensed kitchens</span>
        </p>
      </div>
    </footer>
  );
}
