import { envText } from "../env";

/**
 * Supabase connection settings.
 *
 * The project URL and the anon (publishable) key are public by design — they
 * are compiled into the browser bundle and every request they make is still
 * subject to row-level security. So they carry defaults for this shop's own
 * project, which means a deployment only has to supply the two genuinely
 * secret values: SUPABASE_SERVICE_ROLE_KEY and AUTH_SECRET.
 *
 * Setting the environment variables still overrides these, so pointing the
 * site at a different project needs no code change.
 *
 * envText rather than `??`: a variable added to a hosting dashboard and left
 * blank arrives as an empty string, which `??` does not catch.
 */
const DEFAULT_SUPABASE_URL = "https://fcwmjmkdvfwpoksuuglx.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" +
  ".eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjd21qbWtkdmZ3cG9rc3V1Z2x4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzMzA1NDEsImV4cCI6MjEwMDkwNjU0MX0" +
  ".Vaxa8V69CuyC_y0A_vDL9FFerjcBxojnuvPVUSatQY8";

export const SUPABASE_URL = envText(process.env.NEXT_PUBLIC_SUPABASE_URL, DEFAULT_SUPABASE_URL);
export const SUPABASE_ANON_KEY = envText(
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  DEFAULT_SUPABASE_ANON_KEY,
);

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

/**
 * Server-only, and never defaulted: this key bypasses row-level security, so
 * it belongs in the deployment's environment and nowhere near the repository.
 * Returns "" in the browser bundle because the variable is not public.
 */
export function serviceRoleKey(): string {
  return envText(process.env.SUPABASE_SERVICE_ROLE_KEY, "");
}
