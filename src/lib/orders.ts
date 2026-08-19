import "server-only";

import { randomBytes, randomUUID } from "node:crypto";

import type { AuthUser } from "./auth/current-user";
import { getStore } from "./db";
import { priceCart } from "./pricing";
import { site } from "./site";
import type { CartLine, Order } from "./types";
import type { CheckoutInput } from "./validation";

/** Crockford-style alphabet: no I, L, O or U, so references are easy to read aloud. */
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

export function generateOrderReference(): string {
  const bytes = randomBytes(6);
  let out = "";
  for (const byte of bytes) out += ALPHABET[byte % ALPHABET.length];
  return `FEMI-${out}`;
}

export class OrderError extends Error {
  constructor(
    message: string,
    readonly status = 400,
  ) {
    super(message);
    this.name = "OrderError";
  }
}

/**
 * Creates an order from a cart.
 *
 * The browser sends product ids and quantities and nothing else. Prices, bulk
 * discounts, the delivery fee and the total are all recomputed here from the
 * catalogue the server loaded, and stock is checked before anything is stored.
 */
export async function createOrder(
  user: AuthUser,
  cart: CartLine[],
  details: CheckoutInput,
): Promise<Order> {
  const store = getStore();
  const catalog = await store.listProducts();
  const { lines, totals } = priceCart(cart, catalog);

  if (lines.length === 0) {
    throw new OrderError("Your cart is empty or the items are no longer available.", 422);
  }

  for (const line of lines) {
    const product = catalog.find((p) => p.id === line.productId);
    if (!product) throw new OrderError(`${line.name} is no longer available.`, 409);
    if (product.stock < line.qty) {
      throw new OrderError(
        `Only ${product.stock} left of ${product.name}. Please reduce the quantity.`,
        409,
      );
    }
  }

  const now = new Date().toISOString();
  const order: Order = {
    id: randomUUID(),
    reference: generateOrderReference(),
    userId: user.id,
    status: "pending",
    customerName: details.fullName,
    mobile: details.mobile,
    email: details.email,
    address: {
      fullName: details.fullName,
      mobile: details.mobile,
      line1: details.line1,
      line2: details.line2 || undefined,
      city: details.city,
      state: details.state,
      pincode: details.pincode,
    },
    notes: details.notes || undefined,
    lines,
    totals,
    courier: site.courier.name,
    trackingId: null,
    createdAt: now,
    updatedAt: now,
  };

  return store.createOrder(order);
}
