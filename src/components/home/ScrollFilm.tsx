"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { site } from "@/lib/site";

/**
 * The product film, scrubbed by scroll.
 *
 * Played as a frame sequence on a canvas rather than by seeking a <video>.
 * Setting currentTime on scroll stutters badly on Android and iOS, because
 * every seek waits on the decoder; pre-decoded frames just get drawn. It also
 * makes the film scrub backwards as smoothly as forwards.
 *
 * The section is tall and the canvas inside it is sticky, so the film advances
 * while the pack stays in view.
 */
export function ScrollFilm() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const framesRef = useRef<HTMLImageElement[]>([]);
  const drawnRef = useRef(-1);
  const rafRef = useRef(0);
  const [ready, setReady] = useState(false);

  /** Frame numbers to play, with the claim segment dropped when configured. */
  const order = useCallback(() => {
    const { frames, skip } = site.scrollFilm;
    const all = Array.from({ length: frames }, (_, i) => i + 1);
    if (!skip) return all;
    return all.filter((n) => n < skip[0] || n > skip[1]);
  }, []);

  const paint = useCallback((index: number) => {
    const canvas = canvasRef.current;
    const image = framesRef.current[index];
    if (!canvas || !image?.complete || image.naturalWidth === 0) return;
    if (drawnRef.current === index) return;
    drawnRef.current = index;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Fill the frame only when the screen is a similar shape to the film.
    // The film is 16:9 with the pack centred and its wordmark near the edges,
    // so cropping it to a portrait phone throws away the product — it leaves a
    // zoomed slice of the pad. There, fit the whole frame instead and let it
    // letterbox against the section's own background.
    const imageAspect = image.naturalWidth / image.naturalHeight;
    const fillFrame = width / height >= imageAspect * 0.75;

    const scale = fillFrame
      ? Math.max(width / image.naturalWidth, height / image.naturalHeight)
      : Math.min(width / image.naturalWidth, height / image.naturalHeight);

    const w = image.naturalWidth * scale;
    const h = image.naturalHeight * scale;
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(image, (width - w) / 2, (height - h) / 2, w, h);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const sequence = order();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let cancelled = false;
    let loaded = 0;

    const load = () => {
      sequence.forEach((frameNumber, index) => {
        const image = new Image();
        image.decoding = "async";
        image.src = `/film/f${String(frameNumber).padStart(3, "0")}.webp`;
        image.onload = () => {
          if (cancelled) return;
          loaded += 1;
          // Show something as soon as the first frame is in.
          if (index === 0) {
            setReady(true);
            paint(0);
          }
          if (loaded === sequence.length) setReady(true);
        };
        framesRef.current[index] = image;
      });
    };

    // Only fetch when the section is near — this is 1.6 MB of imagery.
    const preloader = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          preloader.disconnect();
          load();
        }
      },
      { rootMargin: "600px" },
    );
    preloader.observe(section);

    if (reduced) {
      // No scrubbing; a single frame stands in for the film.
      return () => {
        cancelled = true;
        preloader.disconnect();
      };
    }

    const onScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0;
        const rect = section.getBoundingClientRect();
        const scrollable = rect.height - window.innerHeight;
        if (scrollable <= 0) return;

        const progress = Math.min(Math.max(-rect.top / scrollable, 0), 1);
        paint(Math.min(sequence.length - 1, Math.round(progress * (sequence.length - 1))));
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();

    return () => {
      cancelled = true;
      preloader.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [order, paint]);

  return (
    <section
      ref={sectionRef}
      aria-label="Femi pack, shown from every side"
      className="relative bg-[#efe7dc]"
      style={{ height: `${site.scrollFilm.scrollScreens * 100}vh` }}
    >
      {/* min-height in vh as well as svh: if a browser does not understand
          svh the height would fall back to auto and the stage would collapse. */}
      <div
        className="sticky top-0 flex h-[100svh] min-h-screen w-full flex-col items-center justify-center overflow-hidden"
      >
        {/*
          A 16:9 box on phones, so the film plays whole instead of leaving
          empty bands, with the copy filling the space around it. From large
          screens up the box becomes the whole stage and the film fills it.
        */}
        <div className="px-5 text-center lg:hidden">
          <p className="text-xs font-semibold tracking-[0.22em] text-[#8a7660] uppercase">
            Every side of the pack
          </p>
          <h2 className="mt-2 font-display text-3xl leading-tight text-[#3a2c1d]">
            Made to be worn, not noticed
          </h2>
        </div>

        <div className="relative mt-6 aspect-video w-full lg:absolute lg:inset-0 lg:mt-0 lg:aspect-auto lg:h-full">
          {/*
            The first frame as a plain image, behind the canvas.
            It is server-rendered, so the pack is on screen even if JavaScript
            never runs, the canvas fails, or the frames are still downloading —
            the section can never be a blank band. The canvas covers it as soon
            as it has something to draw.
          */}
          {/* eslint-disable-next-line @next/next/no-img-element -- a fixed-size
              static frame; next/image would only add indirection here. */}
          <img
            src="/film/f001.webp"
            alt="A Femi pack turning on a podium, surrounded by cotton and leaves"
            className="absolute inset-0 h-full w-full object-contain lg:object-cover"
          />

          <canvas
            ref={canvasRef}
            className={`relative h-full w-full transition-opacity duration-300 ${
              ready ? "opacity-100" : "opacity-0"
            }`}
            aria-hidden
          />
        </div>

        <p className="pointer-events-none absolute inset-x-0 bottom-7 text-center text-xs font-semibold tracking-[0.2em] text-[#6b5a49] uppercase">
          Keep scrolling
        </p>
      </div>
    </section>
  );
}
