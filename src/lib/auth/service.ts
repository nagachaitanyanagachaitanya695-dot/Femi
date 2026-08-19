import "server-only";

import { randomUUID } from "node:crypto";

import { getCredentialStore, getStore } from "../db";
import { isSupabaseConfigured } from "../supabase/config";
import { getSupabaseServerClient } from "../supabase/server";
import { normaliseEmail, normaliseMobile } from "../validation";
import { hashPassword, verifyPassword } from "./password";
import { issueOtp, verifyOtp } from "./otp";
import { clearSessionCookie, setSessionCookie } from "./session";

/**
 * One API for the two authentication backends.
 *
 * Route handlers call these functions and never care which backend is active.
 * The frontend never talks to Supabase directly — it posts to /api/auth/*,
 * which keeps tokens in http-only cookies and keeps every rule server-side.
 */

export interface AuthOutcome {
  ok: boolean;
  message?: string;
  /** Non-production helper so OTP flows can be tested without a mail provider. */
  devCode?: string;
  needsEmailConfirmation?: boolean;
}

export interface SignupInput {
  fullName: string;
  email: string;
  mobile: string;
  password: string;
}

export async function signUp(input: SignupInput): Promise<AuthOutcome> {
  const email = normaliseEmail(input.email);
  const mobile = normaliseMobile(input.mobile);

  if (isSupabaseConfigured()) {
    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password: input.password,
      options: { data: { full_name: input.fullName, mobile } },
    });
    if (error) return { ok: false, message: error.message };

    if (data.user) {
      await getStore()
        .saveProfile({
          id: data.user.id,
          email,
          fullName: input.fullName,
          mobile,
          role: "customer",
          createdAt: new Date().toISOString(),
        })
        .catch(() => undefined);
    }

    return { ok: true, needsEmailConfirmation: !data.session };
  }

  const store = getCredentialStore();
  if (await store.findUserByEmail(email)) {
    return { ok: false, message: "An account with this email already exists. Try signing in." };
  }

  const user = {
    id: randomUUID(),
    email,
    fullName: input.fullName,
    mobile,
    role: "customer" as const,
    passwordHash: await hashPassword(input.password),
    createdAt: new Date().toISOString(),
  };
  await store.createUser(user);
  await setSessionCookie(user.id);
  return { ok: true };
}

export async function signInWithPassword(rawEmail: string, password: string): Promise<AuthOutcome> {
  const email = normaliseEmail(rawEmail);
  const genericFailure = { ok: false, message: "Incorrect email or password." };

  if (isSupabaseConfigured()) {
    const supabase = await getSupabaseServerClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? genericFailure : { ok: true };
  }

  const user = await getCredentialStore().findUserByEmail(email);
  // Always run a hash comparison so a missing account and a wrong password
  // take a similar amount of time.
  const stored = user?.passwordHash ?? "scrypt$00$00";
  const valid = await verifyPassword(password, stored);
  if (!user || !valid) return genericFailure;

  await setSessionCookie(user.id);
  return { ok: true };
}

export async function requestLoginCode(rawEmail: string): Promise<AuthOutcome> {
  const email = normaliseEmail(rawEmail);

  if (isSupabaseConfigured()) {
    const supabase = await getSupabaseServerClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    });
    // Never reveal whether the address is registered.
    if (error && !/not found|signups/i.test(error.message)) {
      return { ok: false, message: error.message };
    }
    return { ok: true };
  }

  const user = await getCredentialStore().findUserByEmail(email);
  if (!user) return { ok: true }; // same response as success, deliberately

  const { devCode } = await issueOtp(email, "login");
  return { ok: true, devCode };
}

export async function verifyLoginCode(rawEmail: string, code: string): Promise<AuthOutcome> {
  const email = normaliseEmail(rawEmail);

  if (isSupabaseConfigured()) {
    const supabase = await getSupabaseServerClient();
    const { error } = await supabase.auth.verifyOtp({ email, token: code, type: "email" });
    return error ? { ok: false, message: "That code is not valid. Request a new one." } : { ok: true };
  }

  const result = await verifyOtp(email, "login", code);
  if (result !== "ok") return { ok: false, message: otpMessage(result) };

  const user = await getCredentialStore().findUserByEmail(email);
  if (!user) return { ok: false, message: "Account not found." };

  await setSessionCookie(user.id);
  return { ok: true };
}

export async function requestPasswordReset(rawEmail: string, origin: string): Promise<AuthOutcome> {
  const email = normaliseEmail(rawEmail);

  if (isSupabaseConfigured()) {
    const supabase = await getSupabaseServerClient();
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/reset-password`,
    });
    return { ok: true };
  }

  const user = await getCredentialStore().findUserByEmail(email);
  if (!user) return { ok: true };

  const { devCode } = await issueOtp(email, "reset");
  return { ok: true, devCode };
}

export async function resetPasswordWithCode(
  rawEmail: string,
  code: string,
  newPassword: string,
): Promise<AuthOutcome> {
  const email = normaliseEmail(rawEmail);

  if (isSupabaseConfigured()) {
    // With Supabase the reset link signs the user in, then they set a new
    // password from /reset-password via updatePassword() below.
    return { ok: false, message: "Open the reset link sent to your email to choose a new password." };
  }

  const result = await verifyOtp(email, "reset", code);
  if (result !== "ok") return { ok: false, message: otpMessage(result) };

  const store = getCredentialStore();
  const user = await store.findUserByEmail(email);
  if (!user) return { ok: false, message: "Account not found." };

  await store.updateUser(user.id, { passwordHash: await hashPassword(newPassword) });
  await setSessionCookie(user.id);
  return { ok: true };
}

export async function updatePassword(userId: string, newPassword: string): Promise<AuthOutcome> {
  if (isSupabaseConfigured()) {
    const supabase = await getSupabaseServerClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return error ? { ok: false, message: error.message } : { ok: true };
  }

  await getCredentialStore().updateUser(userId, { passwordHash: await hashPassword(newPassword) });
  return { ok: true };
}

export async function signOut(): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = await getSupabaseServerClient();
    await supabase.auth.signOut();
    return;
  }
  await clearSessionCookie();
}

function otpMessage(result: string): string {
  switch (result) {
    case "expired":
      return "That code has expired. Request a new one.";
    case "too-many-attempts":
      return "Too many incorrect attempts. Request a new code.";
    case "not-found":
      return "Request a code first.";
    default:
      return "That code is not valid.";
  }
}
