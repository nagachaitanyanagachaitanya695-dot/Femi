"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { site } from "@/lib/site";

export const INTRO_SEEN_KEY = "femi.intro.seen";

/**
 * The opening product film.
 *
 * Rules it has to respect, because an intro that traps someone is worse than
 * no intro at all:
 *  - shows once per visit, not on every page change;
 *  - always skippable, by button or Escape;
 *  - starts muted, because browsers refuse to autoplay audio and a silent
 *    failure would leave a frozen frame on screen;
 *  - dismisses itself if the video errors, stalls, or the visitor prefers
 *    reduced motion;
 *  - a hard timeout ends it no matter what, so it can never block the shop.
 */
export function IntroVideo() {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setLeaving(true);
    try {
      window.sessionStorage.setItem(INTRO_SEEN_KEY, "1");
    } catch {
      // Private mode: the intro simply plays again next time.
    }
    // Let the fade finish before unmounting.
    setTimeout(() => {
      setVisible(false);
      document.documentElement.removeAttribute("data-intro");
      document.body.style.overflow = "";
    }, 450);
  }, []);

  useEffect(() => {
    if (!site.intro.enabled) {
      document.documentElement.removeAttribute("data-intro");
      return;
    }

    let seen = false;
    try {
      seen = window.sessionStorage.getItem(INTRO_SEEN_KEY) === "1";
    } catch {
      seen = false;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (seen || reducedMotion) {
      document.documentElement.removeAttribute("data-intro");
      return;
    }

    setVisible(true);
    document.documentElement.setAttribute("data-intro", "1");
    document.body.style.overflow = "hidden";

    // Whatever happens to the video, the shop appears.
    timeoutRef.current = setTimeout(dismiss, site.intro.maxDurationMs);

    // If playback has not actually begun shortly after mount, it never will —
    // blocked autoplay, a codec the browser lacks, or a dead connection. Bail
    // out rather than leaving a frozen poster on screen.
    const watchdog = setTimeout(() => {
      const video = videoRef.current;
      if (!video || video.paused || video.currentTime === 0) dismiss();
    }, 3000);

    return () => {
      clearTimeout(watchdog);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      document.documentElement.removeAttribute("data-intro");
      document.body.style.overflow = "";
    };
  }, [dismiss]);

  useEffect(() => {
    if (!visible) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, dismiss]);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${site.name} product film`}
      className={`fixed inset-0 z-[120] flex items-center justify-center bg-[#0e0508] transition-opacity duration-[450ms] ${
        leaving ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      {/*
        Deliberately no onError or onStalled here.

        With <source> children the browser tries each in turn, firing `error`
        on the ones it cannot use — and React bubbles that up to the video's
        onError. Dismissing on it would kill the intro the moment the MP4 was
        rejected, before the WebM fallback ever got a chance, which is exactly
        what a browser without H.264 does. `stalled` is equally misleading: it
        fires during ordinary buffering.

        Genuine failure is caught by the watchdog above, which asks the only
        question that matters — did playback actually start?
      */}
      <video
        ref={videoRef}
        poster={site.intro.poster}
        autoPlay
        muted={muted}
        playsInline
        preload="auto"
        onEnded={dismiss}
        // `contain` everywhere, not `cover` on phones: the film is 16:9 with
        // its wordmark and copy near the edges, and cropping to a portrait
        // screen throws exactly that away. Letterboxing against the dark
        // backdrop reads as deliberate.
        className="h-full w-full object-contain"
      >
        {site.intro.sources.map((source) => (
          <source key={source.src} src={source.src} type={source.type} />
        ))}
      </video>

      {/* Gradient so the controls stay legible over a bright frame. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/55 to-transparent"
      />

      <button
        type="button"
        onClick={dismiss}
        className="focus-ring absolute top-[max(1rem,env(safe-area-inset-top))] right-4 rounded-full bg-white/90 px-5 py-2.5 text-sm font-semibold text-ink shadow-soft backdrop-blur transition hover:bg-white"
      >
        Skip intro
      </button>

      <button
        type="button"
        onClick={() => {
          const next = !muted;
          setMuted(next);
          const video = videoRef.current;
          if (video) {
            video.muted = next;
            if (!next) void video.play().catch(() => undefined);
          }
        }}
        aria-label={muted ? "Unmute the video" : "Mute the video"}
        className="focus-ring absolute bottom-[max(1.5rem,env(safe-area-inset-bottom))] left-4 grid size-11 place-items-center rounded-full bg-white/90 text-ink shadow-soft backdrop-blur transition hover:bg-white"
      >
        <span aria-hidden className="text-lg">{muted ? "🔇" : "🔊"}</span>
      </button>

      <button
        type="button"
        onClick={dismiss}
        className="focus-ring absolute bottom-[max(1.5rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 rounded-full bg-femi-500 px-7 py-3 text-sm font-semibold text-white shadow-lift transition hover:bg-femi-600"
      >
        Enter the shop
      </button>
    </div>
  );
}
