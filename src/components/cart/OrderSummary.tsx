import { money } from "@/lib/format";
import { site } from "@/lib/site";
import type { OrderTotals } from "@/lib/types";

export function OrderSummary({
  totals,
  pricing = false,
  title = "Order summary",
}: {
  totals: OrderTotals;
  pricing?: boolean;
  title?: string;
}) {
  const remaining = site.delivery.freeAbove - totals.subtotal;

  return (
    <div className="rounded-card border border-femi-100 bg-white p-5 sm:p-6" aria-busy={pricing}>
      <h2 className="font-display text-xl text-ink">{title}</h2>

      <dl className="mt-4 grid gap-2.5 text-sm">
        <div className="flex justify-between">
          <dt className="text-ink-soft">Subtotal</dt>
          <dd className="font-medium text-ink tabular-nums">{money(totals.subtotal)}</dd>
        </div>

        {totals.savings > 0 && (
          <div className="flex justify-between">
            <dt className="text-leaf">You save</dt>
            <dd className="font-medium text-leaf tabular-nums">−{money(totals.savings)}</dd>
          </div>
        )}

        <div className="flex justify-between">
          <dt className="text-ink-soft">
            Delivery
            <span className="block text-xs text-ink-faint">via {site.courier.name}</span>
          </dt>
          <dd className="font-medium text-ink tabular-nums">
            {totals.freeDeliveryApplied ? (
              <span className="text-leaf">Free</span>
            ) : (
              money(totals.deliveryFee)
            )}
          </dd>
        </div>

        <div className="mt-2 flex items-baseline justify-between border-t border-femi-100 pt-3">
          <dt className="font-display text-lg text-ink">Total</dt>
          <dd className="font-display text-2xl text-ink tabular-nums">{money(totals.total)}</dd>
        </div>
      </dl>

      {totals.subtotal > 0 && remaining > 0 && (
        <p className="mt-4 rounded-2xl bg-femi-50 px-4 py-3 text-xs leading-relaxed text-femi-700">
          Add {money(remaining)} more for free delivery.
        </p>
      )}
    </div>
  );
}
