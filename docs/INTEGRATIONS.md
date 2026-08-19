# Integrations

How to swap the development pieces for production services.

## Supabase

### If your project is already provisioned

The schema, RLS policies and sample catalogue may already be applied — check
**Table editor** for `products`, `orders`, `profiles` and `addresses`. If they
are there, you only need to add the three keys to your environment (below) and
paste the service-role key, which is the one value that cannot be read
programmatically.

### From scratch

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor run `supabase/schema.sql`, then `supabase/seed.sql`.
3. **Project Settings → API** gives you three values:

   | Value | Environment variable | Exposed to the browser? |
   | --- | --- | --- |
   | Project URL | `NEXT_PUBLIC_SUPABASE_URL` | yes |
   | `anon` / publishable key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes |
   | `service_role` key | `SUPABASE_SERVICE_ROLE_KEY` | **no — server only** |

4. Put them in `.env.local` (local) and in your host's environment (production),
   then restart. The app detects Supabase automatically: `getStore()` switches
   from the file store to the Supabase store, and `/api/auth/*` starts
   delegating to Supabase Auth.

   The URL and anon key alone are enough to browse the catalogue and price a
   cart — RLS lets the anonymous role read active products. The service-role
   key is required the moment someone places an order or opens the admin
   dashboard, because those writes deliberately bypass RLS only after the
   server has checked who is asking.
5. Make yourself an admin:

   ```sql
   update public.profiles set role = 'admin' where email = 'you@example.com';
   ```

   Or set `FEMI_ADMIN_EMAILS=you@example.com` and sign in.

6. **Authentication → URL Configuration**: set the site URL to your domain and
   add `https://your-domain/reset-password` as a redirect URL, so password-reset
   links land on the right page.

### Why Supabase rather than Firebase

Both were acceptable per the brief. Supabase is Postgres, so order totals,
stock and prices can carry real constraints (`price <= mrp`, `stock >= 0`), and
row-level security policies read like the access rules they encode. Order lines
are stored as `jsonb`, which keeps an order an immutable record of what was
priced at checkout even if a product is later edited or deleted.

If you would rather use Firebase, replace `src/lib/db/supabase-store.ts` with a
Firestore implementation of the same `Store` interface and swap the auth calls
in `src/lib/auth/service.ts`. Nothing above those two files needs to change.

## Sending OTPs and emails

With Supabase configured, OTP emails and password-reset emails are sent by
Supabase — configure the templates and SMTP under **Authentication → Emails**.

Without Supabase, codes are written to the server console by
`src/lib/auth/otp.ts`. To send them for real, replace the `console.info` call:

```ts
// src/lib/auth/otp.ts
await resend.emails.send({
  from: "Femi <orders@your-domain>",
  to: email,
  subject: `${code} is your Femi code`,
  text: `Your code is ${code}. It expires in ${OTP_TTL_MINUTES} minutes.`,
});
```

### Mobile OTP

The brief allowed either mobile OTP or email OTP; this build ships email OTP,
because SMS in India needs a registered DLT template and a paid provider before
a single message can be delivered. The mobile number is still collected at
sign-up and checkout, since orders are coordinated over WhatsApp.

To add SMS OTP later, add a `requestMobileCode` / `verifyMobileCode` pair in
`src/lib/auth/service.ts` that calls MSG91 or Twilio Verify, and reuse the same
`issueOtp` / `verifyOtp` storage — it is keyed by a string, so a phone number
works as well as an email.

## Changing the WhatsApp business number

The number lives in one place: `src/lib/site.ts`.

```ts
whatsappNumber: (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "919676877257")
```

Either set `NEXT_PUBLIC_WHATSAPP_NUMBER` in your environment (preferred — no
rebuild of the code needed, just a redeploy) or edit the fallback. Use the
international format with no `+`, spaces or dashes: country code followed by the
number, so an Indian number `96768 77257` becomes `919676877257`.

Everything else — the checkout button, the confirmation page, the footer, the
"chat with us" links — reads from that one value.

## Adding a real payment gateway

Today the flow is: order stored → WhatsApp opened → you confirm and collect
payment → you move the order to `confirmed`. Nothing claims payment has
happened, and the order status stays `pending` until an admin changes it.

To add Razorpay (the usual choice for INR):

1. `npm install razorpay`.
2. Add a route `src/app/api/payments/create/route.ts` that loads the stored
   order by id, and creates a Razorpay order for `order.totals.total * 100`
   paise. **Take the amount from the stored order, never from the request body**
   — that is the whole point of pricing on the server.
3. On the checkout page, open Razorpay Checkout with the returned order id.
4. Add a webhook route `src/app/api/payments/webhook/route.ts`. Verify the
   `x-razorpay-signature` header against your webhook secret before trusting
   anything, then mark the order `confirmed` via `getStore().updateOrder(...)`.
5. Keep WhatsApp as a fallback — plenty of customers prefer it.

The order model already has everything a gateway needs: a stable `id`, a
human-readable `reference`, validated `totals`, and a status flow that a webhook
can advance. Add `payment_status` and `payment_id` columns to `orders` when you
get there.

## Courier: Delhivery

Orders ship with Delhivery. The courier's name, website, tracking URL and the
customer-facing note all come from `site.courier` in `src/lib/site.ts`.

Today the flow is manual: you book the shipment with Delhivery, then paste the
waybill number into **Admin → Orders → tracking ID**, which shows it to the
customer on their order page.

To automate it, Delhivery's API can create a waybill and a shipment from the
order's address block. Call it from the admin route that sets the status to
`shipped`, and write the returned waybill to `tracking_id`.
