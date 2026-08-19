import "server-only";

import { createHash, randomInt, timingSafeEqual } from "node:crypto";

import { getCredentialStore } from "../db";
import type { OtpRecord } from "../db/types";

export const OTP_TTL_MINUTES = 10;
const MAX_ATTEMPTS = 5;

/** Six digits, generated with a CSPRNG rather than Math.random. */
function generateCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

function hashCode(email: string, code: string): string {
  // Salted with the email so a hash cannot be replayed against another account.
  return createHash("sha256").update(`${email}:${code}`).digest("hex");
}

export interface IssuedOtp {
  /** Present only outside production, so the flow is testable without an SMS/email provider. */
  devCode?: string;
  expiresAt: string;
}

export async function issueOtp(email: string, purpose: OtpRecord["purpose"]): Promise<IssuedOtp> {
  const code = generateCode();
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60_000).toISOString();

  await getCredentialStore().putOtp({
    email,
    purpose,
    codeHash: hashCode(email, code),
    expiresAt,
    attempts: 0,
  });

  // A real deployment sends this over email or SMS. See docs/INTEGRATIONS.md.
  console.info(`[femi][otp] ${purpose} code for ${email}: ${code} (valid ${OTP_TTL_MINUTES} min)`);

  return {
    devCode: process.env.NODE_ENV === "production" ? undefined : code,
    expiresAt,
  };
}

export type OtpResult = "ok" | "invalid" | "expired" | "too-many-attempts" | "not-found";

export async function verifyOtp(
  email: string,
  purpose: OtpRecord["purpose"],
  code: string,
): Promise<OtpResult> {
  const store = getCredentialStore();
  const record = await store.getOtp(email, purpose);
  if (!record) return "not-found";

  if (record.attempts >= MAX_ATTEMPTS) {
    await store.clearOtp(email, purpose);
    return "too-many-attempts";
  }
  if (new Date(record.expiresAt).getTime() < Date.now()) {
    await store.clearOtp(email, purpose);
    return "expired";
  }

  const candidate = Buffer.from(hashCode(email, code.trim()));
  const expected = Buffer.from(record.codeHash);
  const matches = candidate.length === expected.length && timingSafeEqual(candidate, expected);

  if (!matches) {
    await store.bumpOtpAttempts(email, purpose);
    return "invalid";
  }

  await store.clearOtp(email, purpose);
  return "ok";
}
