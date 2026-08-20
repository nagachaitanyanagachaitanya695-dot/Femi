/**
 * Environment variables typed into a hosting dashboard are frequently created
 * before their value is known, so they arrive as an empty string rather than
 * absent. `process.env.X ?? fallback` does not catch that — `??` only fires on
 * null/undefined — which silently ships a blank value into production.
 *
 * Every optional setting should be read through here instead.
 */
export function envText(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

/**
 * Normalises a WhatsApp click-to-chat number to digits with a country code.
 *
 * wa.me needs the full international number. Given a bare 10-digit Indian
 * mobile it adds 91, and anything that cannot be a real number falls back to
 * the default — a wa.me link with no recipient opens the user's contact
 * picker instead of the shop, which looks broken and loses the order.
 */
export function normaliseWhatsappNumber(value: string | undefined, fallback: string): string {
  // A leading 0 is India's domestic trunk prefix and is never part of the
  // international number.
  const digits = (value ?? "").replace(/\D/g, "").replace(/^0+/, "");
  const candidate = /^[6-9]\d{9}$/.test(digits) ? `91${digits}` : digits;

  // E.164 allows up to 15 digits; a country code plus a subscriber number is
  // never shorter than 8.
  return candidate.length >= 8 && candidate.length <= 15 ? candidate : fallback;
}
