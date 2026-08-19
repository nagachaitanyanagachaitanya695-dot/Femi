import "server-only";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { SUPABASE_ANON_KEY, SUPABASE_URL, serviceRoleKey } from "./config";

/**
 * Request-scoped client that reads and refreshes the user's session from
 * cookies. Everything it does is subject to row-level security, so it is the
 * client to use for anything acting *as the signed-in customer*.
 */
export async function getSupabaseServerClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component: Next.js forbids writing cookies
          // there. The middleware refreshes the session instead.
        }
      },
    },
  });
}

/**
 * Service-role client. Bypasses row-level security, so it is used only after
 * the caller's identity and role have already been checked in our own code —
 * writing orders, and admin catalogue/order management.
 */
export function getSupabaseAdminClient(): SupabaseClient | null {
  const key = serviceRoleKey();
  if (!SUPABASE_URL || !key) return null;
  return createClient(SUPABASE_URL, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
