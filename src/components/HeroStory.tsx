"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import ProductArt from "./art/ProductArt";
import ProcessScene from "./art/ProcessScene";
import { getProduct } from "@/lib/catalog";
import { useReducedMotion } from "@/lib/media";

const CHAPTERS = [
  { clock: "05:00", label: "The market opens", line: "Stems off the floor before the heat, graded by head size.", at: -0.3, to: 0.22 },
  { clock: "06:00", label: "The oven goes on", line: "Baked to your order, then two hours of doing nothing.", at: 0.22, to: 0.44 },
  { clock: "14:00", label: "Iced and sealed", line: "Gold leaf laid by hand. The box is photographed shut.", at: 0.44, to: 0.64 },
  { clock: "21:30", label: "On the late route", line: "One rider, one run, both halves of the order.", at: 0.64, to: 0.82 },
  { clock: "23:52", label: "At the door", line: "Median midnight drop. The handover reaches your phone.", at: 0.82, to: 1.01 },
];

const WORDS: { text: string; gold?: boolean; from: number; to: number }[] = [
  { text: "Cakes and flowers,", from: -0.2, to: 0 },
  { text: "made the day", gold: true, from: 0.3, to: 0.44 },
  { text: "they reach the door.", from: 0.72, to: 0.86 },
];

/** Elements read these as plain numbers inside calc(); see .cue / .beat in globals.css */
const v = (o: Record<string, number | string>) => o as React.CSSProperties;

export default function HeroStory() {
  const track = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [chapter, setChapter] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const outer = track.current;
    const el = stage.current;
    if (!outer || !el) return;

    let frame = 0;
    let last = -1;

    const measure = () => {
      frame = 0;
      const rect = outer.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      const p = travel <= 0 ? 0 : Math.min(1, Math.max(0, -rect.top / travel));
      el.style.setProperty("--p", p.toFixed(4));

      const next = CHAPTERS.findIndex((c) => p < c.to);
      const idx = next === -1 ? CHAPTERS.length - 1 : next;
      if (idx !== last) {
        last = idx;
        setChapter(idx);
      }
    };

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(measure);
    };

    frame = window.requestAnimationFrame(measure);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [reduced]);

  if (reduced) return <StaticHero />;

  const roses = getProduct("hundred-red-roses")!;
  const cake = getProduct("midnight-truffle-cake")!;

  return (
    <section
      ref={track}
      aria-label="How one order becomes a delivery"
      className="hero-track relative"
      style={v({ "--beats": CHAPTERS.length })}
    >
      <div ref={stage} className="sticky top-0 h-[100svh] overflow-hidden bg-brand-900">
        {/* ------------------------------------------------ colour washes */}
        <div className="absolute inset-0 bg-brand-900" />
        {[
          { a: -1, b: 0.3, css: "radial-gradient(circle at 20% 30%, rgba(214,72,95,0.34), transparent 55%), radial-gradient(circle at 78% 70%, rgba(201,162,39,0.24), transparent 55%)" },
          { a: 0.2, b: 0.6, css: "radial-gradient(circle at 70% 40%, rgba(224,155,42,0.4), transparent 58%), radial-gradient(circle at 15% 75%, rgba(201,162,39,0.22), transparent 55%)" },
          { a: 0.46, b: 0.8, css: "radial-gradient(circle at 50% 25%, rgba(235,212,137,0.32), transparent 55%), radial-gradient(circle at 85% 80%, rgba(28,133,96,0.42), transparent 55%)" },
          { a: 0.68, b: 2, css: "radial-gradient(circle at 25% 18%, rgba(20,104,74,0.55), transparent 58%), radial-gradient(circle at 82% 85%, rgba(6,40,29,0.9), transparent 60%)" },
        ].map((w, i) => (
          <div
            key={i}
            className="wash pointer-events-none absolute inset-0"
            style={v({ "--a": w.a, "--b": w.b, "--f": 0.12, backgroundImage: w.css })}
          />
        ))}

        {/* ------------------------------------------------------- stars */}
        <div
          className="wash par pointer-events-none absolute inset-x-0 top-0 h-[60%]"
          style={v({ "--a": 0.6, "--b": 2, "--f": 0.14, "--rate": "26px" })}
        >
          {STARS.map((s, i) => (
            <span
              key={i}
              className="absolute rounded-full bg-gold-200"
              style={{ left: `${s[0]}%`, top: `${s[1]}%`, width: s[2], height: s[2], opacity: s[3] }}
            />
          ))}
        </div>

        {/* ---------------------------------------------------- skyline */}
        <div
          className="beat par pointer-events-none absolute inset-x-0 bottom-0"
          style={v({ "--a": 0.56, "--b": 2, "--f": 0.14, "--dy": "70px", "--rate": "-22px" })}
        >
          <Skyline />
        </div>

        {/* Street-level haze: lifts the chapter rail off the skyline. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[17svh] bg-gradient-to-t from-brand-900 via-brand-900/80 to-transparent" />

        {/* ----------------------------------------------------- petals */}
        <div
          className="wash pointer-events-none absolute inset-0"
          style={v({ "--a": -1, "--b": 0.62, "--f": 0.16 })}
        >
          {PETALS.map((p, i) => (
            <span
              key={i}
              className="par absolute block rounded-[50%_0_50%_0]"
              style={v({
                left: `${p[0]}%`,
                top: `${p[1]}%`,
                width: p[2],
                height: p[2],
                background: i % 3 === 0 ? "#C9A227" : "#A6122B",
                opacity: p[3],
                "--rate": `${p[4]}px`,
                rotate: `${p[5]}deg`,
              })}
            />
          ))}
        </div>

        {/* ---------------------------------------------- the late rider */}
        <div
          className="pointer-events-none absolute bottom-[16%] left-0 hidden text-gold-300 sm:block"
          style={{
            transform:
              "translateX(calc(clamp(0, calc((var(--p, 0) - 0.6) / 0.26), 1) * 118vw - 14vw))",
            opacity: "calc(clamp(0, calc((var(--p, 0) - 0.58) / 0.06), 1) * (1 - clamp(0, calc((var(--p, 0) - 0.86) / 0.06), 1)))",
          }}
        >
          <Scooter />
        </div>

        {/* ------------------------------------------------- the content */}
        <div className="wrap relative flex h-full flex-col pb-[calc(7svh+0.85rem)] pt-[92px] sm:pt-[112px] lg:pt-[150px]">
          <div className="grid min-h-0 flex-1 items-center gap-4 sm:gap-6 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
            {/* --------------------------------------------------- copy */}
            <div className="order-2 lg:order-1">
              <p
                className="cue eyebrow text-gold-400"
                style={v({ "--from": -0.2, "--to": 0, "--dy": "16px" })}
              >
                Est. 2019 · 12 cities · 1.4 lakh deliveries
              </p>

              <h1 className="mt-3 font-display text-[2rem] font-semibold leading-[1.06] tracking-tight text-gold-50 sm:text-[2.9rem] lg:text-[3.3rem]">
                {WORDS.map((w) => (
                  <span
                    key={w.text}
                    className={`cue block ${w.gold ? "text-gold-400" : ""}`}
                    style={v({ "--from": w.from, "--to": w.to, "--dy": "26px", "--sc": 0.97 })}
                  >
                    {w.text}
                  </span>
                ))}
              </h1>

              {/* the running caption */}
              <div className="relative mt-5 h-[74px] sm:h-[68px]">
                {CHAPTERS.map((c, i) => (
                  <div
                    key={c.clock}
                    aria-hidden={i !== chapter}
                    className="beat absolute inset-0"
                    style={v({ "--a": c.at, "--b": c.to, "--f": 0.05, "--dy": "18px" })}
                  >
                    <p className="flex items-center gap-3 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-gold-400">
                      <span className="font-mono">{c.clock}</span>
                      <span className="h-px w-8 bg-gold-400/50" />
                      {c.label}
                    </p>
                    <p className="mt-2 max-w-md text-[0.88rem] leading-relaxed text-gold-100/70 sm:text-[0.95rem]">
                      {c.line}
                    </p>
                  </div>
                ))}
              </div>

              {/* the release */}
              <div
                className="cue mt-6 flex flex-wrap gap-3"
                style={v({ "--from": -0.2, "--to": 0, "--dy": "22px" })}
              >
                <Link href="/shop?category=cakes" className="btn btn-gold sheen px-6 py-3 text-sm sm:px-7 sm:py-3.5">
                  <span className="relative z-10">Shop cakes</span>
                </Link>
                <Link
                  href="/shop?category=flowers"
                  className="btn border border-gold-400/50 px-6 py-3 text-sm text-gold-100 transition hover:bg-gold-400/10 sm:px-7 sm:py-3.5"
                >
                  Shop flowers
                </Link>
              </div>
            </div>

            {/* --------------------------------------------------- film */}
            <div className="relative order-1 mx-auto w-full max-w-[210px] sm:max-w-[320px] lg:order-2 lg:max-w-[440px]">
              <div className="camera relative aspect-square" style={v({ "--zoom": 0.18 })}>
                <Frame a={-0.3} b={0.36} dx="-90px" dy="30px">
                  <ProductArt kind={roses.art} hues={roses.hues} seed={roses.slug} className="h-full w-full" />
                </Frame>
                <Frame a={0.24} b={0.58} dy="90px">
                  <ProductArt kind={cake.art} hues={cake.hues} seed={cake.slug} className="h-full w-full" />
                </Frame>
                <Frame a={0.46} b={0.76} dy="60px">
                  <ProcessScene name="boxed" className="h-full w-full" />
                </Frame>
                <Frame a={0.78} b={2} dy="70px">
                  <ProcessScene name="doorstep" className="h-full w-full" />
                </Frame>
              </div>
            </div>
          </div>

          {/* ---------------------------------------------- chapter rail */}
          <div className="relative shrink-0 pt-3 sm:pt-4">
            <div className="relative h-[2px] w-full rounded-full bg-gold-100/15">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-gold-500 to-gold-300"
                style={{ width: "calc(var(--p, 0) * 100%)" }}
              />
              <div
                className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-300 shadow-[0_0_16px_rgba(201,162,39,0.9)]"
                style={{ left: "calc(var(--p, 0) * 100%)" }}
              />
            </div>
            <ol className="mt-3 grid grid-cols-5 gap-2">
              {CHAPTERS.map((c, i) => (
                <li
                  key={c.clock}
                  className={`truncate border-t pt-2 font-mono text-[0.62rem] uppercase tracking-[0.1em] transition-colors duration-300 sm:text-[0.7rem] ${
                    i <= chapter ? "border-gold-400/70 text-gold-200" : "border-gold-100/15 text-gold-100/35"
                  }`}
                >
                  {c.clock}
                  <span className="ml-1.5 hidden font-sans tracking-normal sm:inline">{c.label}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* --------------------------------------------- letterbox bars */}
        {["top-0", "bottom-0"].map((edge) => (
          <div
            key={edge}
            data-letterbox
            className={`pointer-events-none absolute inset-x-0 ${edge} bg-brand-900`}
            style={{
              height:
                "calc(7svh * clamp(0, calc(var(--p, 0) / 0.05), 1) * (1 - clamp(0, calc((var(--p, 0) - 0.9) / 0.1), 1)))",
            }}
          />
        ))}

        {/* --------------------------------------------- skip + scroll cue */}
        <a
          href="#start"
          className="wash absolute right-5 top-[112px] z-10 rounded-full border border-gold-400/40 px-3.5 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-gold-200 backdrop-blur transition hover:bg-gold-400/10 sm:top-[120px] lg:top-[158px]"
          style={v({ "--a": -1, "--b": 0.9, "--f": 0.08 })}
        >
          Skip intro
        </a>

        <div
          className="wash pointer-events-none absolute bottom-[13svh] left-1/2 hidden -translate-x-1/2 text-center sm:block"
          style={v({ "--a": -1, "--b": 0.04, "--f": 0.04 })}
        >
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.24em] text-gold-300">Scroll</p>
          <div className="float mx-auto mt-2 h-6 w-px bg-gradient-to-b from-gold-400 to-transparent" />
        </div>
      </div>
    </section>
  );
}

function Frame({
  a,
  b,
  dx = "0px",
  dy = "0px",
  children,
}: {
  a: number;
  b: number;
  dx?: string;
  dy?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="beat absolute inset-0 overflow-hidden rounded-[1.4rem] border border-gold-400/35 bg-cream shadow-[0_40px_80px_-30px_rgba(0,0,0,0.75)]"
      style={v({ "--a": a, "--b": b, "--f": 0.09, "--dx": dx, "--dy": dy })}
    >
      {children}
    </div>
  );
}

function Skyline() {
  return (
    <svg viewBox="0 0 1440 220" className="h-[26svh] w-full" preserveAspectRatio="none" aria-hidden="true">
      <path
        d="M0 220 V150 h70 v-34 h48 v34 h58 V96 h40 v54 h64 v-72 h54 v72 h72 v-40 h46 v40 h60 V110 h52 v40 h66 V78 h56 v72 h74 v-46 h44 v46 h62 v-64 h50 v64 h68 v-30 h44 v30 h84 v-52 h48 v52 h90 V220 Z"
        fill="#02120C"
      />
      {/* a thin lit roofline so the silhouette reads against the night wash */}
      <path
        d="M0 150 h70 v-34 h48 v34 h58 V96 h40 v54 h64 v-72 h54 v72 h72 v-40 h46 v40 h60 V110 h52 v40 h66 V78 h56 v72 h74 v-46 h44 v46 h62 v-64 h50 v64 h68 v-30 h44 v30 h84 v-52 h48 v52 h90"
        fill="none"
        stroke="#C9A227"
        strokeOpacity="0.22"
        strokeWidth="1.5"
      />
      {[
        [96, 132], [188, 128], [268, 112], [352, 96], [470, 128],
        [560, 126], [700, 96], [826, 120], [960, 96], [1112, 126], [1266, 110],
      ].map(([x, y], i) => (
        <rect key={i} x={x} y={y} width="7" height="9" rx="1.5" fill="#EBD489" opacity={i % 2 ? 0.95 : 0.6} />
      ))}
    </svg>
  );
}

function Scooter() {
  return (
    <svg viewBox="0 0 120 64" className="h-12 w-24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
      <circle cx="26" cy="48" r="10" />
      <circle cx="94" cy="48" r="10" />
      <path d="M36 48h48M16 48H8V32h30l16-18h18l8 18h14v16h-8" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="42" y="8" width="26" height="20" rx="4" fill="currentColor" opacity="0.35" />
      <path d="M0 24h20M4 36h14" strokeWidth="2.4" opacity="0.55" strokeLinecap="round" />
    </svg>
  );
}

/** [left%, top%, size, opacity] */
const STARS: [number, number, string, number][] = [
  [8, 18, "2px", 0.7], [17, 34, "1.5px", 0.5], [26, 12, "2.5px", 0.85], [34, 42, "1.5px", 0.4],
  [43, 22, "2px", 0.65], [52, 8, "1.5px", 0.5], [61, 36, "2.5px", 0.8], [69, 16, "1.5px", 0.45],
  [77, 30, "2px", 0.7], [85, 10, "2.5px", 0.9], [92, 40, "1.5px", 0.45], [12, 52, "1.5px", 0.35],
  [58, 50, "2px", 0.5], [96, 22, "2px", 0.6], [3, 38, "1.5px", 0.4],
];

/** [left%, top%, size, opacity, parallax px, rotation deg] */
const PETALS: [number, number, string, number, number, number][] = [
  [6, 26, "12px", 0.5, 120, 18], [15, 62, "9px", 0.4, 180, -24], [23, 14, "14px", 0.35, 90, 40],
  [31, 78, "10px", 0.45, 210, 12], [45, 30, "8px", 0.3, 150, -35], [55, 68, "13px", 0.4, 130, 26],
  [66, 20, "9px", 0.35, 195, -14], [74, 74, "11px", 0.45, 105, 33], [83, 36, "8px", 0.3, 165, -42],
  [91, 60, "12px", 0.4, 140, 20], [38, 52, "7px", 0.28, 225, 8], [60, 44, "10px", 0.32, 175, -20],
];

/** Everything the sequence lands on, without the sequence. */
function StaticHero() {
  const roses = getProduct("hundred-red-roses")!;
  return (
    <section className="relative overflow-hidden bg-brand-800">
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 20%, rgba(201,162,39,0.28), transparent 42%), radial-gradient(circle at 85% 78%, rgba(28,133,96,0.5), transparent 45%)",
        }}
      />
      <div className="wrap relative grid items-center gap-12 py-14 lg:grid-cols-[1.05fr_1fr] lg:py-20">
        <div>
          <p className="eyebrow text-gold-400">Est. 2019 · 12 cities · 1.4 lakh deliveries</p>
          <h1 className="mt-4 font-display text-[2.5rem] font-semibold leading-[1.08] tracking-tight text-gold-50 sm:text-[3.4rem]">
            Cakes and flowers,
            <br />
            <span className="text-gold-400">made the day</span>
            <br />
            they reach the door.
          </h1>
          <p className="mt-6 max-w-lg text-[1.02rem] leading-relaxed text-gold-100/75">
            Bought at the market at five, baked to your order at six, sealed at two and handed over
            just before midnight. Eighteen hours, one rider, one doorbell.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/shop?category=cakes" className="btn btn-gold px-7 py-3.5">Shop cakes</Link>
            <Link href="/shop?category=flowers" className="btn border border-gold-400/50 px-7 py-3.5 text-gold-100">
              Shop flowers
            </Link>
          </div>
        </div>
        <div className="mx-auto w-full max-w-[440px] overflow-hidden rounded-[1.4rem] border border-gold-400/35 bg-cream">
          <ProductArt kind={roses.art} hues={roses.hues} seed={roses.slug} className="w-full" />
        </div>
      </div>
    </section>
  );
}
