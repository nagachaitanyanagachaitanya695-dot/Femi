"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useCart } from "@/components/providers/CartProvider";
import { Button, ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { money } from "@/lib/format";
import { site } from "@/lib/site";

import { OrderSummary } from "./OrderSummary";

export function CartView() {
  const { items, lines, totals, setQty, remove, ready, pricing } = useCart();
  const router = useRouter();

  if (!ready) {
    return (
      <div className="grid gap-4">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="skeleton h-32 rounded-card" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon="🛒"
        title="Your cart is empty"
        description="Once you add a pack it will show up here, along with your delivery total."
        action={<ButtonLink href="/products" size="lg">Start shopping</ButtonLink>}
      />
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-start">
      <ul className="grid gap-4">
        {lines.length === 0 && pricing && (
          <li className="skeleton h-32 rounded-card" aria-label="Loading your cart" />
        )}

        {lines.map((line) => (
          <li
            key={line.productId}
            className="flex flex-col gap-4 rounded-card border border-femi-100 bg-white p-4 sm:flex-row sm:items-center sm:p-5"
          >
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-lg leading-snug text-ink">
                <Link href={`/products/${line.slug}`} className="focus-ring hover:text-femi-600">
                  {line.name}
                </Link>
              </h2>
              <p className="mt-1 text-sm text-ink-soft">
                {line.size} · {line.length} · {line.padCount} pads
              </p>
              <p className="mt-1 text-sm text-ink-soft">
                {money(line.unitPrice)} each
                {line.bulkApplied && (
                  <span className="ml-2 rounded-full bg-leaf/10 px-2 py-0.5 text-xs font-semibold text-leaf">
                    bulk price
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
              <QuantityStepper
                value={line.qty}
                onChange={(next) => setQty(line.productId, next)}
                min={1}
                size="sm"
                label={`Quantity for ${line.name}`}
              />
              <div className="text-right">
                <p className="font-semibold text-ink">{money(line.lineTotal)}</p>
                <button
                  type="button"
                  onClick={() => remove(line.productId)}
                  className="focus-ring mt-1 text-xs font-medium text-ink-faint underline transition hover:text-femi-600"
                >
                  Remove
                </button>
              </div>
            </div>
          </li>
        ))}

        <li className="pt-2">
          <ButtonLink href="/products" variant="ghost">
            ← Continue shopping
          </ButtonLink>
        </li>
      </ul>

      <div className="lg:sticky lg:top-24">
        <OrderSummary totals={totals} pricing={pricing} />
        <Button
          size="lg"
          className="mt-4 w-full"
          disabled={lines.length === 0}
          loading={pricing}
          onClick={() => router.push("/checkout")}
        >
          Proceed to checkout
        </Button>
        <p className="mt-3 text-center text-xs leading-relaxed text-ink-faint">
          Sign in required at checkout. Orders ship with {site.courier.name}.
        </p>
      </div>
    </div>
  );
}
