"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import Logo from "@/components/Logo";
import type { Session } from "@/server/session";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: "grid", exact: true },
  { href: "/admin/orders", label: "Orders", icon: "box" },
  { href: "/admin/billing", label: "Billing", icon: "rupee" },
  { href: "/admin/products", label: "Products", icon: "tag" },
  { href: "/admin/content", label: "Site content", icon: "text" },
  { href: "/admin/media", label: "Images", icon: "image" },
  { href: "/admin/import", label: "Import & export", icon: "upload" },
];

function Icon({ name }: { name: string }) {
  const p = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0" {...p}>
      {name === "grid" && <><rect x="3.5" y="3.5" width="7" height="7" rx="1.6" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.6" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.6" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.6" /></>}
      {name === "box" && <><path d="M3.5 8 12 4l8.5 4v8L12 20l-8.5-4V8Z" /><path d="M3.5 8 12 12l8.5-4M12 12v8" /></>}
      {name === "rupee" && <><path d="M7 4h10M7 8.5h10M16 4c0 4-3.2 4.5-6 4.5h-.5L16 20" /></>}
      {name === "tag" && <><path d="M4 11.6V4.5h7.1L20 13.4 13.4 20 4 11.6Z" /><circle cx="8.3" cy="8.3" r="1.4" /></>}
      {name === "text" && <><path d="M4 6h16M4 11h16M4 16h10" /></>}
      {name === "image" && <><rect x="3.5" y="4.5" width="17" height="15" rx="2.4" /><circle cx="8.6" cy="9.6" r="1.8" /><path d="m4 16 4.6-4.2L20 19" /></>}
      {name === "upload" && <><path d="M4 15v3.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V15" /><path d="M12 4v11M8 8l4-4 4 4" /></>}
    </svg>
  );
}

export default function AdminShell({
  session,
  children,
}: {
  session: Session;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function signOut() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <div className="lg:grid lg:min-h-screen lg:grid-cols-[268px_1fr]">
      <aside
        className={`z-40 flex flex-col bg-brand-900 lg:sticky lg:top-0 lg:h-screen ${
          open ? "" : "max-lg:hidden"
        }`}
      >
        <div className="border-b border-gold-400/15 px-4 py-4">
          <Link href="/admin" className="block">
            <Logo tone="dark" />
          </Link>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {NAV.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[0.88rem] font-medium transition ${
                  active
                    ? "bg-gold-500 text-brand-900"
                    : "text-gold-100/70 hover:bg-brand-800 hover:text-gold-100"
                }`}
              >
                <Icon name={item.icon} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-gold-400/15 p-4">
          <p className="truncate text-[0.78rem] font-semibold text-gold-100">{session.name}</p>
          <p className="truncate text-[0.7rem] text-gold-100/50">{session.email}</p>
          <span className="mt-1.5 inline-block rounded-full bg-brand-800 px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-wider text-gold-300">
            {session.role}
          </span>
          <div className="mt-3 flex gap-2">
            <Link
              href="/"
              className="flex-1 rounded-lg border border-gold-400/30 px-2 py-1.5 text-center text-[0.72rem] font-semibold text-gold-200 hover:bg-brand-800"
            >
              View shop
            </Link>
            <button
              onClick={signOut}
              className="flex-1 rounded-lg border border-gold-400/30 px-2 py-1.5 text-[0.72rem] font-semibold text-gold-200 hover:bg-brand-800"
            >
              Sign out
            </button>
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <div className="flex items-center gap-3 border-b border-brand-900/10 bg-white px-4 py-3 lg:hidden">
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={open}
            className="rounded-lg p-2 text-brand-800"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" stroke="currentColor" strokeWidth="1.9" fill="none">
              <path d={open ? "M6 6l12 12M18 6L6 18" : "M4 7h16M4 12h16M4 17h16"} strokeLinecap="round" />
            </svg>
          </button>
          <Logo />
        </div>

        <main className="p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
