"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * A snap-scrolling rail with arrow controls. Native overflow scrolling does the
 * work, so it drags on touch, keeps keyboard focus behaviour, and degrades to a
 * plain scrollable row if JS never runs.
 */
export default function Carousel({
  children,
  itemClass = "w-[78vw] sm:w-[46vw] lg:w-[288px]",
  label,
}: {
  children: React.ReactNode[];
  itemClass?: string;
  label: string;
}) {
  const rail = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const sync = useCallback(() => {
    const el = rail.current;
    if (!el) return;
    setAtStart(el.scrollLeft < 8);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 8);
  }, []);

  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    sync();
    el.addEventListener("scroll", sync, { passive: true });
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", sync);
      ro.disconnect();
    };
  }, [sync]);

  function nudge(dir: 1 | -1) {
    const el = rail.current;
    if (!el) return;
    const step = el.querySelector<HTMLElement>(":scope > *")?.offsetWidth ?? 320;
    el.scrollBy({ left: dir * (step + 16), behavior: "smooth" });
  }

  return (
    <div className="relative">
      <div ref={rail} className="rail" role="group" aria-label={label}>
        {children.map((child, i) => (
          <div key={i} className={itemClass}>
            {child}
          </div>
        ))}
      </div>

      <Arrow side="left" disabled={atStart} onClick={() => nudge(-1)} label={`Previous ${label}`} />
      <Arrow side="right" disabled={atEnd} onClick={() => nudge(1)} label={`Next ${label}`} />
    </div>
  );
}

function Arrow({
  side,
  disabled,
  onClick,
  label,
}: {
  side: "left" | "right";
  disabled: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`absolute top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-gold-400/60 bg-white/95 text-brand-800 shadow-[0_10px_30px_-12px_rgba(11,61,46,0.55)] backdrop-blur transition hover:border-gold-500 hover:bg-gold-50 disabled:pointer-events-none disabled:opacity-0 md:grid ${
        side === "left" ? "-left-4" : "-right-4"
      }`}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
        <path
          d={side === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
