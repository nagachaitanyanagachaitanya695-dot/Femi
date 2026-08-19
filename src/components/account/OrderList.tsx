import Link from "next/link";

import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusPill } from "@/components/order/StatusPill";
import { formatDate, money } from "@/lib/format";
import type { Order } from "@/lib/types";

export function OrderList({ orders }: { orders: Order[] }) {
  if (orders.length === 0) {
    return (
      <EmptyState
        icon="📦"
        title="No orders yet"
        description="When you place your first order it will appear here, along with its delivery status."
        action={<ButtonLink href="/products">Browse products</ButtonLink>}
      />
    );
  }

  return (
    <ul className="grid gap-4">
      {orders.map((order) => (
        <li
          key={order.id}
          className="rounded-card border border-femi-100 bg-white p-5 transition-shadow hover:shadow-soft"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <Link
                href={`/order/${order.reference}`}
                className="focus-ring font-display text-lg text-ink hover:text-femi-600"
              >
                {order.reference}
              </Link>
              <p className="mt-0.5 text-xs text-ink-faint">{formatDate(order.createdAt)}</p>
            </div>
            <StatusPill status={order.status} />
          </div>

          <ul className="mt-4 grid gap-1 text-sm text-ink-soft">
            {order.lines.map((line) => (
              <li key={line.productId}>
                {line.qty} × {line.name}
              </li>
            ))}
          </ul>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-femi-100 pt-4">
            <span className="font-semibold text-ink">{money(order.totals.total)}</span>
            <div className="flex items-center gap-3 text-sm">
              {order.trackingId && (
                <span className="text-xs text-ink-faint">
                  {order.courier}: {order.trackingId}
                </span>
              )}
              <Link
                href={`/order/${order.reference}`}
                className="focus-ring font-semibold text-femi-600 underline"
              >
                View order
              </Link>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
