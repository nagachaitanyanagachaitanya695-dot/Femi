"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { WhatsAppIcon } from "@/components/layout/Icons";
import { buttonClass } from "@/components/ui/Button";
import { site } from "@/lib/site";
import { supportLink } from "@/lib/whatsapp";

/**
 * The film that opens the shop, advanced by scrolling.
 *
 * It is the first thing on the page and holds the whole screen: the section is
 * tall, the stage inside it is sticky, and scroll position sets the video's
 * currentTime. The page scrolls normally throughout — the film holds the view
 * but never takes the scroll away, and it never plays on its own.
 *
 * Scrubbing a <video> is normally slow, because a seek decodes forward from
 * the preceding keyframe. Both cuts are encoded with every frame a keyframe,
 * so a seek is a single decode, and both preload whole so no seek waits on the
 * network.
 *
 * Filling the screen differs by device, because the film is 16:9 and a phone
 * is roughly 9:19. Wide screens are close enough to the film's shape to crop
 * to fill. Phones are not — cropping to fill leaves about a quarter of the
 * frame's width, which cuts the pack in half — so there the film runs full
 * width and its edges are dissolved into the page's cream by .film-feather,
 * making the screen one continuous scene instead of a video in a box.
 *
 * Neither file carries an audio track at all, not merely muted.
 */
export function PackFilm() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const titleRef = useRef<HTMLDivElement | null>(null);
  const actionsRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef(0);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const FILM_END = 0.8; // film finishes before the section does
  const TITLE_OUT = 0.28; // opening words clear by here
  const ACTIONS_IN = 0.52;
  const ACTIONS_FULL = 0.74;

  const onScroll = useCallback(() => {
    if (frameRef.current) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = 0;
      const section = sectionRef.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      if (scrollable <= 0) return;
      const progress = Math.min(Math.max(-rect.top / scrollable, 0), 1);

      const video = videoRef.current;
      if (video?.duration) {
        const t = Math.min(progress / FILM_END, 1) * video.duration;
        // Skip sub-frame moves; closer than half a frame is the same picture.
        if (Math.abs(video.currentTime - t) > 1 / 48) video.currentTime = t;
      }

      // Written straight to the DOM: this runs on every frame of a scroll, and
      // re-rendering that often would stutter.
      const title = titleRef.current;
      if (title) {
        const out = Math.min(progress / TITLE_OUT, 1);
        title.style.opacity = String(1 - out);
        title.style.transform = `translateY(${out * -24}px)`;
      }

      const actions = actionsRef.current;
      if (actions) {
        const now = Math.min(
          Math.max((progress - ACTIONS_IN) / (ACTIONS_FULL - ACTIONS_IN), 0),
          1,
        );
        actions.style.opacity = String(now);
        actions.style.transform = `translateY(${(1 - now) * 20}px)`;
        actions.style.pointerEvents = now > 0.6 ? "auto" : "none";
      }
    });
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = true;
      // Some mobile browsers paint nothing until a frame has been decoded
      // once; nudging off zero brings the first frame up.
      video.addEventListener(
        "loadeddata",
        () => {
          if (video.currentTime === 0) video.currentTime = 0.01;
        },
        { once: true },
      );
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // No scrubbing, and the words and buttons are simply present.
      for (const ref of [titleRef, actionsRef]) {
        const el = ref.current;
        if (el) {
          el.style.opacity = "1";
          el.style.transform = "none";
          el.style.pointerEvents = "auto";
        }
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
      style={{ height: "340vh" }}
    >
      {/* min-h-screen alongside svh: a browser that does not know svh would
          fall back to auto and collapse the stage to nothing. */}
      <div className="sticky top-0 h-[100svh] min-h-screen w-full overflow-hidden">
        <video
          ref={videoRef}
          muted
          playsInline
          preload="auto"
          aria-label="A Femi pack turning on a podium among cotton and leaves"
          /*
            On phones the element is sized to the film itself (full width,
            natural height, centred) rather than to the stage. The feather mask
            runs over the element box, so the two have to be the same thing —
            stretched to the stage with object-contain, the fade would land in
            the empty space above and below and the film would still end in a
            hard line. Wide screens fill the stage outright.
          */
          className="film-feather absolute top-1/2 left-0 h-auto w-full -translate-y-1/2 lg:inset-0 lg:h-full lg:translate-y-0 lg:object-cover"
        >
          {/*
            MP4 first: it is about half the size of the all-keyframe WebM, and
            any browser shipping H.264 should take it. The WebM is there for
            builds without H.264, which would otherwise get nothing at all.
          */}
          <source media="(min-width: 1024px)" src="/film/pack-wide.mp4" type="video/mp4" />
          <source media="(min-width: 1024px)" src="/film/pack-wide.webm" type="video/webm" />
          <source src="/film/pack-tall.mp4" type="video/mp4" />
          <source src="/film/pack-tall.webm" type="video/webm" />
        </video>

        <div
          ref={titleRef}
          className="pointer-events-none absolute inset-x-0 top-[16svh] px-6 text-center"
        >
          <p className="text-[11px] font-semibold tracking-[0.34em] text-[#8a7660] uppercase">
            {site.name} · Everyday
          </p>
          <h2 className="mx-auto mt-3 max-w-lg font-display text-4xl leading-[1.08] text-[#3a2c1d] sm:text-5xl">
            Made to be worn, not noticed
          </h2>
        </div>

        <div
          ref={actionsRef}
          /* pb-28 on small screens clears the fixed bottom tab bar, which
             would otherwise sit over the buttons. */
          className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-4 px-5 pb-28 sm:pb-16"
        >
          {detailsOpen && (
            <div className="w-full max-w-md rounded-3xl border border-femi-100 bg-white/95 p-5 shadow-lift backdrop-blur-sm sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <h3 className="font-display text-xl text-ink">Get in touch</h3>
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
