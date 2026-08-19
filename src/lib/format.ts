const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/** ₹1,234 — no paise, because every price in the catalogue is a whole rupee. */
export function money(amount: number): string {
  return inr.format(Math.round(amount));
}

/** "₹189" without the currency symbol, for places that print their own. */
export function rupees(amount: number): string {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Math.round(amount));
}

export function discountPercent(mrp: number, price: number): number {
  if (mrp <= 0 || price >= mrp) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function pricePerPad(price: number, padCount: number): string {
  if (!padCount) return "";
  return `₹${(price / padCount).toFixed(1)} per pad`;
}
