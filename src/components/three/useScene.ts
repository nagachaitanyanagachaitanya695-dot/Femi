"use client";

import { useEffect, useRef, useState } from "react";

import type { SceneHandle } from "./heroScene";

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function supportsWebGL(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl2") || canvas.getContext("webgl")),
    );
  } catch {
    return false;
  }
}

/**
 * Mounts a Three.js scene into a container, but only once the element is close
 * to the viewport — three and the scene module are loaded on demand, so the
 * first paint never waits on WebGL.
 */
export function useLazyScene(
  factory: (container: HTMLElement, reducedMotion: boolean) => Promise<SceneHandle>,
  deps: unknown[] = [],
) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<"idle" | "ready" | "unsupported">("idle");

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    if (!supportsWebGL()) {
      setStatus("unsupported");
      return;
    }

    let handle: SceneHandle | null = null;
    let cancelled = false;

    const build = () => {
      factory(container, prefersReducedMotion())
        .then((scene) => {
          if (cancelled) {
            scene.dispose();
            return;
          }
          handle = scene;
          setStatus("ready");
        })
        .catch(() => setStatus("unsupported"));
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect();
          build();
        }
      },
      { rootMargin: "300px" },
    );
    observer.observe(container);

    return () => {
      cancelled = true;
      observer.disconnect();
      handle?.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { ref, status };
}
