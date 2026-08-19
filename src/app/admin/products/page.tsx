import { AdminProducts } from "@/components/admin/AdminProducts";
import { getStore } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await getStore().listProducts({ includeInactive: true });

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-display text-3xl text-ink sm:text-4xl">Products</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Add products, change prices and stock, or hide something from the store. Prices you set
          here are the prices the checkout charges.
        </p>
      </div>
      <AdminProducts initialProducts={products} />
    </div>
  );
}
