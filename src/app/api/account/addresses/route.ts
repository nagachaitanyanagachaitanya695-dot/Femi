import { fail, handler, json, readJson } from "@/lib/api";
import { requireUser } from "@/lib/auth/current-user";
import { getStore } from "@/lib/db";
import { clean, validateCheckout } from "@/lib/validation";

export const dynamic = "force-dynamic";

export const GET = handler(async () => {
  const user = await requireUser();
  const addresses = await getStore().listAddresses(user.id);
  return json({ addresses });
});

export const POST = handler(async (request) => {
  const user = await requireUser();
  const body = await readJson(request);

  const { ok, errors, value } = validateCheckout(body);
  if (!ok) return fail("Please check the address.", 422, { errors });

  const existing = await getStore().listAddresses(user.id);
  if (existing.length >= 10 && !body.id) {
    return fail("You can save up to 10 addresses. Remove one first.", 409);
  }

  const address = await getStore().saveAddress(user.id, {
    id: typeof body.id === "string" && body.id ? body.id : undefined,
    label: clean(body.label, 40) || "Home",
    fullName: value.fullName,
    mobile: value.mobile,
    line1: value.line1,
    line2: value.line2 || undefined,
    city: value.city,
    state: value.state,
    pincode: value.pincode,
  });

  return json({ address }, { status: 201 });
});
