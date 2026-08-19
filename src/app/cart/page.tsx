import type { Metadata } from "next";

import { CartView } from "@/components/cart/CartView";

export const metadata: Metadata = {
  title: "Your cart",
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return (
    <div className="container-page py-10 sm:py-14">
      <h1 className="font-display text-4xl leading-tight text-ink sm:text-5xl">Your cart</h1>
      <p className="mt-2 text-sm text-ink-soft">
        Prices and totals below are calculated on our server, so they always match your order.
      </p>
      <div className="mt-8">
        <CartView />
      </div>
    </div>
  );
}
