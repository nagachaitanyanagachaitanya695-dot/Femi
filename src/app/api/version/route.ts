import { handler, json } from "@/lib/api";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { serviceRoleKey } from "@/lib/supabase/config";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

/**
 * "Which build is actually live, and is it configured?"
 *
 * Diagnosing a deployment by looking at the shop is slow and ambiguous — a
 * change that seems missing is usually a build that never shipped. This
 * reports the commit being served and whether each required setting is
 * present.
 *
 * Booleans only: it says whether a key exists, never what it is.
 */
export const GET = handler(async () => {
  const commit =
    process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.GIT_COMMIT_SHA ?? "unknown";

  return json({
    commit: commit.slice(0, 7),
    commitFull: commit,
    deployedAt: process.env.VERCEL_DEPLOYMENT_ID ? "vercel" : "local",
    features: {
      packFilm: site.packFilm.enabled,
      fullScreenIntro: site.intro.enabled,
      introCut: site.intro.file,
    },
    config: {
      supabaseConfigured: isSupabaseConfigured(),
      serviceRoleKeySet: serviceRoleKey().length > 0,
      authSecretSet: (process.env.AUTH_SECRET ?? "").length >= 32,
      adminEmailsSet: (process.env.FEMI_ADMIN_EMAILS ?? "").trim().length > 0,
      whatsappNumber: site.whatsappNumber,
    },
  });
});
