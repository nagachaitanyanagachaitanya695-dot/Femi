"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/components/providers/CartProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { discountPercent, money, pricePerPad } from "@/lib/format";
import type { Product } from "@/lib/types";

import { PackVisual } from "./PackVisual";
import { useTilt } from "./useTilt";

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const { notify } = useToast();
  const router = useRouter();
  const tilt = useTilt();
  const [busy, setBusy] = useState<"cart" | "buy" | null>(null);

  const off = discountPercent(product.mrp, product.price);
  const soldOut = product.stock <= 0;

  const addToCart = () => {
    setBusy("cart");
    add(product.id);
    notify(`${product.name} added to your cart.`);
    setTimeout(() => setBusy(null), 400);
  };

  const buyNow = () => {
    setBusy("buy");
    add(product.id);
    // Checkout is behind authentication — /checkout sends guests to sign in
    // and brings them straight back.
    router.push("/checkout");
  };

  return (
    <article
      ref={tilt.ref}
      onPointerMove={tilt.onPointerMove}
      onPointerLeave={tilt.onPointerLeave}
      className="tilt-3d group flex h-full flex-col overflow-hidden rounded-card border border-femi-100 bg-white shadow-soft hover:shadow-lift"
    >
      <Link
        href={`/products/${product.slug}`}
        className="focus-ring relative block bg-gradient-to-br from-femi-50 to-white p-5"
      >
        <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-1.5">
          {product.badge && <Badge tone="gold">{product.badge}</Badge>}
          {off > 0 && <Badge tone="sale">{off}% off</Badge>}
        </div>
        <PackVisual
          product={product}
          className="mx-auto w-full max-w-[240px] transition-transform duration-500 group-hover:scale-[1.04]"
        />
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5 pt-4">
        <div className="flex-1">
          <h3 className="font-display text-lg leading-snug text-ink">
            <Link href={`/products/${product.slug}`} className="focus-ring hover:text-femi-600">
              {product.name}
            </Link>
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{product.short}</p>
        </div>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-xl font-bold text-ink">{money(product.price)}</span>
          {product.mrp > product.price && (
            <span className="text-sm text-ink-faint line-through">{money(product.mrp)}</span>
          )}
          <span className="text-xs text-ink-faint">· {pricePerPad(product.price, product.padCount)}</span>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium">
          {soldOut ? (
            <Badge tone="outline">Out of stock</Badge>
          ) : product.stock < 20 ? (
            <Badge tone="outline">Only {product.stock} left</Badge>
          ) : (
            <Badge tone="stock">In stock</Badge>
          )}
          <span className="text-ink-faint">
            ★ {product.rating.toFixed(1)} ({product.reviewCount})
          </span>
        </div>

        <div className="mt-1 grid grid-cols-2 gap-2">
          <Button
            variant="secondary"
            onClick={addToCart}
            disabled={soldOut}
            loading={busy === "cart"}
            aria-label={`Add ${product.name} to cart`}
          >
            Add to cart
          </Button>
          <Button
            onClick={buyNow}
            disabled={soldOut}
            loading={busy === "buy"}
            aria-label={`Buy ${product.name} now`}
          >
            Buy now
          </Button>
        </div>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-card border border-femi-100 bg-white">
      <div className="skeleton aspect-[4/3] w-full" />
      <div className="flex flex-col gap-3 p-5">
        <div className="skeleton h-5 w-3/4 rounded-full" />
        <div className="skeleton h-4 w-full rounded-full" />
        <div className="skeleton h-6 w-24 rounded-full" />
        <div className="skeleton h-11 w-full rounded-full" />
      </div>
    </div>
  );
}
