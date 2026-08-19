import { fail, handler, json, readJson } from "@/lib/api";
import { getCurrentUser, requireUser, toProfile } from "@/lib/auth/current-user";
import { getStore } from "@/lib/db";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getCredentialStore } from "@/lib/db";
import { MOBILE_RE, clean, normaliseMobile } from "@/lib/validation";

export const dynamic = "force-dynamic";

export const GET = handler(async () => {
  const user = await getCurrentUser();
  return json({ user });
});

/** Update the signed-in customer's own name / mobile. */
export const PATCH = handler(async (request) => {
  const user = await requireUser();
  const body = await readJson(request);

  const fullName = clean(body.fullName, 80) || user.fullName;
  const mobile = normaliseMobile(body.mobile) || user.mobile;

  if (fullName.length < 2) return fail("Enter your full name.", 422, { errors: { fullName: "Enter your full name." } });
  if (!MOBILE_RE.test(mobile)) {
    return fail("Enter a valid 10-digit mobile number.", 422, {
      errors: { mobile: "Enter a valid 10-digit mobile number." },
    });
  }

  const updated = { ...user, fullName, mobile };
  await getStore().saveProfile(toProfile(updated));
  if (!isSupabaseConfigured()) {
    await getCredentialStore().updateUser(user.id, { fullName, mobile });
  }

  return json({ user: updated });
});
