# Femi

A production-shaped e-commerce storefront for **Femi** menstrual-care products —
built with Next.js, TypeScript and Tailwind, with a WebGL product experience,
authenticated checkout, WhatsApp order coordination and an admin dashboard.

It runs with **zero configuration**: clone, `npm install`, `npm run dev`, and you
have a working store with sample products, a cart, sign-up, checkout and an
admin panel. Add Supabase credentials when you are ready for a real database.

---

## Contents

1. [What is built](#what-is-built)
2. [Technology choices](#technology-choices)
3. [Project structure](#project-structure)
4. [Running locally](#running-locally)
5. [Environment variables](#environment-variables)
6. [Database schema](#database-schema)
7. [Connecting Supabase](#connecting-supabase)
8. [Changing the WhatsApp number](#changing-the-whatsapp-number)
9. [Deploying](#deploying)
10. [Adding payments later](#adding-payments-later)
11. [Security](#security)
12. [Product data](#product-data)

---

## What is built

**Storefront**
- Homepage with a WebGL hero, featured products, categories, benefits, an
  explanation of how ordering works, testimonials and an FAQ
- Product listing with search, category filter, price filter, five sort orders
  and a bottom-sheet filter drawer on mobile
- Product pages with an interactive 3D pack you can spin, quantity selector,
  bulk-price hints, full product information and delivery information
- Cart with quantity controls, server-calculated subtotal, delivery charge and
  total, plus a free-delivery progress hint

**Accounts**
- Sign up, sign in with password *or* a 6-digit email OTP, sign out
- Forgot-password flow (reset code → new password)
- Profile editing, password change, and a saved-address book

**Checkout**
- **Requires authentication** — signed-out visitors are redirected to sign in and
  returned to checkout afterwards
- Customer details, delivery address (with saved-address picker), order summary
- "Place order via WhatsApp" opens a click-to-chat message containing a generated
  order ID, the itemised order, subtotal, delivery, total and the delivery address
- Order confirmation page with a status trail, reachable again from the account

**Admin** (`/admin`, admin role only)
- Overview: order counts by status, confirmed revenue, low-stock list
- Products: create, edit, delete, change price and stock, show/hide from the store
- Orders: search and filter, full customer details, status flow
  (pending → confirmed → packed → shipped → delivered / cancelled) and a
  Delhivery tracking ID field

**Everything else**
- Mobile-first: sticky bottom tab bar, thumb-reachable controls, 16px inputs
  (no iOS zoom-on-focus), safe-area padding
- Loading skeletons, empty states, inline field errors, toast notifications
- Accessible focus rings, live regions, labelled controls, AA contrast
- `prefers-reduced-motion` respected everywhere, including the 3D scenes
- Policy pages, `robots.txt` and a generated sitemap

### The 3D

Three.js, no wrapper libraries, loaded on demand:

- **Hero** (`src/components/three/heroScene.ts`) — three Femi packs drifting over
  soft blush spheres, lit like a product shoot, with pointer parallax. The scene
  reframes itself for the container's aspect ratio, so the packs stay in shot on
  a phone as well as a desktop.
- **Product page** (`src/components/three/packScene.ts`) — a single pack you can
  drag to spin, with inertia, that idles on a slow auto-rotate.
- **The packaging artwork is generated, not photographed**
  (`src/components/three/packTexture.ts`). Each face is drawn onto a canvas from
  the product's own colours, size, length and pad count, then used as a texture.
  Add a product in the admin panel and it gets correct artwork automatically —
  no image assets to manage, and nothing extra to download.

Scenes only mount when they scroll near the viewport, pause when scrolled away,
render a single frame when motion is reduced, and fall back to flat SVG pack
artwork when WebGL is unavailable.

---

## Technology choices

| Layer | Choice | Why |
| --- | --- | --- |
| Framework | **Next.js 15** (App Router) | Server Components keep prices, roles and order data on the server; route handlers give a real API surface in the same codebase. |
| Language | **TypeScript** | Order, product and pricing shapes are the part worth type-checking. |
| Styling | **Tailwind CSS v4** | Design tokens live in `globals.css` under `@theme`, so the palette and radii are declared once. |
| 3D | **Three.js** (direct) | The scenes are small and specific; a renderer wrapper would add bundle weight without saving code. |
| Data / auth | **Supabase** (optional) + a built-in file store | Postgres gives real constraints and row-level security. The file store means the site runs the moment you clone it. |

Both backends sit behind one `Store` interface (`src/lib/db/types.ts`), and all
authentication goes through one service (`src/lib/auth/service.ts`), so no page
or component knows which backend is active.

---

## Project structure

```
femi/
├── src/
│   ├── app/
│   │   ├── page.tsx                     Homepage
│   │   ├── layout.tsx                   Root layout, fonts, providers, chrome
│   │   ├── globals.css                  Design tokens + base styles
│   │   ├── loading.tsx  not-found.tsx
│   │   ├── robots.ts    sitemap.ts
│   │   ├── products/
│   │   │   ├── page.tsx                 Listing (search / filter / sort)
│   │   │   └── [slug]/page.tsx          Product detail + 3D viewer
│   │   ├── cart/page.tsx
│   │   ├── checkout/page.tsx            Auth-gated
│   │   ├── order/[reference]/page.tsx   Confirmation + status trail
│   │   ├── login/  signup/  forgot-password/  reset-password/
│   │   ├── account/
│   │   │   ├── page.tsx                 Profile, addresses, recent orders
│   │   │   └── orders/page.tsx
│   │   ├── policies/[slug]/page.tsx     Shipping, returns, privacy, terms
│   │   ├── admin/
│   │   │   ├── layout.tsx               Role gate
│   │   │   ├── page.tsx                 Overview
│   │   │   ├── products/page.tsx
│   │   │   └── orders/page.tsx
│   │   └── api/
│   │       ├── auth/                    signup, login, logout, me,
│   │       │                            otp/request, otp/verify,
│   │       │                            password/reset, password/update
│   │       ├── products/                Public catalogue
│   │       ├── cart/price/              Server-side cart pricing
│   │       ├── orders/                  Create + read own orders
│   │       ├── account/addresses/
│   │       └── admin/                   products, orders (admin only)
│   ├── components/
│   │   ├── three/                       heroScene, packScene, packMesh,
│   │   │                                packTexture, React wrappers
│   │   ├── product/                     Card, browser, purchase panel, SVG pack
│   │   ├── cart/  checkout/  order/     Cart view, summary, checkout, status
│   │   ├── account/  admin/  auth/      Dashboards and forms
│   │   ├── home/                        Hero, benefits, FAQ, testimonials …
│   │   ├── layout/                      Navbar, mobile tab bar, footer, logo
│   │   ├── providers/                   Cart, auth, toast context
│   │   └── ui/                          Button, Field, Badge, EmptyState …
│   ├── lib/
│   │   ├── site.ts                      Brand config: WhatsApp number, email, courier
│   │   ├── catalog.ts                   Sample products (source of truth without a DB)
│   │   ├── pricing.ts                   Server-side pricing — the only place money is computed
│   │   ├── orders.ts                    Order creation, stock checks, reference generation
│   │   ├── whatsapp.ts                  Click-to-chat message + URL building
│   │   ├── validation.ts                Sanitisation + validation
│   │   ├── rate-limit.ts   api.ts       Limiter and route-handler helpers
│   │   ├── format.ts       types.ts
│   │   ├── auth/                        password, session, otp, service, current-user
│   │   ├── db/                          Store interface, file store, Supabase store
│   │   └── supabase/                    Clients and configuration
│   └── middleware.ts                    Session refresh + signed-out redirects
├── supabase/
│   ├── schema.sql                       Tables, triggers, functions, RLS policies
│   └── seed.sql                         The sample catalogue
├── docs/
│   ├── SECURITY.md
│   └── INTEGRATIONS.md                  Supabase, OTP delivery, payments, Delhivery
├── .env.example
└── next.config.ts                       Security headers
```

---

## Running locally

Requirements: **Node.js 20 or newer**.

```bash
git clone https://github.com/nagachaitanyanagachaitanya695-dot/femi.git
cd femi
npm install
cp .env.example .env.local     # optional for local development
npm run dev
```

Open <http://localhost:3000>.

With no `.env.local` at all it still works: sample products are served from
`src/lib/catalog.ts`, and accounts, addresses and orders are written to a
git-ignored `.data/femi-db.json`.

### Try the whole flow

1. Add a couple of packs to the cart and hit **Buy now** — you are sent to sign in.
2. Create an account, and you land back on checkout.
3. Fill in an address and press **Place order via WhatsApp**. A WhatsApp tab
   opens with the full order message; you land on the confirmation page.
4. To see the admin panel, set `FEMI_ADMIN_EMAILS=your@email` in `.env.local`,
   restart, sign in again and open <http://localhost:3000/admin>.

**Signing in with an email OTP:** in development the 6-digit code comes back in
the API response and is shown under the input. In production it is only written
to the server log until you connect an email provider — see
[docs/INTEGRATIONS.md](docs/INTEGRATIONS.md).

### Scripts

```bash
npm run dev      # development server
npm run build    # production build
npm run start    # serve the production build
npm run lint     # eslint
```

---

## Environment variables

Everything is optional in development. `NEXT_PUBLIC_*` values are compiled into
the browser bundle and are public — never put a secret behind that prefix.

| Variable | Required | Purpose |
| --- | --- | --- |
| `AUTH_SECRET` | **in production** | Signs the session cookie. 32+ random characters (`openssl rand -base64 48`). The app refuses to issue production sessions without it. |
| `NEXT_PUBLIC_SITE_URL` | recommended | Canonical URL for metadata, sitemap and password-reset links. |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | no | Business number, digits only, with country code. Defaults to `919676877257`. |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | no | Shown in the footer and policies. Defaults to `zubimoosa0813@gmail.com`. |
| `FEMI_ADMIN_EMAILS` | no | Comma-separated emails granted the admin role at sign-in. Read from the server environment only. |
| `NEXT_PUBLIC_SUPABASE_URL` | with Supabase | Project URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | with Supabase | Publishable key. |
| `SUPABASE_SERVICE_ROLE_KEY` | with Supabase | **Server only.** Bypasses row-level security. |
| `FEMI_DATA_DIR` | no | Where the local JSON store is written. Defaults to `./.data`. |

---

## Database schema

Full DDL with constraints, triggers and row-level security is in
[`supabase/schema.sql`](supabase/schema.sql); the sample catalogue is in
[`supabase/seed.sql`](supabase/seed.sql).

**`profiles`** — one row per auth user, created by a trigger on sign-up.
`id` (FK to `auth.users`), `email`, `full_name`, `mobile`,
`role` (`customer` | `admin`), timestamps.

**`products`** — `id`, `slug` (unique), `name`, `short`, `description`,
`category`, `pad_count`, `length`, `size`, `packs`, `mrp`, `price`,
`bulk_price`, `bulk_min_qty`, `features[]`, `popularity`, `rating`,
`review_count`, `stock`, `active`, `badge`, `theme` (jsonb pack colours).
Constraints enforce `price <= mrp`, `bulk_price <= price` and `stock >= 0`.

**`addresses`** — `id`, `user_id`, `label`, `full_name`, `mobile`, `line1`,
`line2`, `city`, `state`, `pincode`, `is_default`. Mobile and PIN code are
regex-checked in the database as well as in the app.

**`orders`** — `id`, `reference` (the human-readable `FEMI-XXXXXX`), `user_id`,
`status`, `customer_name`, `mobile`, `email`, `address` (jsonb),
`notes`, `lines` (jsonb), `totals` (jsonb), `courier`, `tracking_id`,
timestamps. Lines and totals are stored as a snapshot, so an order remains an
accurate record of what was priced even if the product is later edited.

**Row-level security** is on for all four tables: the public may read active
products and nothing else; customers may read and write only their own
addresses and read only their own orders; only admins may write products or
change an order; and a restrictive policy prevents a customer from changing
their own `role`.

Helper functions: `handle_new_user()` (profile trigger), `is_admin()`,
`decrement_stock()`, `touch_updated_at()`.

---

## Connecting Supabase

Short version:

1. Create a project, run `supabase/schema.sql` then `supabase/seed.sql` in the
   SQL editor.
2. Copy the project URL, `anon` key and `service_role` key into your environment.
3. Restart. The app switches over automatically — `getStore()` returns the
   Supabase store, and `/api/auth/*` starts delegating to Supabase Auth.
4. Make yourself an admin:
   `update public.profiles set role = 'admin' where email = 'you@example.com';`

Full walkthrough, including the auth redirect URLs to configure and how the
Firebase alternative would differ: [docs/INTEGRATIONS.md](docs/INTEGRATIONS.md).

---

## Changing the WhatsApp number

One place: `src/lib/site.ts`.

```ts
whatsappNumber: (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "919676877257")
```

Set `NEXT_PUBLIC_WHATSAPP_NUMBER` in your environment, or edit that fallback.
Use the international format: country code + number, digits only, no `+` or
spaces. India `96768 77257` → `919676877257`.

The checkout button, order confirmation page, footer and every "chat with us"
link read from that single value.

### The order message

Generated server-side in `src/lib/whatsapp.ts` from the stored order — the
customer cannot send a message that disagrees with what was recorded:

```
Hello Femi, I would like to place an order.

Order ID: FEMI-0WNREH

Products:
- Femi XL Night Pads — 5 Pads x 5 — ₹995
- Femi Combo Pack — 24 Pads x 1 — ₹549

Subtotal: ₹1,544
Delivery: ₹0
Total: ₹1,544

Customer Name: …
Mobile: …
Email: …
Delivery Address: …
PIN Code: …

Please confirm my order and payment details.
```

It is percent-encoded into a `https://wa.me/<number>?text=…` link and opened in
a new tab. **Opening WhatsApp is not a payment**, and nothing in the code treats
it as one: the order is stored as `pending` and stays there until an admin
confirms it.

---

## Deploying

### Vercel (simplest)

1. Push to GitHub.
2. Import the repository at [vercel.com/new](https://vercel.com/new). Next.js is
   detected automatically — no build settings to change.
3. Add environment variables under **Settings → Environment Variables**: at
   minimum `AUTH_SECRET` and `NEXT_PUBLIC_SITE_URL`, plus the Supabase keys.
4. Deploy, then add your custom domain.

### Anywhere that runs Node

```bash
npm ci
npm run build
npm run start        # listens on $PORT, default 3000
```

Put it behind a reverse proxy that terminates TLS. Works as-is on Railway,
Render, Fly.io or a plain VPS with `pm2`/systemd.

### Before you go live

- Set `AUTH_SECRET` and `NEXT_PUBLIC_SITE_URL`.
- **Connect Supabase.** The file store keeps data on local disk — on a
  serverless host that disk is wiped between deploys, so orders would be lost.
- Connect an email provider so OTP and reset codes actually arrive.
- Read [docs/SECURITY.md](docs/SECURITY.md) — particularly the notes on adding a
  Content-Security-Policy and moving rate limiting to shared storage.

---

## Adding payments later

The order model is already shaped for it: a stable `id`, a human-readable
`reference`, server-validated `totals`, and a status flow a webhook can advance.

The rule that matters: **create the payment from the stored order, never from
the request body.** Step-by-step Razorpay instructions are in
[docs/INTEGRATIONS.md](docs/INTEGRATIONS.md).

---

## Security

Highlights — the full write-up is in [docs/SECURITY.md](docs/SECURITY.md):

- **Prices are computed on the server.** `/api/orders` accepts only product ids
  and quantities; every price, discount, delivery fee and total is recomputed
  from the catalogue. The cart displays server-computed totals for the same
  reason. Posting a fake price changes nothing.
- **Passwords are never stored in readable form** — scrypt with a per-user salt,
  or Supabase Auth, which means this app never sees a password at all.
- **OTPs are hashed, salted with the email, single-use**, expire in 10 minutes
  and lock out after five wrong attempts.
- **Sessions are http-only, SameSite=Lax, HMAC-signed cookies** that JavaScript
  cannot read.
- **Admin routes are checked server-side on every request** — the role comes
  from the database, never from the request. The UI check is convenience only.
- **Customers can read only their own orders**; anyone else gets a 404, so order
  references cannot be enumerated.
- **Input is sanitised and validated server-side**, with rate limiting on
  sign-up, sign-in, OTP, password reset and order creation.
- **Row-level security** on every Supabase table, including a policy that stops a
  customer promoting themselves to admin.
- **Security headers** in `next.config.ts`; `/api/*` is `no-store`.

---

## Product data

The sample catalogue in `src/lib/catalog.ts` matches the real Femi packs:

| Product | Size | Length | Pads | MRP | Price |
| --- | --- | --- | ---: | ---: | ---: |
| Ultra Soft Pads — 10 Pads | XL | 320mm | 10 | ₹229 | ₹189 |
| Ultra Soft Pads — 20 Pads | XL | 320mm | 20 | ₹458 | ₹359 |
| Ultra Soft Pads — 9 Pads | L | 290mm | 9 | ₹199 | ₹169 |
| XL Night Pads — 5 Pads | XXL | 410mm | 5 | ₹249 | ₹209 |
| XL Night Pads — 10 Pads | XXL | 410mm | 10 | ₹498 | ₹399 |
| XL Night Pads — 20 Pads | XXL | 410mm | 20 | ₹996 | ₹769 |
| Combo Pack — 24 Pads | L + XL + XXL | 290 / 320 / 410mm | 24 | ₹677 | ₹549 |

The XXL 5-pack drops to **₹199 per pack when you buy 5 or more** — applied
automatically by `src/lib/pricing.ts`, on the server.

Delivery is ₹49, free over ₹499, shipped with **Delhivery**.

### A note on product claims

The physical packaging carries wording about reducing menstrual discomfort and
improving mood. **That copy is deliberately not reproduced anywhere on this
site.** Product descriptions cover materials, dimensions and construction only,
the FAQ says plainly that these are hygiene products rather than medical
devices, and the same disclaimer appears in the footer and on every product
page. If you ever want to make a health claim, get it substantiated and
reviewed first.
