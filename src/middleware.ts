import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "@/lib/supabase/config";

/**
 * Keeps the Supabase session cookie fresh on every request so Server
 * Components always see an up-to-date session. When Supabase is not
 * configured this is a no-op — the built-in session cookie needs no refresh.
 *
 * Note this does *not* authorise anything: access checks live in the page and
 * route handlers, where the role is read from the database.
 */
/** Routes a signed-out visitor has no business loading. */
const PROTECTED = ["/checkout", "/account", "/admin", "/order"];

/**
 * Cheap "is there a session at all?" check.
 *
 * This only looks for the presence of a session cookie so we can send a real
 * 307 to the sign-in page instead of rendering a shell first. It proves
 * nothing on its own — the page and the API route still verify the session and
 * the role on the server.
 */
function hasSessionCookie(request: NextRequest): boolean {
  if (request.cookies.get("femi_session")) return true;
  return request.cookies
    .getAll()
    .some((cookie) => cookie.name.startsWith("sb-") && cookie.name.includes("auth-token"));
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (PROTECTED.some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
    if (!hasSessionCookie(request)) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.search = `?next=${encodeURIComponent(pathname + search)}`;
      return NextResponse.redirect(url);
    }
  }

  const response = NextResponse.next({ request });

  if (!isSupabaseConfigured()) return response;

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  await supabase.auth.getUser();
  return response;
}

export const config = {
  matcher: [
    // Everything except Next internals and static assets.
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
