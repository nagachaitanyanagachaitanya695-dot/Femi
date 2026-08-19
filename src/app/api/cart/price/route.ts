import { handler, json, readJson } from "@/lib/api";
import { getStore } from "@/lib/db";
import { clampQty, priceCart } from "@/lib/pricing";
import type { CartLine } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * Re-prices a cart on the server.
 *
 * The cart page shows *these* numbers rather than anything computed in the
 * browser, so what the customer sees is always what the order API will charge.
 */
export const POST = handler(async (request) => {
  const body = await readJson(request);
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

  const catalog = await getStore().listProducts();
  const { lines, totals } = priceCart(cart, catalog);

  return json({ lines, totals });
});
