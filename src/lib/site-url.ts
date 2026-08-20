/**
 * Resolves the site's public base URL.
 *
 * Deliberately forgiving, because this value is typed into a hosting
 * dashboard by hand:
 *  - a blank or whitespace-only value counts as "not set" (`??` alone does
 *    not catch this, and `new URL("")` throws at build time);
 *  - a bare domain like "femi.vercel.app" gets https:// added;
 *  - anything still unparseable is ignored rather than crashing the build;
 *  - on Vercel we fall back to the deployment's own URL, so the site works
 *    correctly with nothing configured at all.
 */
function parse(candidate: string): string | null {
  const trimmed = candidate.trim();
  if (!trimmed) return null;

  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withScheme);
    // A real host has a dot in it (or is localhost). This rejects typos such
    // as "htp:/oops", which would otherwise parse into a valid-looking but
    // wrong origin, and lets the caller fall through to a sane default.
    const looksLikeHost = url.hostname.includes(".") || url.hostname === "localhost";
    if (!looksLikeHost) return null;
    return url.origin;
  } catch {
    return null;
  }
}

export function getSiteUrl(): string {
  const configured = parse(process.env.NEXT_PUBLIC_SITE_URL ?? "");
  if (configured) return configured;

  // Vercel sets these itself. The production domain is preferred so preview
  // builds still advertise the canonical URL in metadata and the sitemap.
  const vercel =
    parse(process.env.VERCEL_PROJECT_PRODUCTION_URL ?? "") ??
    parse(process.env.VERCEL_URL ?? "");
  if (vercel) return vercel;

  return "http://localhost:3000";
}
