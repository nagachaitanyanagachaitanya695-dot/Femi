import { site } from "./site";
import { rupees } from "./format";
import type { Order } from "./types";

/**
 * Builds the click-to-chat message for an order.
 *
 * The message is generated on the server from the stored order (which already
 * has server-validated prices) and handed to the browser, so what the customer
 * sends can never disagree with what we recorded.
 */
export function buildOrderMessage(order: Order): string {
  const productLines = order.lines
    .map((l) => `- ${l.name} x ${l.qty} — ₹${rupees(l.lineTotal)}`)
    .join("\n");

  const addr = order.address;
  const address = [addr.line1, addr.line2, addr.city, addr.state].filter(Boolean).join(", ");

  return [
    `Hello ${site.name}, I would like to place an order.`,
    "",
    `Order ID: ${order.reference}`,
    "",
    "Products:",
    productLines,
    "",
    `Subtotal: ₹${rupees(order.totals.subtotal)}`,
    `Delivery: ₹${rupees(order.totals.deliveryFee)}`,
    `Total: ₹${rupees(order.totals.total)}`,
    "",
    `Customer Name: ${order.customerName}`,
    `Mobile: ${order.mobile}`,
    `Email: ${order.email}`,
    `Delivery Address: ${address}`,
    `PIN Code: ${addr.pincode}`,
    ...(order.notes ? ["", `Note: ${order.notes}`] : []),
    "",
    "Please confirm my order and payment details.",
  ].join("\n");
}

/** wa.me click-to-chat URL with the message properly percent-encoded. */
export function whatsappLink(message: string, number: string = site.whatsappNumber): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function orderWhatsappLink(order: Order): string {
  return whatsappLink(buildOrderMessage(order));
}

/** Generic "talk to us" link used by the header, footer and help sections. */
export function supportLink(
  message = `Hello ${site.name}, I have a question about your products.`,
): string {
  return whatsappLink(message);
}
