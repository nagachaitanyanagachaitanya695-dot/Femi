/**
 * Input validation + sanitisation.
 *
 * Every one of these runs on the server before anything is stored. The same
 * helpers are re-used on the client purely so the customer gets fast feedback —
 * client-side checks are a convenience, never the gate.
 */

export type FieldErrors = Record<string, string>;

const CONTROL_CHARS = /[\x00-\x1F\x7F]/g;

/** Strips control characters and collapses whitespace; caps length. */
export function clean(value: unknown, maxLength = 200): string {
  if (typeof value !== "string") return "";
  return value.replace(CONTROL_CHARS, " ").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

/** Same as `clean` but keeps newlines (for address / notes fields). */
export function cleanMultiline(value: unknown, maxLength = 500): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/\r\n?/g, "\n")
    .replace(/[\x00-\x09\x0B-\x1F\x7F]/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, maxLength);
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
/** Indian mobile numbers: 10 digits starting 6-9, optionally +91 prefixed. */
export const MOBILE_RE = /^[6-9]\d{9}$/;
export const PINCODE_RE = /^[1-9]\d{5}$/;

export function normaliseMobile(value: unknown): string {
  const digits = clean(value, 20).replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  return digits;
}

export function normaliseEmail(value: unknown): string {
  return clean(value, 254).toLowerCase();
}

export interface CheckoutInput {
  fullName: string;
  mobile: string;
  email: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  notes: string;
}

export function validateCheckout(raw: Record<string, unknown>): {
  ok: boolean;
  errors: FieldErrors;
  value: CheckoutInput;
} {
  const value: CheckoutInput = {
    fullName: clean(raw.fullName, 80),
    mobile: normaliseMobile(raw.mobile),
    email: normaliseEmail(raw.email),
    line1: clean(raw.line1, 160),
    line2: clean(raw.line2, 160),
    city: clean(raw.city, 60),
    state: clean(raw.state, 60),
    pincode: clean(raw.pincode, 10).replace(/\D/g, ""),
    notes: cleanMultiline(raw.notes, 400),
  };

  const errors: FieldErrors = {};
  if (value.fullName.length < 2) errors.fullName = "Please enter your full name.";
  if (!MOBILE_RE.test(value.mobile)) errors.mobile = "Enter a valid 10-digit Indian mobile number.";
  if (!EMAIL_RE.test(value.email)) errors.email = "Enter a valid email address.";
  if (value.line1.length < 6) errors.line1 = "Enter your house/flat number and street.";
  if (value.city.length < 2) errors.city = "Enter your city.";
  if (value.state.length < 2) errors.state = "Select your state.";
  if (!PINCODE_RE.test(value.pincode)) errors.pincode = "Enter a valid 6-digit PIN code.";

  return { ok: Object.keys(errors).length === 0, errors, value };
}

export function validatePassword(password: unknown): string | null {
  if (typeof password !== "string" || password.length < 8) {
    return "Password must be at least 8 characters.";
  }
  if (password.length > 128) return "Password is too long.";
  if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
    return "Use at least one letter and one number.";
  }
  return null;
}

export const INDIAN_STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
  "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa",
  "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka",
  "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
];
