# Felicet Bloom

A cakes-and-flowers storefront in emerald and gold, in the shape of FlowerAura /
Bakingo / Black Tulip — category and occasion browsing, a product page with
weight, flavour and gift-message options, a persisted cart, and a full checkout.

```bash
npm run dev     # http://localhost:3000
npm run build
npm run lint
```

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4.

## Routes

| Route | What it does |
| --- | --- |
| `/` | Hero, categories, promises, bestsellers, occasions, cake and flower rails, reviews, reminder CTA |
| `/shop` | Filter by `category`, `occasion` and `max` price; sort; free-text `q` search |
| `/product/[slug]` | Gallery, weight/size, flavour, 40-char gift message, quantity, add-to-cart and buy-now |
| `/cart` | Line editing, free delivery threshold, order summary |
| `/checkout` | Sender, recipient, address, date, delivery slot, payment method, live totals |
| `/order-confirmed` | Order number and a four-step delivery timeline |

## How it is put together

**No image files.** Every product picture is generated SVG —
`src/components/art/ProductArt.tsx` draws six kinds (`cake`, `bouquet`,
`basket`, `combo`, `plant`, `hamper`) from a two-colour pair and a seed. The
catalogue renders identically offline, nothing 404s, and a new product needs
only a hue pair rather than a photo shoot.

Two things about that file are deliberate and easy to undo by accident:

- Randomness comes from a **precomputed array**, not a generator closure. React
  renders these twice under Strict Mode; a generator would hand the second pass
  different numbers than the server used, which is a hydration mismatch.
- `hues[0]` colours the subject and `hues[1]` only tints the backdrop, which is
  washed towards white. Putting a pale tone in slot 0 is how you get white
  lilies; putting a dark one there gives you dark green ones.

**Catalogue** — `src/lib/catalog.ts` holds 24 products, 5 categories and 8
occasions, plus `filterProducts()` and the delivery slots. It is the only place
to edit to change what the shop sells.

**Cart** — `src/components/CartProvider.tsx`, React context over `localStorage`.
The server has no cart, so the first client render deliberately shows an empty
one and reveals storage on the next pass (via `useSyncExternalStore`); that gate
is what keeps hydration clean. Lines are keyed by slug + variant + flavour +
message, so the same cake with two different messages is two lines.

**Theme** — all colour lives in `@theme` in `src/app/globals.css` as
`brand-*` (emerald) and `gold-*`, alongside the `.btn`, `.card`, `.field` and
`.gold-rule` component classes. Change the palette there, not in the components.

## Not wired up

It is a storefront, not a service: no backend, no payments, no auth. Checkout
validates, computes real totals and then routes to a confirmation page without
sending anything. The reminder form on the home page is inert. Prices, reviews
and delivery claims are fixture data.
