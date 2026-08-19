"use client";

import type { PackArt } from "./packTexture";
import { useLazyScene } from "./useScene";

/**
 * WebGL hero stage. If WebGL is unavailable the gradient underneath simply
 * stays visible, so the hero never looks broken.
 */
export function Hero3DStage({ packs }: { packs: PackArt[] }) {
  const { ref, status } = useLazyScene(
    async (container, reducedMotion) => {
      const { createHeroScene } = await import("./heroScene");
      return createHeroScene(container, { packs, reducedMotion });
    },
    [packs.map((p) => p.size).join("|")],
  );

  return (
    <div
      ref={ref}
      aria-hidden
      data-status={status}
      className="absolute inset-0 transition-opacity duration-700 data-[status=idle]:opacity-0 data-[status=ready]:opacity-100 data-[status=unsupported]:opacity-0"
    />
  );
}
