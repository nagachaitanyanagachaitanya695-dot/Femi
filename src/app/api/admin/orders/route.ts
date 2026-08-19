import { handler, json } from "@/lib/api";
import { requireAdmin } from "@/lib/auth/current-user";
import { getStore } from "@/lib/db";

export const dynamic = "force-dynamic";

export const GET = handler(async () => {
  await requireAdmin();
  const orders = await getStore().listOrders();
  return json({ orders });
});
