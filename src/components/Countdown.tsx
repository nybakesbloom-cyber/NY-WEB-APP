"use client";

import { useSyncExternalStore } from "react";

const pad = (n: number) => String(n).padStart(2, "0");

/** Time left until today's 6 PM same-day cut-off (or tomorrow's, once it passes). */
function snapshot() {
  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setHours(18, 0, 0, 0);
  const rolled = cutoff.getTime() <= now.getTime();
  if (rolled) cutoff.setDate(cutoff.getDate() + 1);

  const ms = cutoff.getTime() - now.getTime();
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const sec = Math.floor((ms % 60_000) / 1000);

  // A string, so React compares by value and re-renders once per tick.
  return `${rolled ? "1" : "0"}|${pad(h)}:${pad(m)}:${pad(sec)}`;
}

function subscribe(onChange: () => void) {
  const id = window.setInterval(onChange, 1000);
  return () => window.clearInterval(id);
}

export default function Countdown({
  className = "",
  labels = {},
}: {
  className?: string;
  labels?: { cutoffLabel?: string; cutoffRolledLabel?: string };
}) {
  // The server's clock is not the shopper's, so it renders the static line and
  // the live one takes over after hydration.
  const value = useSyncExternalStore(subscribe, snapshot, () => null);

  if (!value) {
    return <span className={className}>Same-day &amp; midnight delivery</span>;
  }

  const [rolled, clock] = value.split("|");

  return (
    <span className={className}>
      {rolled === "1"
        ? labels.cutoffRolledLabel || "Next same-day slot in "
        : labels.cutoffLabel || "Same-day cut-off in "}
      <span className="font-mono font-bold tabular-nums text-gold-300">{clock}</span>
    </span>
  );
}
