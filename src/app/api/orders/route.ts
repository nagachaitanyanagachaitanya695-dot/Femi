import { fail, handler, json, readJson } from "@/lib/api";
import { requireUser } from "@/lib/auth/current-user";
import { getStore } from "@/lib/db";
import { OrderError, createOrder } from "@/lib/orders";
import { clampQty } from "@/lib/pricing";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import type { CartLine } from "@/lib/types";
import { validateCheckout } from "@/lib/validation";
import { buildOrderMessage, whatsappLink } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

/** The signed-in customer's own orders. */
export const GET = handler(async () => {
  const user = await requireUser();
  const orders = await getStore().listOrdersForUser(user.id);
  return json({ orders });
});

/** Place an order. Authentication is required — this is the checkout gate. */
export const POST = handler(async (request) => {
  const user = await requireUser();

  const limit = rateLimit(clientKey(request, `order:${user.id}`), 10, 10 * 60 * 1000);
  if (!limit.ok) return fail("Too many orders in a short time. Please try again shortly.", 429);

  const body = await readJson(request);
  const { ok, errors, value } = validateCheckout(body);
  if (!ok) return fail("Please check your delivery details.", 422, { errors });

  const rawItems = Array.isArray(body.items) ? body.items : [];
  const cart: CartLine[] = rawItems
    .map((item: unknown) => {
      const record = (item ?? {}) as Record<string, unknown>;
      return {
        productId: typeof record.productId === "string" ? record.productId : "",
        qty: clampQty(record.qty),
      };
    })
    .filter((line: CartLine) => line.productId && line.qty > 0)
    .slice(0, 30);

  if (cart.length === 0) return fail("Your cart is empty.", 422);

  try {
    const order = await createOrder(user, cart, value);
    return json(
      {
        order,
        whatsappUrl: whatsappLink(buildOrderMessage(order)),
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof OrderError) return fail(error.message, error.status);
    throw error;
  }
});
