"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import ProcessScene, { type SceneName } from "./art/ProcessScene";
import type { ProcessStep } from "@/lib/process";
import { useReducedMotion } from "@/lib/media";

const SCENES: SceneName[] = ["order", "market", "kitchen", "boxed", "doorstep"];

/**
 * A tall section with a pinned stage inside it. Scrolling through the section
 * scrubs `--p` from 0 to 1 on the stage, which drives the rail and the travelling
 * marker in CSS, and advances the phase copy in React. Under
 * `prefers-reduced-motion` the whole thing renders as a plain stacked list.
 */
export default function ProcessScroll({ steps }: { steps: ProcessStep[] }) {
  const PROCESS = steps;
  const N = PROCESS.length;

  const outer = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const section = outer.current;
    const el = stage.current;
    if (!section || !el) return;

    let frame = 0;
    let last = -1;

    const measure = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      const p = travel <= 0 ? 0 : Math.min(1, Math.max(0, -rect.top / travel));

      el.style.setProperty("--p", p.toFixed(4));

      const next = Math.min(N - 1, Math.floor(p * N));
      if (next !== last) {
        last = next;
        setPhase(next);
      }
    };

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(measure);
    };

    // Kick off asynchronously so the first paint matches the server's.
    frame = window.requestAnimationFrame(measure);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [reduced, N]);

  // The stages live in an editable content block. If it is empty or missing,
  // hide the section rather than taking the whole page down with it.
  if (PROCESS.length === 0) return null;
  if (reduced) return <StackedFallback steps={PROCESS} />;

  const step = PROCESS[Math.min(phase, PROCESS.length - 1)];

  return (
    <section
      ref={outer}
      aria-label="How your order is made"
      className="process-track relative bg-brand-900"
      style={{ "--steps": N } as React.CSSProperties}
    >
      <div ref={stage} className="sticky top-0 h-[100svh] overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "radial-gradient(circle at 18% 22%, rgba(201,162,39,0.24), transparent 44%), radial-gradient(circle at 84% 76%, rgba(28,133,96,0.5), transparent 46%)",
          }}
        />

        <div className="wrap relative flex h-full flex-col pb-5 pt-[92px] sm:pt-[112px] lg:pt-[168px]">
          <header className="flex items-baseline justify-between gap-4">
            <div>
              <p className="eyebrow text-gold-400">One order, end to end</p>
              <h2 className="mt-1.5 font-display text-[1.5rem] font-semibold tracking-tight text-gold-50 sm:text-[2rem]">
                How it is actually made
              </h2>
            </div>
            <Link
              href="/how-it-works"
              className="hidden shrink-0 text-[0.78rem] font-bold uppercase tracking-[0.16em] text-gold-400 hover:text-gold-300 sm:block"
            >
              All five stages →
            </Link>
          </header>

          <div className="grid min-h-0 flex-1 items-center gap-4 sm:gap-6 lg:grid-cols-[1fr_1.02fr] lg:gap-14">
            {/* ----------------------------------------------- phase copy */}
            <div aria-live="polite" className="order-2 lg:order-1">
              <p className="flex items-center gap-3 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-gold-400">
                {step.phase}
                <span className="h-px w-10 bg-gold-400/50" />
                <span className="font-mono text-gold-100/60">{step.clock}</span>
              </p>

              <h3
                key={`t-${phase}`}
                className="animate-rise mt-2.5 font-display text-[1.6rem] sm:text-[1.9rem] font-semibold leading-[1.1] tracking-tight text-gold-50 sm:text-[2.6rem]"
              >
                {step.title}
              </h3>

              <p
                key={`b-${phase}`}
                className="animate-rise mt-3 max-w-lg text-[0.88rem] leading-relaxed text-gold-100/75 sm:mt-4 sm:text-[1.02rem]"
              >
                {step.standfirst}
              </p>

              <Link
                key={`l-${phase}`}
                href={`/how-it-works/${step.slug}`}
                className="animate-fade btn btn-gold mt-4 px-5 py-2.5 text-[0.82rem] sm:mt-6 sm:px-6 sm:py-3 sm:text-sm"
              >
                Read this stage in full
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h13M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>

            {/* --------------------------------------------------- scenes */}
            <div className="relative order-1 mx-auto w-full max-w-[210px] sm:max-w-[330px] lg:order-2 lg:max-w-[460px]">
              <div className="relative aspect-square">
                {SCENES.map((name, i) => (
                  <div
                    key={name}
                    aria-hidden={i !== phase}
                    className={`absolute inset-0 transition-all duration-700 ease-out ${
                      i === phase
                        ? "scale-100 opacity-100 blur-0"
                        : i < phase
                          ? "pointer-events-none -translate-x-6 scale-95 opacity-0 blur-sm"
                          : "pointer-events-none translate-x-6 scale-95 opacity-0 blur-sm"
                    }`}
                  >
                    <ProcessScene
                      name={name}
                      className="h-full w-full drop-shadow-[0_30px_60px_rgba(0,0,0,0.45)]"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------- rail */}
          <div className="relative shrink-0 pt-3 sm:pt-4">
            <div className="relative h-[2px] w-full rounded-full bg-gold-100/15">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-gold-500 to-gold-300"
                style={{ width: "calc(var(--p, 0) * 100%)" }}
              />
              {/* the marker that runs the length of the rail */}
              <div
                className="absolute top-1/2 grid h-8 w-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-gold-400/60 bg-brand-900 shadow-[0_0_22px_rgba(201,162,39,0.55)]"
                style={{ left: "calc(var(--p, 0) * 100%)" }}
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-gold-300" fill="none" stroke="currentColor" strokeWidth="1.7">
                  <circle cx="6.5" cy="17" r="2.6" />
                  <circle cx="17.5" cy="17" r="2.6" />
                  <path d="M9 17h6M4 17H3v-4h6l3-5h4l2 5h3v4h-2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>

            <ol className="mt-4 grid grid-cols-5 gap-2">
              {PROCESS.map((s, i) => (
                <li key={s.slug} className="min-w-0">
                  <Link
                    href={`/how-it-works/${s.slug}`}
                    className={`block truncate border-t pt-2.5 text-[0.66rem] font-semibold uppercase tracking-[0.12em] transition-colors duration-300 sm:text-[0.72rem] ${
                      i <= phase
                        ? "border-gold-400/70 text-gold-200"
                        : "border-gold-100/15 text-gold-100/35"
                    }`}
                  >
                    <span className="mr-1.5 font-mono">0{i + 1}</span>
                    <span className="hidden sm:inline">{s.title}</span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

/** No pinning, no scrubbing — just the five stages, in order. */
function StackedFallback({ steps }: { steps: ProcessStep[] }) {
  const PROCESS = steps;
  if (PROCESS.length === 0) return null;

  return (
    <section aria-label="How your order is made" className="bg-brand-900 py-16">
      <div className="wrap">
        <p className="eyebrow text-gold-400">One order, end to end</p>
        <h2 className="mt-1.5 font-display text-[1.8rem] font-semibold tracking-tight text-gold-50 sm:text-[2.2rem]">
          How it is actually made
        </h2>
        <div className="mt-10 space-y-10">
          {PROCESS.map((s, i) => (
            <div key={s.slug} className="grid items-center gap-6 sm:grid-cols-[200px_1fr]">
              <ProcessScene name={SCENES[i]} className="w-full max-w-[200px]" />
              <div>
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-gold-400">
                  {s.phase} · {s.clock}
                </p>
                <h3 className="mt-2 font-display text-2xl font-semibold text-gold-50">{s.title}</h3>
                <p className="mt-2 max-w-xl text-[0.95rem] leading-relaxed text-gold-100/75">
                  {s.standfirst}
                </p>
                <Link
                  href={`/how-it-works/${s.slug}`}
                  className="mt-3 inline-block text-[0.78rem] font-bold uppercase tracking-[0.16em] text-gold-400 hover:text-gold-300"
                >
                  Read this stage →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
