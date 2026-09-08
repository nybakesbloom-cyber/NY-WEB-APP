"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import ProductArt from "./art/ProductArt";
import { HERO_SLIDES, getProduct } from "@/lib/catalog";
import { useReducedMotion } from "@/lib/media";

const INTERVAL = 7000;

const STATS: [string, string][] = [
  ["4.8 / 5", "across 18,400 reviews"],
  ["6 PM", "cut-off for same-day"],
  ["11:52 PM", "median midnight drop"],
];

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion();
  const timer = useRef<number | undefined>(undefined);

  const go = useCallback((next: number) => {
    setIndex((next + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, []);

  useEffect(() => {
    if (paused || reduced) return;
    timer.current = window.setTimeout(() => go(index + 1), INTERVAL);
    return () => window.clearTimeout(timer.current);
  }, [index, paused, reduced, go]);

  const slide = HERO_SLIDES[index];
  const [heroSlug, floatA, floatB] = slide.art;
  const hero = getProduct(heroSlug)!;
  const a = getProduct(floatA)!;
  const b = getProduct(floatB)!;

  return (
    <section
      className="relative overflow-hidden bg-brand-800"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Featured"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-50 transition-opacity duration-700"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 20%, rgba(201,162,39,0.28), transparent 42%), radial-gradient(circle at 85% 78%, rgba(28,133,96,0.5), transparent 45%)",
        }}
      />

      <div className="wrap relative grid items-center gap-12 py-14 lg:grid-cols-[1.05fr_1fr] lg:py-20">
        {/* ------------------------------------------------------- copy */}
        <div key={index} className="animate-rise">
          <p className="eyebrow text-gold-400">{slide.eyebrow}</p>
          <h1 className="mt-4 font-display text-[2.5rem] font-semibold leading-[1.08] tracking-tight text-gold-50 sm:text-[3.4rem]">
            {slide.headline[0]}
            <br />
            <span className="text-gold-400">{slide.headline[1]}</span>
            <br />
            {slide.headline[2]}
          </h1>
          <p className="mt-6 max-w-lg text-[1.02rem] leading-relaxed text-gold-100/75">
            {slide.body}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={slide.primary.href} className="btn btn-gold sheen px-7 py-3.5">
              <span className="relative z-10">{slide.primary.label}</span>
            </Link>
            <Link
              href={slide.secondary.href}
              className="btn border border-gold-400/50 px-7 py-3.5 text-gold-100 transition hover:bg-gold-400/10"
            >
              {slide.secondary.label}
            </Link>
          </div>

          <dl className="mt-10 grid max-w-lg grid-cols-3 gap-6 border-t border-gold-400/20 pt-7">
            {STATS.map(([big, small]) => (
              <div key={big}>
                <dt className="font-display text-2xl font-semibold text-gold-400">{big}</dt>
                <dd className="mt-1 text-[0.76rem] leading-snug text-gold-100/60">{small}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* -------------------------------------------------------- art */}
        <div className="relative">
          <div className="relative overflow-hidden rounded-[1.5rem] border border-gold-400/35 bg-cream shadow-[0_40px_80px_-30px_rgba(0,0,0,0.6)]">
            {HERO_SLIDES.map((s, i) => {
              const p = getProduct(s.art[0])!;
              return (
                <div
                  key={s.art[0]}
                  aria-hidden={i !== index}
                  className={`transition-opacity duration-700 ${
                    i === index ? "opacity-100" : "pointer-events-none absolute inset-0 opacity-0"
                  }`}
                >
                  <ProductArt
                    kind={p.art}
                    hues={p.hues}
                    seed={p.slug}
                    className={`w-full ${i === index && !reduced ? "ken-burns" : ""}`}
                  />
                </div>
              );
            })}
          </div>

          <div
            key={`a-${index}`}
            className="pop-in float absolute -left-3 bottom-6 hidden w-36 overflow-hidden rounded-2xl border border-gold-400/40 bg-cream shadow-2xl sm:block lg:-left-10"
          >
            <ProductArt kind={a.art} hues={a.hues} seed={a.slug} className="w-full" />
          </div>

          <div
            key={`b-${index}`}
            className="pop-in float-slow absolute -right-2 -top-4 hidden w-32 overflow-hidden rounded-2xl border border-gold-400/40 bg-cream shadow-2xl sm:block lg:-right-8"
          >
            <ProductArt kind={b.art} hues={b.hues} seed={b.slug} className="w-full" />
          </div>

          <div
            key={`badge-${index}`}
            className="pop-in absolute -bottom-5 right-4 rounded-xl border border-gold-400/40 bg-brand-900/95 px-4 py-3 backdrop-blur lg:right-10"
          >
            <p className="flex items-center gap-1.5 text-[0.62rem] font-bold uppercase tracking-[0.18em] text-gold-400">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-gold-400" />
              </span>
              {slide.badge[0]}
            </p>
            <p className="mt-1 text-sm font-semibold text-gold-50">{slide.badge[1]}</p>
          </div>

          <span className="sr-only" aria-live="polite">
            Slide {index + 1} of {HERO_SLIDES.length}: {hero.name}
          </span>
        </div>
      </div>

      {/* ---------------------------------------------------- controls */}
      <div className="wrap relative flex items-center gap-4 pb-8 lg:pb-10">
        <div className="flex gap-2">
          {HERO_SLIDES.map((s, i) => (
            <button
              key={s.art[0]}
              onClick={() => go(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === index}
              className="group relative h-1 w-14 overflow-hidden rounded-full bg-gold-100/25"
            >
              <span
                className={`absolute inset-y-0 left-0 rounded-full bg-gold-400 ${
                  i === index ? "w-full" : "w-0 group-hover:w-1/3"
                } transition-[width] duration-300`}
                style={
                  i === index && !paused && !reduced
                    ? { animation: `grow ${INTERVAL}ms linear both` }
                    : undefined
                }
              />
            </button>
          ))}
        </div>

        <div className="ml-auto flex gap-2">
          <NavButton onClick={() => go(index - 1)} label="Previous slide" dir="left" />
          <NavButton onClick={() => go(index + 1)} label="Next slide" dir="right" />
        </div>
      </div>

      <style>{`@keyframes grow { from { width: 0 } to { width: 100% } }`}</style>
    </section>
  );
}

function NavButton({
  onClick,
  label,
  dir,
}: {
  onClick: () => void;
  label: string;
  dir: "left" | "right";
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="grid h-10 w-10 place-items-center rounded-full border border-gold-400/40 text-gold-200 transition hover:border-gold-400 hover:bg-gold-400/10"
    >
      <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" style={{ height: 18, width: 18 }} fill="none" stroke="currentColor" strokeWidth="2">
        <path
          d={dir === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
