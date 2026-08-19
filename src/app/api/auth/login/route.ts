import { fail, handler, json, readJson } from "@/lib/api";
import { signInWithPassword } from "@/lib/auth/service";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { normaliseEmail } from "@/lib/validation";

export const POST = handler(async (request) => {
  const body = await readJson(request);
  const email = normaliseEmail(body.email);
  const password = typeof body.password === "string" ? body.password : "";

  const limit = rateLimit(clientKey(request, `login:${email}`), 8, 15 * 60 * 1000);
  if (!limit.ok) {
    return fail(`Too many attempts. Try again in ${limit.retryAfterSeconds}s.`, 429);
  }

  if (!email || !password) return fail("Enter your email and password.", 422);

  const result = await signInWithPassword(email, password);
  if (!result.ok) return fail(result.message ?? "Incorrect email or password.", 401);

  return json({ ok: true });
});
