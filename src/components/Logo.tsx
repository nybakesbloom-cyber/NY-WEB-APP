export default function Logo({ className = "", tone = "light" }: { className?: string; tone?: "light" | "dark" }) {
  const mark = tone === "light" ? "#C9A227" : "#C9A227";
  const word = tone === "light" ? "#0B3D2E" : "#FBF8F1";
  const sub = tone === "light" ? "#14684A" : "#EBD489";
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg viewBox="0 0 48 48" className="h-9 w-9 shrink-0" aria-hidden="true">
        <circle cx="24" cy="24" r="22" fill="none" stroke={mark} strokeWidth="1.6" />
        <circle cx="24" cy="24" r="18.5" fill="none" stroke={mark} strokeOpacity="0.4" strokeWidth="0.9" />
        <path
          d="M24 34c-6 0-10-4-10-9 0-4 3-7 6-7 2 0 4 1 4 3 0-2 2-3 4-3 3 0 6 3 6 7 0 5-4 9-10 9Z"
          fill={mark}
        />
        <path d="M24 34c0-5 3-9 7-11" stroke={sub} strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <path d="M24 34c0-5-3-9-7-11" stroke={sub} strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <circle cx="24" cy="20" r="2.6" fill={tone === "light" ? "#0B3D2E" : "#06281D"} />
      </svg>
      <span className="leading-none">
        <span
          className="block whitespace-nowrap font-display text-[1.2rem] font-semibold tracking-tight sm:text-[1.3rem]"
          style={{ color: word }}
        >
          NY Bakes <span style={{ color: mark }}>and Bloom</span>
        </span>
        <span
          className="mt-0.5 block text-[0.55rem] font-semibold uppercase tracking-[0.24em] sm:text-[0.58rem] sm:tracking-[0.28em]"
          style={{ color: sub }}
        >
          Cakes &amp; Flowers
        </span>
      </span>
    </span>
  );
}
