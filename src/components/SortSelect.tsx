"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const OPTIONS = [
  { value: "popular", label: "Most popular" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Highest rated" },
];

export default function SortSelect({ value }: { value: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function change(next: string) {
    const sp = new URLSearchParams(params.toString());
    if (next === "popular") sp.delete("sort");
    else sp.set("sort", next);
    router.push(`${pathname}?${sp.toString()}`);
  }

  return (
    <label className="flex items-center gap-2 text-sm text-brand-700">
      <span className="hidden sm:inline">Sort</span>
      <select
        value={value}
        onChange={(e) => change(e.target.value)}
        className="field w-auto cursor-pointer py-2 pr-8 text-sm font-medium"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
