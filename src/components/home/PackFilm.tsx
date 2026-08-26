"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { WhatsAppIcon } from "@/components/layout/Icons";
import { buttonClass } from "@/components/ui/Button";
import { site } from "@/lib/site";
import { supportLink } from "@/lib/whatsapp";

/**
 * The product film, advanced by scrolling.
 *
 * The section is tall and the stage inside it is sticky, so the page keeps
 * scrolling normally while the film holds the screen and plays forward under
 * the reader's thumb — it never autoplays and never takes the scroll away.
 *
 * Scrubbing is done by setting currentTime on a <video>. That is normally slow,
 * because a seek has to decode forward from the preceding keyframe; both cuts
 * are encoded with every frame a keyframe, which makes each seek one decode.
 * They are also preloaded whole, so no seek waits on the network.
 *
 * Two cuts of the same film ship, chosen by the <source media> queries: the
 * full 16:9 for desktop, and a 4:5 crop of the product pass for phones so the
 * pack fills the screen rather than sitting in a letterboxed strip.
 *
 * Both files have no audio track at all, not merely muted.
 */
export function PackFilm() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef(0);
  const [detailsOpen, setDetailsOpen] = useState(false);

  /** How far the film runs before the buttons finish arriving. */
  const FILM_END = 0.78;
  const REVEAL_FROM = 0.5;
  const REVEAL_TO = 0.72;

  const onScroll = useCallback(() => {
    if (frameRef.current) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = 0;
      const section = sectionRef.current;
      const video = videoRef.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      if (scrollable <= 0) return;
      const progress = Math.min(Math.max(-rect.top / scrollable, 0), 1);

      if (video?.duration) {
        const t = Math.min(progress / FILM_END, 1) * video.duration;
        // Skip sub-frame moves; at 15fps anything closer than half a frame
        // would seek to the picture already on screen.
        if (Math.abs(video.currentTime - t) > 1 / 30) video.currentTime = t;
      }

      // Driven straight through the DOM rather than through state: this runs
      // on every frame of a scroll, and re-rendering that often would stutter.
      const overlay = overlayRef.current;
      if (overlay) {
        const reveal = Math.min(
          Math.max((progress - REVEAL_FROM) / (REVEAL_TO - REVEAL_FROM), 0),
          1,
        );
        overlay.style.opacity = String(reveal);
        overlay.style.transform = `translateY(${(1 - reveal) * 18}px)`;
        overlay.style.pointerEvents = reveal > 0.6 ? "auto" : "none";
      }
    });
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = true;
      // Some mobile browsers paint nothing until the video has been decoded
      // once. Nudging it off zero forces the first frame up.
      const nudge = () => {
        if (video.currentTime === 0) video.currentTime = 0.01;
      };
      video.addEventListener("loadeddata", nudge, { once: true });
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      // No scrubbing, and the buttons are simply there.
      const overlay = overlayRef.current;
      if (overlay) {
        overlay.style.opacity = "1";
        overlay.style.transform = "none";
        overlay.style.pointerEvents = "auto";
      }
      return;
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [onScroll]);

  return (
    <section
      ref={sectionRef}
      aria-label="The Femi pack, in film"
      className="relative bg-[#efe7dc]"
      style={{ height: "320vh" }}
    >
      {/* min-h-screen as well as svh: a browser that does not understand svh
          would otherwise fall back to auto and collapse the stage. */}
      <div className="sticky top-0 flex h-[100svh] min-h-screen w-full items-center justify-center overflow-hidden">
        <video
          ref={videoRef}
          muted
          playsInline
          preload="auto"
          aria-label="A Femi pack turning on a podium among cotton and leaves"
          /* contain, not cover: the stage is the whole screen, and a phone is
             far taller than either cut, so filling it would crop away most of
             the pack. What is left over is the same cream the film is shot and
             faded against, so it reads as the frame rather than as bars. */
          className="absolute inset-0 h-full w-full object-contain"
        >
          {/*
            MP4 first: it is roughly half the size of the all-keyframe WebM,
            and every browser that ships H.264 should take it. The WebM is
            there for builds without H.264, which would otherwise get nothing.
          */}
          <source media="(min-width: 1024px)" src="/film/pack-wide.mp4" type="video/mp4" />
          <source media="(min-width: 1024px)" src="/film/pack-wide.webm" type="video/webm" />
          <source src="/film/pack-tall.mp4" type="video/mp4" />
          <source src="/film/pack-tall.webm" type="video/webm" />
        </video>

        {/* Keeps the buttons readable over whatever frame is behind them. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-[#efe7dc] via-[#efe7dc]/80 to-transparent" />

        <div
          ref={overlayRef}
          /* pb-28 on small screens clears the fixed bottom tab bar, which
             otherwise sits over the buttons. */
          className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-4 px-5 pb-28 sm:pb-14"
        >
          {detailsOpen && (
            <div className="w-full max-w-md rounded-3xl border border-femi-100 bg-white/95 p-5 shadow-lift backdrop-blur-sm sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <h2 className="font-display text-xl text-ink">Get in touch</h2>
                <button
                  type="button"
                  onClick={() => setDetailsOpen(false)}
                  className="focus-ring -mt-1 rounded-full px-2 py-1 text-sm text-ink-soft hover:text-femi-600"
                  aria-label="Close details"
                >
                  Close
                </button>
              </div>

              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="text-xs tracking-wide text-ink-faint uppercase">WhatsApp orders</dt>
                  <dd className="font-semibold text-ink">{site.whatsappDisplay}</dd>
                </div>
                <div>
                  <dt className="text-xs tracking-wide text-ink-faint uppercase">Email</dt>
                  <dd>
                    <a
                      href={`mailto:${site.supportEmail}`}
                      className="focus-ring font-semibold break-all text-ink hover:text-femi-600"
                    >
                      {site.supportEmail}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs tracking-wide text-ink-faint uppercase">Delivery</dt>
                  <dd className="text-ink-soft">
                    {site.courier.name}, {site.delivery.etaDays}. Free over ₹
                    {site.delivery.freeAbove}.
                  </dd>
                </div>
              </dl>

              <a
                href={supportLink()}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClass("whatsapp", "md", "mt-5 w-full")}
              >
                <WhatsAppIcon className="size-4" />
                Contact via WhatsApp
              </a>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/products" className={buttonClass("primary", "lg")}>
              Shop now
            </Link>
            <button
              type="button"
              onClick={() => setDetailsOpen((open) => !open)}
              aria-expanded={detailsOpen}
              className={buttonClass("secondary", "lg")}
            >
              Details
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
