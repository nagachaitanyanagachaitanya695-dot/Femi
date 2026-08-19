"use client";

import { useMemo, useState } from "react";

import { StatusPill } from "@/components/order/StatusPill";
import { useToast } from "@/components/providers/ToastProvider";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate, money } from "@/lib/format";
import { site } from "@/lib/site";
import { ORDER_STATUSES, type Order, type OrderStatus } from "@/lib/types";

export function AdminOrders({ initialOrders }: { initialOrders: Order[] }) {
  const { notify } = useToast();
  const [orders, setOrders] = useState(initialOrders);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [tracking, setTracking] = useState<Record<string, string>>({});

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return orders.filter((order) => {
      if (filter !== "all" && order.status !== filter) return false;
      if (!needle) return true;
      return [order.reference, order.customerName, order.mobile, order.email, order.address.pincode]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [orders, filter, query]);

  const patch = async (order: Order, body: Record<string, unknown>, message: string) => {
    setBusy(order.id);
    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) {
        notify(data.error ?? "Could not update the order.", "error");
        return;
      }
      const updated = data.order as Order;
      setOrders((current) => current.map((o) => (o.id === updated.id ? updated : o)));
      notify(message);
    } catch {
      notify("Network problem. Please try again.", "error");
    } finally {
      setBusy(null);
    }
  };

  if (orders.length === 0) {
    return <EmptyState icon="📋" title="No orders yet" description="New orders will appear here as customers check out." />;
  }

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="order-search" className="sr-only">
          Search orders
        </label>
        <input
          id="order-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by order ID, name, mobile or PIN…"
          className="focus-ring h-11 min-w-64 flex-1 rounded-full border border-femi-200 bg-white px-4 text-sm text-ink"
        />
        <div className="flex flex-wrap gap-1.5">
          {(["all", ...ORDER_STATUSES] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilter(status)}
              aria-pressed={filter === status}
              className={`focus-ring rounded-full border px-3 py-1.5 text-xs font-semibold uppercase transition ${
                filter === status
                  ? "border-femi-500 bg-femi-500 text-white"
                  : "border-femi-200 bg-white text-ink-soft hover:border-femi-300"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-ink-soft" aria-live="polite">
        {visible.length} of {orders.length} orders
      </p>

      <ul className="grid gap-4">
        {visible.map((order) => {
          const open = expanded === order.id;
          return (
            <li key={order.id} className="rounded-card border border-femi-100 bg-white">
              <div className="flex flex-wrap items-start justify-between gap-4 p-5">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-display text-lg text-ink">{order.reference}</span>
                    <StatusPill status={order.status} />
                  </div>
                  <p className="mt-1 text-sm text-ink-soft">
                    {order.customerName} · {order.mobile} · {order.address.city},{" "}
                    {order.address.pincode}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-faint">{formatDate(order.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-ink tabular-nums">
                    {money(order.totals.total)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpanded(open ? null : order.id)}
                    aria-expanded={open}
                  >
                    {open ? "Hide" : "Details"}
                  </Button>
                </div>
              </div>

              {open && (
                <div className="grid gap-6 border-t border-femi-100 p-5 lg:grid-cols-2">
                  <div>
                    <h3 className="text-sm font-bold text-ink">Items</h3>
                    <ul className="mt-3 grid gap-2 text-sm">
                      {order.lines.map((line) => (
                        <li key={line.productId} className="flex justify-between gap-3">
                          <span className="text-ink-soft">
                            {line.qty} × {line.name}
                          </span>
                          <span className="tabular-nums">{money(line.lineTotal)}</span>
                        </li>
                      ))}
                    </ul>
                    <dl className="mt-4 grid gap-1 border-t border-femi-50 pt-3 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-ink-soft">Subtotal</dt>
                        <dd className="tabular-nums">{money(order.totals.subtotal)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-ink-soft">Delivery</dt>
                        <dd className="tabular-nums">{money(order.totals.deliveryFee)}</dd>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <dt>Total</dt>
                        <dd className="tabular-nums">{money(order.totals.total)}</dd>
                      </div>
                    </dl>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-ink">Customer</h3>
                    <address className="mt-3 text-sm leading-relaxed text-ink-soft not-italic">
                      {order.customerName}
                      <br />
                      {order.address.line1}
                      {order.address.line2 && <>, {order.address.line2}</>}
                      <br />
                      {order.address.city}, {order.address.state} {order.address.pincode}
                      <br />
                      <a href={`tel:+91${order.mobile}`} className="focus-ring underline">
                        +91 {order.mobile}
                      </a>
                      <br />
                      <a href={`mailto:${order.email}`} className="focus-ring underline break-all">
                        {order.email}
                      </a>
                    </address>
                    {order.notes && (
                      <p className="mt-3 rounded-2xl bg-femi-50 px-4 py-3 text-xs text-femi-700">
                        Note: {order.notes}
                      </p>
                    )}
                    <a
                      href={`https://wa.me/91${order.mobile}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="focus-ring mt-3 inline-block text-sm font-semibold text-femi-600 underline"
                    >
                      Message customer on WhatsApp
                    </a>
                  </div>

                  <div className="lg:col-span-2">
                    <h3 className="text-sm font-bold text-ink">Update status</h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {ORDER_STATUSES.map((status) => (
                        <button
                          key={status}
                          type="button"
                          disabled={busy === order.id || order.status === status}
                          onClick={() => patch(order, { status }, `${order.reference} marked ${status}.`)}
                          className={`focus-ring rounded-full border px-4 py-2 text-xs font-semibold uppercase transition disabled:opacity-50 ${
                            order.status === status
                              ? "border-femi-500 bg-femi-500 text-white"
                              : "border-femi-200 bg-white text-ink-soft hover:border-femi-400 hover:text-femi-700"
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>

                    <div className="mt-4 flex flex-wrap items-end gap-3">
                      <div className="flex-1">
                        <label
                          htmlFor={`tracking-${order.id}`}
                          className="block text-sm font-semibold text-ink"
                        >
                          {site.courier.name} tracking ID
                        </label>
                        <input
                          id={`tracking-${order.id}`}
                          value={tracking[order.id] ?? order.trackingId ?? ""}
                          onChange={(event) =>
                            setTracking((current) => ({ ...current, [order.id]: event.target.value }))
                          }
                          placeholder="e.g. 1234567890123"
                          className="focus-ring mt-1.5 h-11 w-full rounded-2xl border border-femi-200 bg-white px-4 text-sm text-ink"
                        />
                      </div>
                      <Button
                        variant="secondary"
                        loading={busy === order.id}
                        onClick={() =>
                          patch(
                            order,
                            { trackingId: tracking[order.id] ?? order.trackingId ?? "" },
                            "Tracking ID saved.",
                          )
                        }
                      >
                        Save tracking
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
