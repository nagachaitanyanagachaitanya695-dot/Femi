import { fail, handler, json } from "@/lib/api";
import { requireUser } from "@/lib/auth/current-user";
import { getStore } from "@/lib/db";
import { buildOrderMessage, whatsappLink } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: Context) {
  return handler(async () => {
    const user = await requireUser();
    const { id } = await context.params;

    const order = await getStore().getOrder(id);
    // A customer may only read their own order; admins may read any.
    if (!order || (order.userId !== user.id && user.role !== "admin")) {
      return fail("Order not found.", 404);
    }

    return json({ order, whatsappUrl: whatsappLink(buildOrderMessage(order)) });
  })(request, undefined);
}
