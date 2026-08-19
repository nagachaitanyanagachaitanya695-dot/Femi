"use client";

import { useCallback, useRef } from "react";

/**
 * Pointer-driven 3D tilt for cards. Skipped on touch (where there is no hover)
 * and when the visitor prefers reduced motion.
 */
export function useTilt(maxDegrees = 7) {
  const ref = useRef<HTMLDivElement | null>(null);

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const node = ref.current;
      if (!node || event.pointerType !== "mouse") return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const rect = node.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      node.style.transform = `perspective(900px) rotateY(${x * maxDegrees}deg) rotateX(${-y * maxDegrees}deg) translateY(-4px)`;
    },
    [maxDegrees],
  );

  const onPointerLeave = useCallback(() => {
    const node = ref.current;
    if (node) node.style.transform = "";
  }, []);

  return { ref, onPointerMove, onPointerLeave };
}
