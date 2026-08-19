"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useCart } from "@/components/providers/CartProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { Button } from "@/components/ui/Button";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { money } from "@/lib/format";
import type { Product } from "@/lib/types";

export function PurchasePanel({ product }: { product: Product }) {
  const { add, qtyOf } = useCart();
  const { notify } = useToast();
  const router = useRouter();

  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState<"cart" | "buy" | null>(null);

  const inCart = qtyOf(product.id);
  const soldOut = product.stock <= 0;
  const maxQty = Math.min(20, Math.max(product.stock, 1));

  const bulkActive =
    product.bulkPrice !== undefined && product.bulkMinQty !== undefined && qty >= product.bulkMinQty;
  const unit = bulkActive ? (product.bulkPrice as number) : product.price;

  const addToCart = () => {
    setBusy("cart");
    add(product.id, qty);
    notify(`${qty} × ${product.name} added to your cart.`);
    setTimeout(() => setBusy(null), 400);
  };

  const buyNow = () => {
    setBusy("buy");
    add(product.id, qty);
    router.push("/checkout");
  };

  return (
    <div className="rounded-card border border-femi-100 bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
        <span className="font-display text-3xl text-ink">{money(unit * qty)}</span>
        {product.mrp > product.price && (
          <span className="text-base text-ink-faint line-through">{money(product.mrp * qty)}</span>
        )}
        <span className="text-sm text-ink-soft">
          {qty > 1 ? `(${money(unit)} each)` : "incl. all taxes"}
        </span>
      </div>

      {product.bulkPrice !== undefined && product.bulkMinQty !== undefined && (
        <p
          className={`mt-3 rounded-2xl px-4 py-2.5 text-sm ${bulkActive ? "bg-leaf/10 text-leaf" : "bg-femi-50 text-femi-700"}`}
        >
          {bulkActive
            ? `Bulk price applied — ${money(product.bulkPrice)} per pack.`
            : `Buy ${product.bulkMinQty} packs or more and each pack is ${money(product.bulkPrice)}.`}
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-4">
        <QuantityStepper value={qty} onChange={setQty} max={maxQty} />
        <span className="text-sm text-ink-soft">
          {soldOut ? "Out of stock" : `${product.stock} packs available`}
        </span>
      </div>

      <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
        <Button
          variant="secondary"
          size="lg"
          onClick={addToCart}
          disabled={soldOut}
          loading={busy === "cart"}
        >
          Add to cart
        </Button>
        <Button size="lg" onClick={buyNow} disabled={soldOut} loading={busy === "buy"}>
          Buy now
        </Button>
      </div>

      {inCart > 0 && (
        <p className="mt-3 text-center text-xs text-ink-soft">
          {inCart} already in your cart ·{" "}
          <a href="/cart" className="focus-ring font-semibold text-femi-600 underline">
            view cart
          </a>
        </p>
      )}

      <p className="mt-4 text-center text-xs leading-relaxed text-ink-faint">
        You will be asked to sign in before checkout. Orders are confirmed over WhatsApp — nothing is
        charged automatically.
      </p>
    </div>
  );
}
