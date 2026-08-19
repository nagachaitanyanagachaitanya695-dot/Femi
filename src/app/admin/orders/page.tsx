import { AdminOrders } from "@/components/admin/AdminOrders";
import { getStore } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await getStore().listOrders();

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-display text-3xl text-ink sm:text-4xl">Orders</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Every order with the customer&apos;s details. Move an order through the flow as you confirm,
          pack and ship it, and add the courier tracking ID so the customer can follow it.
        </p>
      </div>
      <AdminOrders initialOrders={orders} />
    </div>
  );
}
