import { handler, json } from "@/lib/api";
import { getStore } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Public catalogue. Only active products, and only fields safe to publish. */
export const GET = handler(async () => {
  const products = await getStore().listProducts();
  return json({ products });
});
