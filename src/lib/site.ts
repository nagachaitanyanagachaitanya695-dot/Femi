/**
 * Central brand + store configuration.
 *
 * Anything a store owner may want to change without touching components lives
 * here. Values can be overridden with public environment variables so the same
 * build can be re-pointed at a different number / inbox without a code change.
 */

export const site = {
  name: "Femi",
  tagline: "Period care made simple.",
  description:
    "Ultra-thin, soft cotton-finish sanitary napkins designed for everyday comfort, reliable protection and easy delivery across India.",

  /**
   * WhatsApp business number in international format (country code + number,
   * digits only — no +, no spaces). India = 91 + 10-digit number.
   * To change it: set NEXT_PUBLIC_WHATSAPP_NUMBER, or edit the fallback below.
   */
  whatsappNumber: (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "919676877257").replace(/\D/g, ""),

  /** Human-readable version of the same number, used in the UI. */
  get whatsappDisplay() {
    const n = this.whatsappNumber;
    return n.startsWith("91") ? `+91 ${n.slice(2, 7)} ${n.slice(7)}` : `+${n}`;
  },

  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "zubimoosa0813@gmail.com",

  /** Courier partner used for all shipments. */
  courier: {
    name: "Delhivery",
    site: "https://www.delhivery.com/",
    trackingUrl: "https://www.delhivery.com/track/package/",
    note: "All Femi orders ship with Delhivery. Your tracking ID is shared on WhatsApp once the parcel is picked up.",
  },

  /** Delivery pricing (also enforced server-side in src/lib/pricing.ts). */
  delivery: {
    fee: 49,
    freeAbove: 499,
    etaDays: "3-6 business days",
  },

  currency: "INR",
  countryCode: "IN",

  /**
   * Legal / trust copy. Femi products are personal hygiene products, not
   * medical devices — the site deliberately makes no health or therapeutic
   * claims anywhere.
   */
  disclaimer:
    "Femi products are personal hygiene products, not medical devices. We do not make medical or therapeutic claims. If you have a health concern, please speak to a qualified healthcare professional.",

  social: {
    instagram: "https://instagram.com/",
  },
} as const;

export type Site = typeof site;
