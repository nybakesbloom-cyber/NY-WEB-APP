"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from "@/components/Logo";

export default function AdminLoginPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsSetup, setNeedsSetup] = useState<boolean | null>(null);

  useEffect(() => {
    // Nothing synchronous here — the state is set after the request resolves.
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/auth/setup");
        const data = await res.json();
        if (!cancelled) setNeedsSetup(!!data.needsSetup);
      } catch {
        if (!cancelled) setNeedsSetup(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(needsSetup ? "/api/admin/auth/setup" : "/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: String(form.get("email") ?? ""),
          password: String(form.get("password") ?? ""),
          ...(needsSetup ? { name: String(form.get("name") ?? "") } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not sign in");
      router.replace("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in");
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-brand-900 px-5">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <Logo tone="dark" />
        </div>

        <form
          onSubmit={submit}
          className="rounded-2xl border border-gold-400/25 bg-white p-7 shadow-[0_30px_70px_-30px_rgba(0,0,0,0.7)]"
        >
          <h1 className="font-display text-2xl font-semibold text-brand-900">
            {needsSetup ? "Create the first account" : "Staff sign in"}
          </h1>
          <div className="gold-rule mt-3 w-16" />

          {needsSetup && (
            <p className="mt-4 text-[0.84rem] leading-relaxed text-brand-700/80">
              This database has no staff account yet. Whatever you enter here becomes the owner
              account — this form disappears the moment it exists.
            </p>
          )}

          {needsSetup && (
            <label className="mt-4 block">
              <span className="mb-1.5 block text-[0.78rem] font-semibold text-brand-800">Your name</span>
              <input name="name" autoComplete="name" placeholder="Store owner" className="field" />
            </label>
          )}

          <label className="mt-6 block">
            <span className="mb-1.5 block text-[0.78rem] font-semibold text-brand-800">Email</span>
            <input name="email" type="email" required autoComplete="username" className="field" />
          </label>

          <label className="mt-4 block">
            <span className="mb-1.5 block text-[0.78rem] font-semibold text-brand-800">Password</span>
            <input
              name="password"
              type="password"
              required
              minLength={needsSetup ? 10 : undefined}
              autoComplete={needsSetup ? "new-password" : "current-password"}
              className="field"
            />
            {needsSetup && (
              <span className="mt-1 block text-[0.72rem] text-brand-700/55">
                At least 10 characters. This is the only thing protecting your orders and billing.
              </span>
            )}
          </label>

          {error && (
            <p role="alert" className="mt-4 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-[0.82rem] text-red-800">
              {error}
            </p>
          )}

          <button type="submit" disabled={busy || needsSetup === null} className="btn btn-emerald mt-6 w-full py-3">
            {needsSetup === null
              ? "Checking…"
              : busy
                ? needsSetup
                  ? "Creating…"
                  : "Signing in…"
                : needsSetup
                  ? "Create account"
                  : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
