import Link from "next/link";

export default function SectionHead({
  eyebrow,
  title,
  sub,
  href,
  hrefLabel = "View all",
  center,
  tone = "light",
}: {
  eyebrow?: string;
  title: string;
  sub?: string;
  href?: string;
  hrefLabel?: string;
  center?: boolean;
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";
  return (
    <div
      className={`mb-8 flex gap-4 ${
        center ? "flex-col items-center text-center" : "flex-wrap items-end"
      }`}
    >
      <div className={center ? "" : "flex-1 min-w-[260px]"}>
        {eyebrow && <p className={`eyebrow ${dark ? "text-gold-400" : ""}`}>{eyebrow}</p>}
        <h2
          className={`mt-2 font-display text-[1.75rem] font-semibold leading-tight tracking-tight sm:text-[2.15rem] ${
            dark ? "text-gold-50" : "text-brand-900"
          }`}
        >
          {title}
        </h2>
        <div className={`gold-rule mt-3 w-24 ${center ? "mx-auto" : ""}`} />
        {sub && (
          <p
            className={`mt-3 max-w-xl text-[0.92rem] leading-relaxed ${
              dark ? "text-gold-100/70" : "text-brand-700/75"
            }`}
          >
            {sub}
          </p>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className={`btn ${dark ? "btn-gold" : "btn-outline"} px-5 py-2.5 text-sm`}
        >
          {hrefLabel}
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h13M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      )}
    </div>
  );
}
