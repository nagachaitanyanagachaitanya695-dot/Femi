"use client";

import { useState } from "react";

import { SectionHeading } from "@/components/ui/Section";
import { site } from "@/lib/site";

const FAQS = [
  {
    q: "Which size should I choose?",
    a: "L (290mm) suits regular days, XL (320mm) gives more coverage on heavier days, and XXL (410mm) is the longest — most people use it overnight. If you are not sure, the Combo Pack has one pack of each size.",
  },
  {
    q: "How do I place an order?",
    a: "Add what you need to the cart, sign in, and fill in your delivery details at checkout. When you tap “Place order via WhatsApp”, your order summary opens in a WhatsApp chat with us so we can confirm it and share payment details.",
  },
  {
    q: "Is my order confirmed as soon as WhatsApp opens?",
    a: "No. Opening WhatsApp only sends us your order details — nothing has been paid at that point. We reply in the same chat to confirm stock, the final amount and how to pay. Your order stays “Pending” until we confirm it.",
  },
  {
    q: "How long does delivery take, and who delivers it?",
    a: `Orders ship with ${site.courier.name}, usually within ${site.delivery.etaDays} depending on your PIN code. We share the tracking ID on WhatsApp as soon as the parcel is picked up. For anything about a parcel in transit, ${site.courier.name} is the courier to contact — we will pass on the tracking details you need.`,
  },
  {
    q: "What does delivery cost?",
    a: `Delivery is ₹${site.delivery.fee}. It is free on orders over ₹${site.delivery.freeAbove}.`,
  },
  {
    q: "Is the packaging discreet?",
    a: "Yes. Everything ships in a plain outer packet with no product images or descriptions printed on the outside.",
  },
  {
    q: "Can I return a pack?",
    a: "Unopened packs can be replaced or refunded within 7 days of delivery if something is wrong — damaged in transit, or the wrong item. For hygiene reasons we cannot take back opened packs.",
  },
  {
    q: "Do Femi pads treat period pain?",
    a: "No. Femi pads are personal hygiene products, not medical devices, and we do not make health or therapeutic claims about them. If you have concerns about pain or your cycle, please speak to a doctor.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <>
      <SectionHeading
        eyebrow="Questions"
        title="Everything you might be wondering"
        description="Still unsure about something? Message us on WhatsApp — we answer during business hours."
      />
      <div className="mt-8 grid gap-3 lg:grid-cols-2">
        {FAQS.map((faq, index) => {
          const expanded = open === index;
          return (
            <div
              key={faq.q}
              className="h-fit overflow-hidden rounded-card border border-femi-100 bg-white transition-colors hover:border-femi-200"
            >
              <h3>
                <button
                  type="button"
                  onClick={() => setOpen(expanded ? null : index)}
                  aria-expanded={expanded}
                  className="focus-ring flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="text-sm font-semibold text-ink">{faq.q}</span>
                  <span
                    aria-hidden
                    className={`grid size-7 shrink-0 place-items-center rounded-full bg-femi-50 text-femi-600 transition-transform duration-300 ${expanded ? "rotate-45" : ""}`}
                  >
                    +
                  </span>
                </button>
              </h3>
              <div
                className={`grid transition-all duration-300 ease-out ${expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
              >
                <div className="overflow-hidden">
                  <p className="px-5 pb-5 text-sm leading-relaxed text-ink-soft">{faq.a}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
