import { SectionHeading } from "@/components/ui/Section";

const REVIEWS = [
  {
    quote:
      "The XXL pads are the first ones I have not had to think about overnight. I order a combo pack every month now and it lasts the whole cycle.",
    name: "Sneha R.",
    city: "Hyderabad",
    product: "XL Night Pads — 5 Pads",
  },
  {
    quote:
      "Genuinely thin. I was expecting bulky because of the length, but it sits flat and I forget I am wearing it during college.",
    name: "Aarthi K.",
    city: "Chennai",
    product: "Ultra Soft Pads — 10 Pads",
  },
  {
    quote:
      "Ordering over WhatsApp was the easiest part — I sent the order, they confirmed in two minutes and it arrived in three days.",
    name: "Priya M.",
    city: "Pune",
    product: "Combo Pack",
  },
  {
    quote:
      "Packaging was plain and no one at home asked questions. Small thing, but it mattered to me.",
    name: "Fatima S.",
    city: "Bengaluru",
    product: "Ultra Soft Pads — 20 Pads",
  },
];

export function Testimonials() {
  return (
    <>
      <SectionHeading
        eyebrow="From our customers"
        title="What people tell us"
        description="A few notes from customers who order regularly. Reviews are shared with permission."
      />
      <div className="mt-8 -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">
        {REVIEWS.map((review) => (
          <figure
            key={review.name}
            className="flex min-w-[19rem] snap-start flex-col rounded-card border border-femi-100 bg-white p-6 transition-shadow duration-300 hover:shadow-lift sm:min-w-0"
          >
            <div aria-hidden className="text-femi-300">
              ★★★★★
            </div>
            <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-ink-soft">
              “{review.quote}”
            </blockquote>
            <figcaption className="mt-5 border-t border-femi-100 pt-4">
              <span className="block text-sm font-semibold text-ink">{review.name}</span>
              <span className="block text-xs text-ink-faint">
                {review.city} · {review.product}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </>
  );
}
