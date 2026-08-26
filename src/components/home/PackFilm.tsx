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
 * the preceding keyframe. Both cuts carry a keyframe every four frames, so a
 * seek decodes at most four, and both preload whole so no seek waits on the
 * network. Measured, that is 6-11ms a seek — no worse than making every frame
 * a keyframe, at half the file size.
 *
 * Desktop gets the film at its own 16:9. The full cut opens and closes on
 * cards whose text runs to the edges of the frame, so cropping the sides to
 * fit a narrower window would clip them. The phone cut is a 9:16 window on the
 * pack, placed so those same cards do not bleed into its edge.
 *
 * Neither file carries an audio track at all, not merely muted.
 */
export function PackFilm() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const titleRef = useRef<HTMLDivElement | null>(null);
  const actionsRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef(0);
  const targetRef = useRef(0);
  const seekingRef = useRef(false);
  const seekStartRef = useRef(0);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const FPS = 24; // must match the encoded cuts
  const FILM_END = 0.88; // film finishes a little before the section does
  const TITLE_OUT = 0.12; // opening words clear by here
  const ACTIONS_IN = 0.74;
  const ACTIONS_FULL = 0.9;

  /**
   * Moves the film to where the scroll says, at the rate the decoder can
   * actually manage.
   *
   * Every write to currentTime is a seek, and a seek is a decode with real
   * latency — around 10ms on a desktop CPU, several times that on a phone's
   * hardware decoder. An earlier version eased toward the target on every
   * animation frame, which issued about 150 seeks for a two-second scroll;
   * they queued up faster than they could finish and the film fell steadily
   * further behind the thumb. That was the lag.
   *
   * So: never start a seek while one is in flight — just remember where we
   * want to be and go there once the last one lands — and snap the target to
   * a real frame, since seeking between frames decodes a picture identical to
   * the one already on screen. Together these cap the work at what the device
   * can do, and the decoder's own latency does the smoothing the easing was
   * trying to add.
   */
  const pump = useCallback(() => {
    const video = videoRef.current;
    if (!video?.duration) return;

    // A seek that never reports back would freeze the film for good.
    if (seekingRef.current && performance.now() - seekStartRef.current < 500) return;

    const step = 1 / FPS;
    const wanted = Math.round(targetRef.current / step) * step;
    if (Math.abs(video.currentTime - wanted) < step / 2) return;

    seekingRef.current = true;
    seekStartRef.current = performance.now();
    // Deliberately not fastSeek: it lands on the nearest keyframe, and with a
    // keyframe every four frames that is up to two frames wrong. Seeks here
    // measure 6-11ms anyway, so exactness is worth more than the shortcut.
    video.currentTime = wanted;
  }, []);

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
        targetRef.current = Math.min(progress / FILM_END, 1) * video.duration;
        pump();
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
  }, [pump]);

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
      // Release the lock as each seek lands, then go straight to wherever the
      // scroll has moved to in the meantime.
      video.addEventListener("seeked", () => {
        seekingRef.current = false;
        pump();
      });
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
  }, [onScroll, pump]);

  return (
    <section
      ref={sectionRef}
      aria-label="The Femi pack, in film"
      className="relative bg-[#efe7dc]"
      style={{ height: "1600vh" }}
    >
      {/* min-h-screen alongside svh: a browser that does not know svh would
          fall back to auto and collapse the stage to nothing. */}
      <div className="sticky top-0 h-[100svh] min-h-screen w-full overflow-hidden">
        {/*
          A sharp still under the film. The cuts are a few megabytes, and
          without this the screen is empty cream until enough of one has
          arrived to decode a frame. Two files because the two cuts are
          different shapes; together they are about 110 KB.
        */}
        {/* eslint-disable-next-line @next/next/no-img-element -- fixed-size
            decorative stills; next/image would only add indirection. */}
        <img
          src="/film/pack-tall-poster.webp"
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover lg:hidden"
        />
        {/* eslint-disable-next-line @next/next/no-img-element -- as above. */}
        <img
          src="/film/pack-wide-poster.webp"
          alt=""
          aria-hidden
          className="absolute inset-0 hidden h-full w-full object-cover lg:block"
        />

        <video
          ref={videoRef}
          muted
          playsInline
          preload="auto"
          aria-label="A Femi pack turning on a podium among cotton and leaves"
          className="absolute inset-0 h-full w-full object-cover"
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

        {/*
          Soft washes of the page's own cream at the top and bottom. The film
          is bright and busy in the middle, and without these the opening words
          and the buttons sit on whatever happens to be behind them.
        */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[24svh] bg-gradient-to-b from-[#efe7dc]/90 via-[#efe7dc]/30 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[24svh] bg-gradient-to-t from-[#efe7dc]/90 via-[#efe7dc]/30 to-transparent" />

        <div
          ref={titleRef}
          className="pointer-events-none absolute inset-x-0 top-[9svh] px-6 text-center"
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
          className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-4 px-5 pb-14 sm:pb-16"
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
