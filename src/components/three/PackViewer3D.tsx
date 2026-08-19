"use client";

import { PackVisual } from "@/components/product/PackVisual";
import type { Product } from "@/lib/types";

import { useLazyScene } from "./useScene";

/**
 * Interactive 3D pack on the product page. Falls back to the flat pack artwork
 * when WebGL is unavailable, so every visitor sees the product either way.
 */
export function PackViewer3D({ product }: { product: Product }) {
  const art = {
    theme: product.theme,
    size: product.size,
    length: product.length,
    padCount: product.padCount,
  };

  const { ref, status } = useLazyScene(
    async (container, reducedMotion) => {
      const { createPackScene } = await import("./packScene");
      return createPackScene(container, { art, reducedMotion });
    },
    [product.id],
  );

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-card bg-gradient-to-br from-femi-50 via-white to-femi-100">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 -right-10 size-56 rounded-full bg-femi-200/50 blur-3xl"
      />
      {status !== "ready" && (
        <div className="absolute inset-0 grid place-items-center p-8">
          <PackVisual product={product} className="w-full max-w-xs" />
        </div>
      )}
      <div
        ref={ref}
        className="absolute inset-0 transition-opacity duration-500 data-[status=ready]:opacity-100"
        data-status={status}
        style={{ opacity: status === "ready" ? 1 : 0 }}
      />
      {status === "ready" && (
        <p className="pointer-events-none absolute inset-x-0 bottom-4 text-center text-xs font-medium text-ink-faint">
          Drag to spin the pack
        </p>
      )}
    </div>
  );
}
