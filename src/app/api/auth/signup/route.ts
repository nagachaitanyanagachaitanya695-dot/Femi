import { fail, handler, json, readJson } from "@/lib/api";
import { signUp } from "@/lib/auth/service";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { EMAIL_RE, MOBILE_RE, clean, normaliseEmail, normaliseMobile, validatePassword } from "@/lib/validation";

export const POST = handler(async (request) => {
  const limit = rateLimit(clientKey(request, "signup"), 5, 60 * 60 * 1000);
  if (!limit.ok) return fail("Too many sign-up attempts. Try again later.", 429);

  const body = await readJson(request);
  const fullName = clean(body.fullName, 80);
  const email = normaliseEmail(body.email);
  const mobile = normaliseMobile(body.mobile);
  const password = typeof body.password === "string" ? body.password : "";

  const errors: Record<string, string> = {};
  if (fullName.length < 2) errors.fullName = "Enter your full name.";
  if (!EMAIL_RE.test(email)) errors.email = "Enter a valid email address.";
  if (!MOBILE_RE.test(mobile)) errors.mobile = "Enter a valid 10-digit mobile number.";
  const passwordError = validatePassword(password);
  if (passwordError) errors.password = passwordError;

  if (Object.keys(errors).length > 0) return fail("Please check the form.", 422, { errors });

  const result = await signUp({ fullName, email, mobile, password });
  if (!result.ok) return fail(result.message ?? "Could not create your account.", 400);

  return json({ ok: true, needsEmailConfirmation: result.needsEmailConfirmation ?? false });
});
