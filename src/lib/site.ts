/**
 * Central brand + store configuration.
 *
 * Anything a store owner may want to change without touching components lives
 * here. Values can be overridden with public environment variables so the same
 * build can be re-pointed at a different number / inbox without a code change.
 */

import { envText, normaliseWhatsappNumber } from "./env";

const DEFAULT_WHATSAPP = "919676877257";

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
  whatsappNumber: normaliseWhatsappNumber(
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
    DEFAULT_WHATSAPP,
  ),

  /** Human-readable version of the same number, used in the UI. */
  get whatsappDisplay() {
    const n = this.whatsappNumber;
    return n.startsWith("91") ? `+91 ${n.slice(2, 7)} ${n.slice(7)}` : `+${n}`;
  },

  supportEmail: envText(process.env.NEXT_PUBLIC_SUPPORT_EMAIL, "zubimoosa0813@gmail.com"),

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

  /**
   * Opening product film.
   *
   * `src` chooses which cut is served:
   *   /intro/femi-intro.mp4        full 10s, includes the anion / FAR-IR /
   *                                nano-silver claim cards
   *   /intro/femi-intro-clean.mp4  7.5s, same film with the claim segment
   *                                removed
   *
   * Set `enabled: false` to turn the intro off entirely.
   */
  intro: {
    enabled: true,
    /**
     * Which cut to play. Change this one line to switch:
     *   "femi-intro"        full 10s, includes the anion / FAR-IR /
     *                       nano-silver claim cards
     *   "femi-intro-clean"  7.5s, the same film with the claim segment removed
     */
    file: "femi-intro",
    poster: "/intro/femi-intro-poster.jpg",
    /**
     * Both containers ship. Safari and iOS need the MP4; some Linux Chromium
     * and Firefox builds have no H.264 at all and fall through to the WebM.
     */
    get sources() {
      return [
        { src: `/intro/${this.file}.mp4`, type: "video/mp4" },
        { src: `/intro/${this.file}.webm`, type: "video/webm" },
      ];
    },
    /** Hard stop, so a stalled video can never block the shop. */
    maxDurationMs: 12_000,
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
