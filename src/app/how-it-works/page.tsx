import Link from "next/link";
import type { Metadata } from "next";
import ProcessScene, { type SceneName } from "@/components/art/ProcessScene";
import Reveal from "@/components/Reveal";
import { PROCESS } from "@/lib/process";

const SCENES: SceneName[] = ["order", "market", "kitchen", "boxed", "doorstep"];

export const metadata: Metadata = {
  title: "How it is made",
  description:
    "The five stages every Felicet Bloom order goes through, from the moment you check out to the photograph at the door.",
};

export default function HowItWorksPage() {
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
            <span className="text-gold-200">How it is made</span>
          </nav>
          <p className="eyebrow text-gold-400">One order, end to end</p>
          <h1 className="mt-3 max-w-3xl font-display text-[2.2rem] font-semibold leading-[1.1] tracking-tight text-gold-50 sm:text-[3rem]">
            Five stages, and the one that everybody else skips.
          </h1>
          <div className="gold-rule mt-5 w-32" />
          <p className="mt-5 max-w-2xl text-[1rem] leading-relaxed text-gold-100/75">
            Eighteen hours from checkout to doorstep, most of it spent waiting for sponge to cool
            and stems to drink. Here is each stage, what happens in it, and what tends to go wrong.
          </p>
        </div>
      </div>

      <div className="wrap py-14">
        <div className="space-y-6">
          {PROCESS.map((s, i) => (
            <Reveal key={s.slug} from={i % 2 ? "right" : "left"}>
              <Link
                href={`/how-it-works/${s.slug}`}
                className="card group grid items-center gap-6 p-5 sm:grid-cols-[180px_1fr] sm:p-6"
              >
                <div className="overflow-hidden rounded-xl">
                  <ProcessScene
                    name={SCENES[i]}
                    className="w-full transition duration-700 group-hover:scale-105"
                  />
                </div>
                <div>
                  <p className="flex flex-wrap items-center gap-3 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-gold-600">
                    {s.phase}
                    <span className="h-px w-8 bg-gold-500/50" />
                    <span className="font-mono normal-case tracking-normal text-brand-700/60">
                      {s.clock}
                    </span>
                  </p>
                  <h2 className="mt-2 font-display text-[1.5rem] font-semibold text-brand-900 sm:text-[1.75rem]">
                    {s.title}
                  </h2>
                  <p className="mt-2 max-w-2xl text-[0.92rem] leading-relaxed text-brand-700/80">
                    {s.standfirst}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-[0.74rem] font-bold uppercase tracking-[0.16em] text-gold-600">
                    Read this stage
                    <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </>
  );
}
