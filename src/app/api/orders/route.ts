import { fail, handler, json, readJson } from "@/lib/api";
import { getCurrentUser, requireUser } from "@/lib/auth/current-user";
import { grantOrderAccess } from "@/lib/auth/order-access";
import { getStore } from "@/lib/db";
import { StoreConfigError } from "@/lib/db/errors";
import { site } from "@/lib/site";
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

/**
 * Place an order. Guests are allowed: an account is optional, and a signed-in
 * customer simply gets the order attached to their account.
 */
export const POST = handler(async (request) => {
  const user = await getCurrentUser();

  // Guests are only identifiable by IP, but the limit cannot be tight: Indian
  // mobile networks put many subscribers behind one address via CGNAT, so a
  // handful of orders can legitimately share an IP. Nothing is charged here
  // either — an order is a lead until it is confirmed in chat — so the cost of
  // a spam order is far lower than the cost of turning away a real customer.
  const limit = user
    ? rateLimit(clientKey(request, `order:${user.id}`), 20, 10 * 60 * 1000)
    : rateLimit(clientKey(request, "order:guest"), 20, 10 * 60 * 1000);
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

    // Let this browser read the confirmation page for the order it just
    // created — the only way a guest can see it.
    //
    // Best-effort on purpose. Granting access signs a cookie, so it throws
    // when AUTH_SECRET is unset in production — and the order is already
    // saved by the time it runs. Letting that escape returned a 500 to a
    // customer whose order had actually gone through, so they retried and
    // ordered twice. Losing the confirmation page is much cheaper than
    // losing the sale.
    try {
      await grantOrderAccess(order.id, order.reference);
    } catch (error) {
      console.error("[femi][orders] could not grant guest order access:", error);
    }

    return json(
      {
        order,
        whatsappUrl: whatsappLink(buildOrderMessage(order)),
      },
      { status: 201 },
    );
  } catch (error) {
    // Something the customer can fix themselves — out of stock, empty cart.
    if (error instanceof OrderError) return fail(error.message, error.status);

    // Anything else is our problem: a missing service-role key, a database
    // that is down or unreachable, an outright bug. Whatever the cause, a bare
    // "something went wrong" at the final step of checkout just loses the
    // sale. Give the customer a way to complete the order anyway, and keep the
    // real reason — which may name configuration — in the server log only.
    const reason = error instanceof StoreConfigError ? error.message : error;
    console.error("[femi][orders] could not place order:", reason);

    return fail(
      `We could not save your order just now. Please send it to us on WhatsApp at ${site.whatsappDisplay} and we will confirm it right away.`,
      503,
    );
  }
});
