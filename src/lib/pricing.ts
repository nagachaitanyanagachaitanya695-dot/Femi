import { site } from "./site";
import type { CartLine, OrderTotals, PricedLine, Product } from "./types";

/**
 * Pricing is computed here and *only* here, from catalogue records that the
 * server loaded itself. Nothing the browser sends about money is trusted: the
 * checkout API accepts product ids and quantities, and recomputes everything.
 */

export const MAX_QTY_PER_LINE = 20;

export function priceForLine(product: Product, qty: number): { unitPrice: number; bulkApplied: boolean } {
  const bulkEligible =
    typeof product.bulkPrice === "number" &&
    typeof product.bulkMinQty === "number" &&
    qty >= product.bulkMinQty;

  return bulkEligible
    ? { unitPrice: product.bulkPrice as number, bulkApplied: true }
    : { unitPrice: product.price, bulkApplied: false };
}

export function buildPricedLines(lines: CartLine[], catalog: Product[]): PricedLine[] {
  const byId = new Map(catalog.map((p) => [p.id, p]));
  const priced: PricedLine[] = [];

  for (const line of lines) {
    const product = byId.get(line.productId);
    if (!product || !product.active) continue;

    const qty = clampQty(line.qty);
    if (qty <= 0) continue;

    const { unitPrice, bulkApplied } = priceForLine(product, qty);

    priced.push({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      size: product.size,
      length: product.length,
      padCount: product.padCount,
      qty,
      unitPrice,
      unitMrp: product.mrp,
      lineTotal: unitPrice * qty,
      bulkApplied,
    });
  }

  return priced;
}

export function computeTotals(lines: PricedLine[]): OrderTotals {
  const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);
  const mrpTotal = lines.reduce((sum, l) => sum + l.unitMrp * l.qty, 0);
  const isEmpty = lines.length === 0;
  const freeDeliveryApplied = !isEmpty && subtotal >= site.delivery.freeAbove;
  const deliveryFee = isEmpty || freeDeliveryApplied ? 0 : site.delivery.fee;

  return {
    subtotal,
    savings: Math.max(0, mrpTotal - subtotal),
    deliveryFee,
    total: subtotal + deliveryFee,
    freeDeliveryApplied,
  };
}

export function priceCart(lines: CartLine[], catalog: Product[]) {
  const priced = buildPricedLines(lines, catalog);
  return { lines: priced, totals: computeTotals(priced) };
}

export function clampQty(qty: unknown): number {
  const n = Math.floor(Number(qty));
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.min(n, MAX_QTY_PER_LINE);
}
