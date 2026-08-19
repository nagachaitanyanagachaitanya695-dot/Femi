/**
 * Supabase is optional. When these variables are absent the app falls back to
 * the built-in file store + credential auth so it runs with zero setup.
 *
 * Only the URL and the anon/publishable key are ever exposed to the browser.
 * The service-role key is read on the server only and must never be prefixed
 * with NEXT_PUBLIC_.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

/** Server-only. Returns "" in the browser bundle because the var is not public. */
export function serviceRoleKey(): string {
  return process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
}
