import { Suspense } from "react";
import type { Metadata } from "next";

import { ProductBrowser } from "@/components/product/ProductBrowser";
import { ProductCardSkeleton } from "@/components/product/ProductCard";
import { getStore } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop all pads",
  description:
    "Browse Femi sanitary pads — L 290mm, XL 320mm and XXL 410mm packs, plus value combos with free delivery over ₹499.",
};

export default async function ProductsPage() {
  const products = await getStore().listProducts();

  return (
    <div className="container-page py-10 sm:py-14">
      <header className="mb-8 max-w-2xl">
        <p className="text-xs font-semibold tracking-[0.2em] text-femi-600 uppercase">Shop</p>
        <h1 className="mt-2 font-display text-4xl leading-tight text-ink sm:text-5xl">
          All Femi products
        </h1>
        <p className="mt-3 text-base leading-relaxed text-ink-soft">
          Every pack is ultra-thin with a soft cotton finish. Choose your length, your pack size, and
          we will get it to you.
        </p>
      </header>

      <Suspense
        fallback={
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        }
      >
        <ProductBrowser products={products} />
      </Suspense>
    </div>
  );
}
