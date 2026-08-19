import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { site } from "@/lib/site";

interface Policy {
  title: string;
  intro: string;
  sections: { heading: string; body: string[] }[];
}

const POLICIES: Record<string, Policy> = {
  shipping: {
    title: "Shipping & delivery",
    intro: `Every Femi order is shipped with ${site.courier.name}, in plain packaging, anywhere in India.`,
    sections: [
      {
        heading: "Delivery charges",
        body: [
          `Delivery is a flat ₹${site.delivery.fee} per order.`,
          `Orders over ₹${site.delivery.freeAbove} ship free — the discount is applied automatically at checkout.`,
        ],
      },
      {
        heading: "How long it takes",
        body: [
          `Orders are usually picked up within one business day of confirmation and delivered in ${site.delivery.etaDays}, depending on your PIN code.`,
          "Remote PIN codes and public holidays can add a day or two.",
        ],
      },
      {
        heading: "Tracking your parcel",
        body: [
          `${site.courier.note}`,
          `You can track a parcel on the ${site.courier.name} website using that ID. If a parcel is delayed or shows an unexpected status, ${site.courier.name} is the courier handling it — contact them with your tracking ID, or message us and we will follow it up for you.`,
        ],
      },
      {
        heading: "Packaging",
        body: [
          "Orders ship in a plain outer packet. Nothing about the contents is printed on the outside.",
        ],
      },
    ],
  },
  returns: {
    title: "Returns & refunds",
    intro: "We want you to be happy with your order. Here is what we can and cannot take back.",
    sections: [
      {
        heading: "What we replace or refund",
        body: [
          "Unopened packs, within 7 days of delivery, if the item is damaged in transit, the pack is faulty, or you received the wrong item.",
          "Send us photos on WhatsApp and we will arrange a replacement or a refund — whichever you prefer.",
        ],
      },
      {
        heading: "What we cannot take back",
        body: [
          "For hygiene reasons we cannot accept opened packs, or unopened packs returned after 7 days.",
        ],
      },
      {
        heading: "How refunds are paid",
        body: [
          "Refunds go back through the same method you paid with. Once approved, most refunds reach you within 5–7 business days.",
        ],
      },
      {
        heading: "Cancelling an order",
        body: [
          "You can cancel any order that has not yet shipped — message us on WhatsApp with your order ID and we will cancel it at no cost.",
        ],
      },
    ],
  },
  privacy: {
    title: "Privacy policy",
    intro:
      "We collect the minimum we need to get an order to your door, and we do not sell your data.",
    sections: [
      {
        heading: "What we collect",
        body: [
          "Your name, email address, mobile number and delivery address, so we can process and deliver your order.",
          "Your order history, so you can see it in your account.",
          "Basic technical information such as your IP address, used to rate-limit sign-in attempts and protect the site.",
        ],
      },
      {
        heading: "How it is stored",
        body: [
          "Passwords are never stored in readable form — only a salted cryptographic hash of them. One-time codes are stored hashed as well and expire after ten minutes.",
          "Your session is kept in a signed, http-only cookie that JavaScript on the page cannot read.",
        ],
      },
      {
        heading: "Who we share it with",
        body: [
          `Your name, address and mobile number are shared with ${site.courier.name} so they can deliver your parcel. That is the only routine sharing we do.`,
          "We do not sell or rent your personal information to anyone.",
        ],
      },
      {
        heading: "WhatsApp",
        body: [
          "When you place an order, the order summary is sent as a WhatsApp message from your own account to ours. That conversation is subject to WhatsApp's own privacy terms as well as this policy.",
        ],
      },
      {
        heading: "Your choices",
        body: [
          `You can ask us to correct or delete your account and its data at any time — email ${site.supportEmail} and we will action it.`,
        ],
      },
    ],
  },
  terms: {
    title: "Terms of service",
    intro: "The basics of buying from Femi.",
    sections: [
      {
        heading: "Orders",
        body: [
          "Placing an order on this site creates a request to buy. Your order is confirmed only when we confirm it with you on WhatsApp — until then it stays in “Pending”.",
          "Opening WhatsApp from the checkout does not pay for an order. Payment is arranged separately in that conversation.",
          "We may decline or cancel an order if an item is out of stock or a price was listed in error. If you have already paid, you get a full refund.",
        ],
      },
      {
        heading: "Prices",
        body: [
          "All prices are in Indian rupees and include applicable taxes. The price charged is the price our server calculates at checkout.",
        ],
      },
      {
        heading: "Product information",
        body: [
          `Femi products are personal hygiene products, not medical devices. ${site.disclaimer}`,
          "Product photos and 3D renderings are representative; packaging may vary between batches.",
        ],
      },
      {
        heading: "Your account",
        body: [
          "You are responsible for keeping your password safe and for activity under your account. Tell us straight away if you think someone else has access to it.",
        ],
      },
      {
        heading: "Contact",
        body: [`Questions about these terms: ${site.supportEmail} or WhatsApp ${site.whatsappDisplay}.`],
      },
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(POLICIES).map((slug) => ({ slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const policy = POLICIES[slug];
  if (!policy) return { title: "Not found" };
  return { title: policy.title, description: policy.intro };
}

export default async function PolicyPage({ params }: Props) {
  const { slug } = await params;
  const policy = POLICIES[slug];
  if (!policy) notFound();

  return (
    <div className="container-page py-12 sm:py-16">
      <article className="mx-auto max-w-2xl">
        <h1 className="font-display text-4xl leading-tight text-ink sm:text-5xl">{policy.title}</h1>
        <p className="mt-4 text-base leading-relaxed text-ink-soft">{policy.intro}</p>

        <div className="mt-10 grid gap-8">
          {policy.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="font-display text-xl text-ink">{section.heading}</h2>
              <div className="mt-3 grid gap-3">
                {section.body.map((paragraph) => (
                  <p key={paragraph} className="text-sm leading-relaxed text-ink-soft">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <p className="mt-12 rounded-card border border-femi-100 bg-white p-5 text-sm leading-relaxed text-ink-soft">
          Need a hand? WhatsApp us on{" "}
          <strong className="font-semibold text-ink">{site.whatsappDisplay}</strong> or email{" "}
          <a href={`mailto:${site.supportEmail}`} className="focus-ring font-semibold text-femi-600 underline">
            {site.supportEmail}
          </a>
          .
        </p>
      </article>
    </div>
  );
}
