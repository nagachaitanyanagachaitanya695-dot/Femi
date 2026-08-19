import { fail, handler, json, readJson } from "@/lib/api";
import { requestPasswordReset, resetPasswordWithCode } from "@/lib/auth/service";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { EMAIL_RE, clean, normaliseEmail, validatePassword } from "@/lib/validation";

/** Step 1: ask for a reset code / reset email. */
export const POST = handler(async (request) => {
  const body = await readJson(request);
  const email = normaliseEmail(body.email);
  if (!EMAIL_RE.test(email)) return fail("Enter a valid email address.", 422);

  const limit = rateLimit(clientKey(request, `reset:${email}`), 4, 15 * 60 * 1000);
  if (!limit.ok) return fail(`Please wait ${limit.retryAfterSeconds}s and try again.`, 429);

  const origin = new URL(request.url).origin;
  const result = await requestPasswordReset(email, origin);
  return json({ ok: true, devCode: result.devCode });
});

/** Step 2: exchange the code for a new password. */
export const PUT = handler(async (request) => {
  const body = await readJson(request);
  const email = normaliseEmail(body.email);
  const code = clean(body.code, 10).replace(/\D/g, "");
  const password = typeof body.password === "string" ? body.password : "";

  const limit = rateLimit(clientKey(request, `reset-verify:${email}`), 10, 15 * 60 * 1000);
  if (!limit.ok) return fail("Too many attempts. Request a new code.", 429);

  const passwordError = validatePassword(password);
  if (passwordError) return fail(passwordError, 422, { errors: { password: passwordError } });
  if (code.length !== 6) return fail("Enter the 6-digit code.", 422);

  const result = await resetPasswordWithCode(email, code, password);
  if (!result.ok) return fail(result.message ?? "Could not reset your password.", 400);

  return json({ ok: true });
});
