import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { OrderList } from "@/components/account/OrderList";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getStore } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your orders",
  robots: { index: false, follow: false },
};

export default async function OrdersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account/orders");

  const orders = await getStore().listOrdersForUser(user.id);

  return (
    <div className="container-page py-10 sm:py-14">
      <h1 className="font-display text-4xl leading-tight text-ink sm:text-5xl">Your orders</h1>
      <p className="mt-2 text-sm text-ink-soft">
        Every order you have placed, with its current status.
      </p>
      <div className="mt-8">
        <OrderList orders={orders} />
      </div>
    </div>
  );
}
