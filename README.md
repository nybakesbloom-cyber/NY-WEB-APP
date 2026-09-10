# NY Bakes and Bloom

A cakes-and-flowers storefront in emerald and gold, in the shape of FlowerAura /
Bakingo / Black Tulip — category and occasion browsing, a product page with
weight, flavour and gift-message options, a persisted cart, and a full checkout.

```bash
cp .env.example .env.local     # fill in MONGODB_URI and ADMIN_SESSION_SECRET
npm run seed                   # catalogue, site copy and the first admin
npm run dev                    # http://localhost:3000
npm run build
npm run lint
```

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · MongoDB via
Mongoose.

### MongoDB

Any MongoDB will do — Atlas, or a local server. There is no Homebrew on the
development Mac, so local Mongo is the official tarball rather than a package:

```bash
curl -sL -o /tmp/mongodb.tgz https://fastdl.mongodb.org/osx/mongodb-macos-arm64-8.0.30.tgz
mkdir -p ~/.local/mongodb ~/.local/mongodb-data ~/.local/mongodb-logs
tar -xzf /tmp/mongodb.tgz -C ~/.local/mongodb --strip-components=1
~/.local/mongodb/bin/mongod --dbpath ~/.local/mongodb-data \
  --logpath ~/.local/mongodb-logs/mongod.log --bind_ip 127.0.0.1 --fork
```

`npm run seed` is safe to re-run: it upserts by slug and key and leaves existing
rows alone. `-- --force` overwrites them, `-- --demo-orders` adds a few orders
to work with.

## Admin panel

`/admin`, behind an email and password. Signed out, `/admin/*` redirects to the
login and every `/api/admin/*` route answers 401.

| Page | What it does |
| --- | --- |
| `/admin` | Open orders, money collected, the pipeline, most-ordered, latest orders |
| `/admin/orders` | Filter by status, search by order number, name, phone or city |
| `/admin/orders/[id]` | Line items, fees, addresses, payments, kitchen note, full audit history, and the status controls |
| `/admin/billing` | Every charge and refund, running totals, and a form to record either |
| `/admin/products` | The catalogue; create, edit, archive |
| `/admin/products/[id]` | Price, weight options, copy, occasions, flags, and the photo |
| `/admin/content` | The nine blocks of site copy |
| `/admin/media` | Upload and manage photography |
| `/admin/import` | Load the starter catalogue, import products from a file, export the catalogue |

**Order processing** is a state machine, not a free-text field. `placed →
in_kitchen → packed → out_for_delivery → delivered`, with `cancelled` available
until it ships. The API refuses anything else — a jump from `placed` straight to
`delivered` comes back 422 — and every move is appended to the order's history
with who made it.

**Billing** records charges and refunds against an order. A refund is checked
against what has actually been collected, so you cannot refund more than was
paid.

**Products** drive the shop directly. Edit a price and the shop page shows it.
Attach an uploaded photo and it replaces the generated artwork on every surface;
remove it and the artwork comes back. Deleting is a soft archive, because orders
reference products by slug and history must not break.

**Images** are stored in MongoDB as a Buffer on the document and served from
`/api/media/[id]` with an immutable cache header. That keeps the whole app to one
dependency — no S3, no Cloudinary, nothing to configure before an upload works.
Product photography sits well under Mongo's 16 MB document limit; the upload cap
is 5 MB.

**Adding a staff account by hand.** Passwords are stored as a bcrypt hash, so a
document typed straight into Atlas will never sign in. `npm run make-admin`
prints a ready-to-paste document with the hash already computed:

```bash
read -rs "?Password: " ADMIN_PASSWORD; echo
ADMIN_EMAIL=you@shop.com ADMIN_PASSWORD="$ADMIN_PASSWORD" npm run make-admin
```

It talks to nothing — no database, no network — it only prints. Paste the JSON
into Atlas → Browse Collections → `adminusers` → Insert Document, or use the
`mongosh` line it also prints. The hash is salted, so the same password yields a
different string each run; that is expected.

**Getting data in without a terminal.** A fresh database has no staff account,
so `/admin/login` offers to create the first one — and refuses the moment any
account exists, so it closes itself permanently after one use. From there,
**Import & export → Add what is missing** writes the same 24 products and 9
content blocks the CLI seed writes. `npm run seed` remains available; it is no
longer the only way.

**Importing your own catalogue.** Upload a CSV or JSON file of products. Every
row is validated before anything is written and a file with any bad row is
rejected whole — a half-imported catalogue is worse than a rejected file. Rows
match on `slug`, so exporting, editing in a spreadsheet and importing back
updates rather than duplicates. Lists use `|` between values and weight options
are `label:extra`, so `500 g:0|1 kg:550` means a kilo costs ₹550 more.

**Site content** is nine editable blocks: `announcements`, `hero`, `promises`,
`reviews`, `categories`, `occasions`, `process`, `footer`, `settings`. Saving one
calls `revalidatePath` so the public pages pick it up straight away. Flat string
lists get a line-per-item editor; the rest are edited as JSON, which is honest
about what they are rather than pretending a generated form covers every shape.

## Routes

| Route | What it does |
| --- | --- |
| `/` | Hero, categories, promises, bestsellers, occasions, cake and flower rails, reviews, reminder CTA |
| `/shop` | Filter by `category`, `occasion` and `max` price; sort; free-text `q` search |
| `/product/[slug]` | Gallery, weight/size, flavour, 40-char gift message, quantity, add-to-cart and buy-now |
| `/cart` | Line editing, free delivery threshold, order summary |
| `/checkout` | Sender, recipient, address, date, delivery slot, payment method, live totals |
| `/order-confirmed` | Order number and a four-step delivery timeline |
| `/how-it-works` | The five production stages, each linking to its own page |
| `/how-it-works/[step]` | One stage in full: what happens, the numbers, what goes wrong |

Public API: `POST /api/checkout` places an order, `GET /api/media/[id]` serves an
image. **Checkout prices the order on the server** from the database — the browser
sends slugs and quantities and nothing else, so a tampered cart cannot change what
is charged.

## Motion

Everything animated is CSS; there is no animation library.

- **Cinematic hero** (`HeroStory.tsx`) — the hero is a pinned title sequence you
  scrub by scrolling. One number, `--p`, drives all of it in CSS: letterbox bars
  close and retract, colour washes cross-fade dawn → kitchen → gold → night, the
  headline builds a line at a time, four artwork frames cross-cut, a slow camera
  push runs the whole length, stars and a skyline rise for the night beat, a
  rider crosses the rooftops, and petals drift at their own parallax rates. Five
  timestamped chapters (05:00 → 23:52) with a rail along the bottom.

  At rest (`p = 0`) it is a complete, conventional hero — eyebrow, first line,
  caption, artwork and both CTAs are already resolved, so a visitor who never
  scrolls is not looking at an empty stage. There is a "Skip intro" jump to the
  catalogue, and under `prefers-reduced-motion` it renders as a static hero with
  no pinning.
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
- **Pinned process scrub** (`ProcessScroll.tsx`) — the home page's `How it is
  actually made` section. A tall track holds a `sticky` full-height stage;
  scrolling through the track writes `--p` (0 → 1) onto the stage, which drives
  the rail fill and the travelling marker purely in CSS, while React advances the
  phase copy and artwork. Each of the five phases links to its own detail page.
  The track is one viewport of scrolling per phase on desktop and three quarters
  on a phone (`.process-track`). Under `prefers-reduced-motion` it renders as a
  plain stacked list instead of pinning.
- **Chrome** — a gold scroll-progress hairline, a header that shrinks and casts
  a shadow once you scroll, a live countdown to the 6 PM same-day cut-off, and a
  pointer-tracking zoom on the product gallery.

Every one of these is switched off by the `prefers-reduced-motion` block at the
bottom of `globals.css`.

Two layout rules that are easy to break by accident:

- `.rail` is **flex, not `grid-auto-flow: column`**. Auto-sized grid columns give
  a percentage width no containing block to resolve against and the cards
  collapse to a sliver.
- The scrub primitives are three CSS classes — `.cue` (enters once), `.beat`
  (enters at `--a`, leaves at `--b`) and `.wash` (opacity only) — plus `.par`
  and `.camera`. Each reads the inherited `--p`, so a whole sequence is authored
  by setting plain numbers inline and nothing re-renders.
- Letterbox bars crop the frame, so stage content is inset by the bar height;
  content that is not will be covered at the bottom.
- `--p` is registered with `@property` as a `<number>` so the browser treats it
  as a real value rather than a token, and `calc()` on it stays cheap.
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

**Process content** — `src/lib/process.ts` holds the five stages: the standfirst
used in the pinned stage, plus the intro, sections, numbers and the honest
"what goes wrong here" paragraph used on each detail page. The five scene
illustrations live in `src/components/art/ProcessScene.tsx`, same approach as the
product art — generated SVG, no photography.

**Where the data lives** — `src/lib/catalog.ts` is types and pure helpers only.
Products, categories, occasions and copy are in MongoDB. Server components read
them through `src/server/queries.ts`; the client gets one snapshot from
`<StoreProvider>`, mounted in the `(shop)` layout, so the cart and drawer can
resolve a slug without another round trip. `scripts/seed-data.ts` is the original
static catalogue, kept only as seed input.

**Two module boundaries that matter**

- Order vocabulary (`ORDER_STATUSES`, `NEXT_STATUS`, `STATUS_LABEL`) lives in
  `src/lib/orders.ts`, not in the Mongoose model. Importing the model from a
  client component drags mongoose — and Node builtins like `async_hooks`, `dns`
  and `child_process` — into the browser bundle and the build fails.
- `serverExternalPackages: ["mongoose"]` in `next.config.ts` keeps it out of the
  bundler on the server side too.

**Route groups** — `(shop)` carries the storefront chrome (header, footer, cart
drawer, catalogue snapshot); `/admin` deliberately sits outside it so the admin
does not inherit any of that. The root layout is only html, body and fonts.

**Old catalogue note** — `src/lib/catalog.ts` no longer holds 24 products, 5 categories and 8
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

## Deploying

Set two environment variables on the host — the build does not need them, but
every request does:

| Variable | Notes |
| --- | --- |
| `MONGODB_URI` | Must be reachable from the server. A local `127.0.0.1` mongod is not, so use Atlas (or another hosted MongoDB) in production. |
| `ADMIN_SESSION_SECRET` | Any long random string. `openssl rand -base64 36`. Do not reuse the development one. |

`ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD` are only read by `npm run seed`, which
you run once against the production database from your own machine.

**The storefront renders per request** (`export const dynamic = "force-dynamic"`
in the `(shop)` layout). Two reasons, both deliberate:

- `next build` never touches MongoDB, so a deploy cannot fail because the
  database was unreachable from the build machine.
- The catalogue is edited live in the admin. Prerendering product pages at build
  time meant a price change did not appear until the next deploy.

If you later want the speed back, add ISR (`export const revalidate`) plus a
`revalidatePath` call in the product write routes — do not reintroduce
`generateStaticParams` over the database.

### Diagnosing a deployment

`GET /api/health` reports whether the running deployment can reach its database.
Next hides server errors behind a digest in production, so without it a
misconfigured `MONGODB_URI` is just an opaque 500.

It never echoes credentials — only the host, the database name, the driver's
error code and what to do about it:

```json
{ "ok": false,
  "database": { "host": "cluster0.xxxx.mongodb.net", "state": "failed" },
  "problem": "bad auth : Authentication failed.",
  "code": 8000,
  "fix": "The username or password in MONGODB_URI is wrong…" }
```

`"ok": true` means connected *and* seeded; it reports counts so an empty
database is distinguishable from a broken connection.

## Not wired up

- **No payment gateway.** Checkout creates a real order and a transaction, but
  nothing is charged; a card payment is recorded as captured and cash on delivery
  as pending.
- **No email or SMS.** The receipt, the dispatch message and the handover photo
  described in the copy do not send.
- **No customer accounts.** Only staff sign in.
- Prices, reviews and delivery claims are fixture data until you edit them.
