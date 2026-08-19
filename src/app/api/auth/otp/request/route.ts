import { fail, handler, json, readJson } from "@/lib/api";
import { requestLoginCode } from "@/lib/auth/service";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { EMAIL_RE, normaliseEmail } from "@/lib/validation";

export const POST = handler(async (request) => {
  const body = await readJson(request);
  const email = normaliseEmail(body.email);
  if (!EMAIL_RE.test(email)) return fail("Enter a valid email address.", 422);

  const limit = rateLimit(clientKey(request, `otp:${email}`), 4, 15 * 60 * 1000);
  if (!limit.ok) {
    return fail(`Please wait ${limit.retryAfterSeconds}s before requesting another code.`, 429);
  }

  const result = await requestLoginCode(email);
  if (!result.ok) return fail(result.message ?? "Could not send a code.", 400);

  // The response is identical whether or not the address is registered.
  return json({ ok: true, devCode: result.devCode });
});
