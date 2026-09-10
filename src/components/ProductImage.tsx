import ProductArt from "./art/ProductArt";
import type { Product } from "@/lib/catalog";

/**
 * An uploaded photo if the admin has set one, otherwise the generated art.
 * Every product surface goes through here so the two look interchangeable.
 */
export default function ProductImage({
  product,
  className = "",
  sizes = "(max-width: 640px) 50vw, 320px",
  priority,
}: {
  product: Pick<Product, "slug" | "name" | "art" | "hues" | "imageUrl" | "imageAlt">;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  if (product.imageUrl) {
    return (
      // Served from our own /api/media route, already immutable-cached, so the
      // Next image optimiser would only add a hop.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={product.imageUrl}
        alt={product.imageAlt || product.name}
        sizes={sizes}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className={`aspect-square object-cover ${className}`}
      />
    );
  }

  return (
    <ProductArt
      kind={product.art}
      hues={product.hues}
      seed={product.slug}
      className={className}
    />
  );
}
