import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * HMAC helpers shared by the session cookie and the guest order-access cookie.
 * Both need to hand the browser a value it cannot forge but can hand back.
 */
export function secret(): string {
  const value = process.env.AUTH_SECRET;
  if (value && value.length >= 32) return value;

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "AUTH_SECRET is missing or too short. Set a random 32+ character value before deploying.",
    );
  }
  // Development only: keeps `npm run dev` working with no setup.
  return "femi-development-only-secret-do-not-use-in-production";
}

export function sign(data: string): string {
  return createHmac("sha256", secret()).update(data).digest("base64url");
}

export function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

/** Wraps a payload as `<base64url body>.<signature>`. */
export function seal(payload: unknown): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

/** Reverses `seal`, returning null if the value was tampered with. */
export function unseal<T>(token: string | undefined): T | null {
  if (!token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature || !safeEqual(signature, sign(body))) return null;

  try {
    return JSON.parse(Buffer.from(body, "base64url").toString()) as T;
  } catch {
    return null;
  }
}
