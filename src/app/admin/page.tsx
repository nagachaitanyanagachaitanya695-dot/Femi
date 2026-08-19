import Link from "next/link";

import { StatusPill } from "@/components/order/StatusPill";
import { getStore } from "@/lib/db";
import { formatDate, money } from "@/lib/format";
import { ORDER_STATUSES } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const store = getStore();
  const [orders, products] = await Promise.all([
    store.listOrders(),
    store.listProducts({ includeInactive: true }),
  ]);

  const confirmedRevenue = orders
    .filter((order) => order.status !== "cancelled" && order.status !== "pending")
    .reduce((sum, order) => sum + order.totals.total, 0);

  const pending = orders.filter((order) => order.status === "pending").length;
  const lowStock = products.filter((product) => product.active && product.stock < 20);

  const byStatus = ORDER_STATUSES.map((status) => ({
    status,
    count: orders.filter((order) => order.status === status).length,
  }));

  const stats = [
    { label: "Total orders", value: String(orders.length) },
    { label: "Awaiting confirmation", value: String(pending) },
    { label: "Confirmed revenue", value: money(confirmedRevenue) },
    { label: "Active products", value: String(products.filter((p) => p.active).length) },
  ];

  return (
    <div className="grid gap-8">
      <div>
        <h1 className="font-display text-3xl text-ink sm:text-4xl">Store overview</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Revenue counts orders you have confirmed — pending orders are excluded until you confirm
          them on WhatsApp.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-card border border-femi-100 bg-white p-5">
            <p className="text-xs font-semibold tracking-wide text-ink-faint uppercase">{stat.label}</p>
            <p className="mt-2 font-display text-2xl text-ink">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-start">
        <section className="rounded-card border border-femi-100 bg-white p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-xl text-ink">Latest orders</h2>
            <Link href="/admin/orders" className="focus-ring text-sm font-semibold text-femi-600 underline">
              Manage orders
            </Link>
          </div>
          {orders.length === 0 ? (
            <p className="mt-4 text-sm text-ink-soft">No orders yet.</p>
          ) : (
            <ul className="mt-4 grid gap-3">
              {orders.slice(0, 6).map((order) => (
                <li key={order.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-femi-50 pb-3 last:border-0">
                  <div className="min-w-0">
                    <p className="font-semibold text-ink">{order.reference}</p>
                    <p className="text-xs text-ink-faint">
                      {order.customerName} · {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-ink tabular-nums">
                      {money(order.totals.total)}
                    </span>
                    <StatusPill status={order.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="grid gap-6">
          <section className="rounded-card border border-femi-100 bg-white p-6">
            <h2 className="font-display text-xl text-ink">Orders by status</h2>
            <ul className="mt-4 grid gap-2 text-sm">
              {byStatus.map((row) => (
                <li key={row.status} className="flex items-center justify-between gap-3">
                  <StatusPill status={row.status} />
                  <span className="font-semibold text-ink tabular-nums">{row.count}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-card border border-femi-100 bg-white p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-xl text-ink">Low stock</h2>
              <Link href="/admin/products" className="focus-ring text-sm font-semibold text-femi-600 underline">
                Edit stock
              </Link>
            </div>
            {lowStock.length === 0 ? (
              <p className="mt-4 text-sm text-ink-soft">Everything is comfortably stocked.</p>
            ) : (
              <ul className="mt-4 grid gap-2 text-sm">
                {lowStock.map((product) => (
                  <li key={product.id} className="flex items-center justify-between gap-3">
                    <span className="min-w-0 truncate text-ink-soft">{product.name}</span>
                    <span className="font-semibold text-femi-700 tabular-nums">{product.stock}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
