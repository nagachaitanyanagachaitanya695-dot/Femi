import "server-only";

import { getCredentialStore, getStore } from "../db";
import { isSupabaseConfigured } from "../supabase/config";
import { getSupabaseServerClient } from "../supabase/server";
import type { UserProfile } from "../types";
import { getSessionUserId } from "./session";

/**
 * Bootstrap admins.
 *
 * Set FEMI_ADMIN_EMAILS (comma separated) on the server to grant the admin
 * role to those accounts on sign-in. This is read from the environment, never
 * from the request, so a customer cannot promote themselves. Once you are in,
 * roles can also be managed directly in the database.
 */
function bootstrapAdminEmails(): string[] {
  return (process.env.FEMI_ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function resolveRole(email: string, stored: "customer" | "admin" | undefined): "customer" | "admin" {
  if (stored === "admin") return "admin";
  return bootstrapAdminEmails().includes(email.toLowerCase()) ? "admin" : "customer";
}

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  mobile: string;
  role: "customer" | "admin";
}

/**
 * The single place the rest of the app asks "who is making this request?".
 *
 * With Supabase configured, identity comes from the Supabase session cookie
 * (verified by Supabase, not by us). Otherwise it comes from our signed
 * session cookie. Either way the *role* is read from the database, never from
 * anything the browser sent.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  if (isSupabaseConfigured()) {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    // Reading the profile needs the service-role key. If it is missing or the
    // database is unreachable, fall back to the verified session rather than
    // throwing — the visitor stays signed in with the *lowest* privilege the
    // environment allows, so a failure here can never grant admin by accident.
    let profile: UserProfile | null = null;
    try {
      profile = await getStore().getProfile(user.id);
    } catch (error) {
      console.error("[femi][auth] could not load profile:", error);
    }

    const email = user.email ?? profile?.email ?? "";
    return {
      id: user.id,
      email,
      fullName: profile?.fullName ?? (user.user_metadata?.full_name as string) ?? "",
      mobile: profile?.mobile ?? (user.user_metadata?.mobile as string) ?? "",
      role: resolveRole(email, profile?.role),
    };
  }

  const userId = await getSessionUserId();
  if (!userId) return null;

  const record = await getCredentialStore().findUserById(userId);
  if (!record) return null;

  return {
    id: record.id,
    email: record.email,
    fullName: record.fullName,
    mobile: record.mobile,
    role: resolveRole(record.email, record.role),
  };
}

export async function requireUser(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) throw new AuthError("You need to be signed in to do that.", 401);
  return user;
}

export async function requireAdmin(): Promise<AuthUser> {
  const user = await requireUser();
  if (user.role !== "admin") throw new AuthError("Admin access required.", 403);
  return user;
}

export class AuthError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export function toProfile(user: AuthUser, createdAt = new Date().toISOString()): UserProfile {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    mobile: user.mobile,
    role: user.role,
    createdAt,
  };
}
