import Link from "next/link";
import ProductArt from "@/components/art/ProductArt";

export default function NotFound() {
  return (
    <div className="wrap py-20 text-center">
      <div className="mx-auto w-44">
        <ProductArt kind="plant" hues={["#1C8560", "#C9A227"]} seed="not-found" className="w-full" />
      </div>
      <p className="eyebrow mt-6">404</p>
      <h1 className="mt-3 font-display text-[2.2rem] font-semibold text-brand-900">
        We don&apos;t make that one.
      </h1>
      <p className="mx-auto mt-3 max-w-md text-[0.92rem] leading-relaxed text-brand-700/70">
        The page you were after has moved or never existed. The catalogue is short enough to browse
        in a minute.
      </p>
      <Link href="/shop" className="btn btn-gold mt-7 px-7 py-3">
        Browse everything
      </Link>
    </div>
  );
}
