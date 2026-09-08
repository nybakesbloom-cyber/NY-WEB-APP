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

## Motion

Everything animated is CSS; there is no animation library.

- **Hero carousel** (`HeroCarousel.tsx`) — three slides on a 7s timer with a
  Ken Burns push on the artwork, crossfaded layers, a progress bar per dot, and
  arrows. It pauses on hover and on focus, and does not autoplay at all under
  `prefers-reduced-motion`.
- **Scroll reveal** (`Reveal.tsx`) — the hidden state lives in CSS on
  `[data-reveal]`, so server HTML paints correctly and an IntersectionObserver
  only ever adds `data-shown`. Directions: `up`, `left`, `right`, `zoom`, with a
  `delay` for staggering a row.
- **Flowing image ribbons** (`FlowStrip.tsx`) — two rows of product art drifting
  in opposite directions. The track holds the list twice and translates exactly
  `-50%`, so the loop is seamless; hovering pauses it and the edges are masked.
- **Product carousels** (`Carousel.tsx`) — native overflow scrolling with CSS
  scroll snap, so it drags on touch and keeps keyboard behaviour. The arrows
  disable themselves at each end.
- **Mini cart** (`CartDrawer.tsx`) — slide-over with a free-delivery progress
  bar, closes on Escape and locks body scroll. Adding from anywhere raises a
  toast (`CartToast.tsx`) rather than navigating away.
- **Chrome** — a gold scroll-progress hairline, a header that shrinks and casts
  a shadow once you scroll, a live countdown to the 6 PM same-day cut-off, and a
  pointer-tracking zoom on the product gallery.

Every one of these is switched off by the `prefers-reduced-motion` block at the
bottom of `globals.css`.

Two layout rules that are easy to break by accident:

- `.rail` is **flex, not `grid-auto-flow: column`**. Auto-sized grid columns give
  a percentage width no containing block to resolve against and the cards
  collapse to a sliver.
- The mobile buy bar is **portalled to `<body>`**. A transformed ancestor — which
  is what `Reveal` is while it animates — becomes the containing block for
  `position: fixed` descendants, and the bar lands halfway down the page.

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

**Cart** — `src/components/CartProvider.tsx`, React context over `localStorage`,
also holding the drawer and toast state.
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
