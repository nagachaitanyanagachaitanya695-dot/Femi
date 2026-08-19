import { fail, handler, json, readJson } from "@/lib/api";
import { requireAdmin } from "@/lib/auth/current-user";
import { getStore } from "@/lib/db";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/types";
import { clean } from "@/lib/validation";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  return handler(async (req) => {
    await requireAdmin();
    const { id } = await context.params;
    const body = await readJson(req);

    const patch: { status?: OrderStatus; trackingId?: string | null } = {};

    if (body.status !== undefined) {
      if (!ORDER_STATUSES.includes(body.status as OrderStatus)) {
        return fail("Unknown order status.", 422);
      }
      patch.status = body.status as OrderStatus;
    }
    if (body.trackingId !== undefined) {
      patch.trackingId = clean(body.trackingId, 60) || null;
    }

    const order = await getStore().updateOrder(id, patch);
    if (!order) return fail("Order not found.", 404);

    return json({ order });
  })(request, undefined);
}
