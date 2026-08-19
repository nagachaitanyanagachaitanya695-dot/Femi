import { ButtonLink } from "@/components/ui/Button";
import { site } from "@/lib/site";

const STEPS = [
  { n: "1", title: "Fill your cart", copy: "Pick your sizes and pack counts. Prices update as you go." },
  { n: "2", title: "Sign in & add your address", copy: "You need an account to check out, so we can keep your orders and addresses together." },
  { n: "3", title: "Send it on WhatsApp", copy: "Your order summary opens in a chat with us, order ID and all." },
  { n: "4", title: "We confirm & ship", copy: `We reply with payment details, then ship with ${site.courier.name} and send you the tracking ID.` },
];

export function WhatsAppSteps() {
  return (
    <div className="relative overflow-hidden rounded-card border border-femi-100 bg-gradient-to-br from-femi-50 via-white to-gold-soft/25 p-8 sm:p-12">
      <div
        aria-hidden
        className="absolute -top-20 -right-16 size-64 rounded-full bg-femi-200/40 blur-3xl"
      />
      <div className="relative grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:items-center">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-femi-600 uppercase">
            How ordering works
          </p>
          <h2 className="mt-3 font-display text-3xl leading-tight text-ink sm:text-4xl">
            Checkout in the app you already use
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-ink-soft">
            We coordinate every order over WhatsApp — it is faster than email and you keep a record
            of the conversation. Nothing is charged automatically; we confirm the amount with you
            first.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <ButtonLink href="/products" size="lg">
              Start your order
            </ButtonLink>
            <ButtonLink href="/policies/shipping" variant="secondary" size="lg">
              Delivery details
            </ButtonLink>
          </div>
        </div>

        <ol className="grid gap-3 sm:grid-cols-2">
          {STEPS.map((step) => (
            <li key={step.n} className="rounded-2xl border border-femi-100 bg-white/90 p-5">
              <span className="grid size-8 place-items-center rounded-full bg-femi-500 text-sm font-bold text-white">
                {step.n}
              </span>
              <h3 className="mt-4 text-sm font-bold text-ink">{step.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">{step.copy}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
