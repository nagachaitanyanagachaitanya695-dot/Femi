import { fail, handler, json, readJson } from "@/lib/api";
import { verifyLoginCode } from "@/lib/auth/service";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { clean, normaliseEmail } from "@/lib/validation";

export const POST = handler(async (request) => {
  const body = await readJson(request);
  const email = normaliseEmail(body.email);
  const code = clean(body.code, 10).replace(/\D/g, "");

  const limit = rateLimit(clientKey(request, `otp-verify:${email}`), 10, 15 * 60 * 1000);
  if (!limit.ok) return fail("Too many attempts. Request a new code.", 429);

  if (code.length !== 6) return fail("Enter the 6-digit code.", 422);

  const result = await verifyLoginCode(email, code);
  if (!result.ok) return fail(result.message ?? "That code is not valid.", 401);

  return json({ ok: true });
});
