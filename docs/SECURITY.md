# Security notes

What this project does, and what you still need to do before taking real money.

## What is already in place

**Authentication is server-side.** The browser never talks to the auth backend
directly — it posts to `/api/auth/*`, which sets an `httpOnly`, `SameSite=Lax`,
`Secure`-in-production session cookie. JavaScript on the page cannot read it, so
an XSS bug cannot lift a session token out of `localStorage`.

**Passwords are never stored in readable form.** The built-in backend hashes
them with scrypt and a per-user random salt (`src/lib/auth/password.ts`). With
Supabase configured, this app never sees a password at all — Supabase Auth
handles it.

**One-time codes are hashed and expire.** OTPs are stored as a SHA-256 hash
salted with the email address, expire after 10 minutes, are single-use, and lock
out after five wrong attempts (`src/lib/auth/otp.ts`).

**Prices are computed on the server.** `/api/orders` accepts only product ids
and quantities. Every price, bulk discount, delivery fee and total is recomputed
from the catalogue the server loaded (`src/lib/pricing.ts`). Posting a fake
price changes nothing. The cart page shows server-computed totals for the same
reason.

**Stock is checked before an order is written**, so an order cannot be placed
for more packs than exist.

**Authorisation is checked on the server, per request.** `requireUser()` and
`requireAdmin()` read the role from the database, never from the request.
The admin UI check in `src/app/admin/layout.tsx` is convenience; the real gate
is in every `/api/admin/*` route. The middleware redirect for signed-out
visitors is a UX optimisation only — it proves nothing on its own.

**Order visibility is scoped.** A customer can read only their own orders;
`/api/orders/[id]` returns 404 for anyone else's, so order references cannot be
enumerated.

**Input is sanitised and validated** in `src/lib/validation.ts`: control
characters stripped, lengths capped, mobile numbers and PIN codes matched
against Indian formats. React escapes output, and nothing uses
`dangerouslySetInnerHTML`.

**Rate limiting** on sign-up, sign-in, OTP request/verify, password reset and
order creation (`src/lib/rate-limit.ts`).

**Login responses do not leak account existence.** A wrong password and an
unknown email return the same message, and an OTP request for an unregistered
address returns the same success response as a registered one.

**Security headers** are set in `next.config.ts`, and `/api/*` responses are
`no-store`.

**Row-level security** is enabled on every Supabase table in
`supabase/schema.sql`, including a restrictive policy that stops a customer
promoting themselves to admin.

## What you should do before going live

1. **Set `AUTH_SECRET`** to a long random value. The app refuses to start a
   production session without it.
2. **Move rate limiting to shared storage** (Redis/Upstash) if you run more than
   one instance — the in-memory limiter is per-process.
3. **Add a Content-Security-Policy.** It is deliberately not set, because the
   right policy depends on which analytics/payment scripts you add. Start with
   `default-src 'self'` and add what you actually need.
4. **Replace the file store with Supabase.** The JSON store is a development
   convenience: no concurrency control, and on a serverless host the filesystem
   is wiped between deploys.
5. **Send OTPs for real.** Right now non-Supabase OTPs are logged to the server
   console. Wire up an email provider (Resend, SES) or an SMS provider (MSG91,
   Twilio) in `src/lib/auth/otp.ts`.
6. **Rotate the service-role key** if it has ever been pasted anywhere shared.
7. **Turn on backups** for your database, and decide how long you keep customer
   addresses.

## Things this project deliberately does not claim

- Opening WhatsApp is not a payment. Nothing in the code marks an order paid;
  orders stay `pending` until an admin changes the status.
- There is no payment gateway. See the README for how to add one.
