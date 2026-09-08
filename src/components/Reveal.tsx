"use client";

import { useEffect, useRef, type ElementType } from "react";

type Direction = "up" | "left" | "right" | "zoom";

/**
 * Reveals its children once they scroll into view. The hidden state lives in
 * CSS (`[data-reveal]`), so server-rendered HTML is styled correctly on the
 * first paint and this only ever adds the `data-shown` flag.
 */
export default function Reveal({
  children,
  as: Tag = "div",
  from = "up",
  delay = 0,
  className = "",
  once = true,
}: {
  children: React.ReactNode;
  as?: ElementType;
  from?: Direction;
  delay?: number;
  className?: string;
  once?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      el.setAttribute("data-shown", "");
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-shown", "");
            if (once) io.unobserve(entry.target);
          } else if (!once) {
            entry.target.removeAttribute("data-shown");
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [once]);

  return (
    <Tag
      ref={ref}
      data-reveal={from}
      style={delay ? ({ "--reveal-delay": `${delay}ms` } as React.CSSProperties) : undefined}
      className={className}
    >
      {children}
    </Tag>
  );
}
