import { fail, handler, json } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/current-user";
import { hasOrderAccess } from "@/lib/auth/order-access";
import { getStore } from "@/lib/db";
import { buildOrderMessage, whatsappLink } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: Context) {
  return handler(async () => {
    const user = await getCurrentUser();
    const { id } = await context.params;

    const order = await getStore().getOrder(id);
    if (!order) return fail("Order not found.", 404);

    const allowed =
      (user && order.userId === user.id) ||
      user?.role === "admin" ||
      (await hasOrderAccess(order.id, order.reference));

    // Same 404 either way, so order references cannot be probed.
    if (!allowed) return fail("Order not found.", 404);

    return json({ order, whatsappUrl: whatsappLink(buildOrderMessage(order)) });
  })(request, undefined);
}
