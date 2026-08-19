import { fail, handler, json, readJson } from "@/lib/api";
import { requireUser } from "@/lib/auth/current-user";
import { updatePassword } from "@/lib/auth/service";
import { validatePassword } from "@/lib/validation";

export const POST = handler(async (request) => {
  const user = await requireUser();
  const body = await readJson(request);
  const password = typeof body.password === "string" ? body.password : "";

  const error = validatePassword(password);
  if (error) return fail(error, 422, { errors: { password: error } });

  const result = await updatePassword(user.id, password);
  if (!result.ok) return fail(result.message ?? "Could not update your password.", 400);

  return json({ ok: true });
});
