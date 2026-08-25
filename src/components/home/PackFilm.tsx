"use client";

import { useEffect, useRef } from "react";

import { site } from "@/lib/site";

/**
 * The product film, playing as a section background.
 *
 * The page scrolls normally past it — nothing is pinned and no scroll is
 * hijacked. It replaces an earlier version that scrubbed a 60-frame canvas
 * against scroll position; that needed JavaScript, a 1.6 MB frame sequence and
 * a working canvas before anything appeared at all, and when any one of those
 * failed the section was simply blank. A <video> either plays or shows its
 * poster.
 *
 * Two cuts of the same film ship, chosen by the <source media> queries below.
 * Desktop gets the full 16:9 film, ending on its "Comfort You Can Trust" card.
 * Phones get a 4:5 crop of the product pass alone, so the pack fills the
 * screen rather than sitting in a letterboxed strip; the end card is left out
 * of that cut because cropping it to portrait cuts its headline down to a
 * stray "Trust". The phone cut plays forward then backward, which closes the
 * loop on itself exactly and needs no fade to hide the seam.
 *
 * The files carry no audio track at all — not merely muted. That also makes
 * autoplay far more reliable, since browsers block autoplay on audible video
 * but allow it when there is no audio to play.
 */
export function PackFilm() {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // React does not always serialise `muted` into the server-rendered HTML,
    // so set the property directly too rather than trust the attribute.
    video.muted = true;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      video.autoplay = false;
      video.pause();
      return;
    }

    // Autoplay usually starts on its own; this covers browsers that decline
    // until asked. A rejected promise just leaves the poster up, which is a
    // perfectly good still of the product.
    void video.play().catch(() => {});
  }, []);

  return (
    <section
      aria-label="The Femi pack, in film"
      className="relative overflow-hidden bg-[#efe7dc]"
    >
      {/*
        The box matches its cut's aspect ratio exactly, so the film fills it
        edge to edge with nothing cropped and no letterbox. Very wide screens
        cap the width rather than the height — capping height would make the
        box wider than the film and crop the end card's headline off the side.
        Past the cap the section's own cream shows either side, which is the
        colour the film is padded and faded with anyway.
      */}
      <div className="relative mx-auto aspect-[4/5] w-full lg:aspect-video lg:max-w-[1600px]">
        {/*
          A still under the film, so the band is never an empty rectangle while
          the video loads. Two files rather than one because the two cuts are
          different shapes; together they are under 50 KB, which is not worth
          the complexity of picking one at runtime.
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
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-label="A Femi pack turning on a podium among cotton and leaves"
          className="relative h-full w-full object-cover"
        >
          {/*
            First match wins, so the desktop cut is offered first and phones
            fall through to the portrait one. WebM leads on each so browsers
            without H.264 still have something to play; Safari skips it and
            takes the MP4.
          */}
          <source media="(min-width: 1024px)" src="/film/pack-wide.webm" type="video/webm" />
          <source media="(min-width: 1024px)" src="/film/pack-wide.mp4" type="video/mp4" />
          <source src="/film/pack-tall.webm" type="video/webm" />
          <source src="/film/pack-tall.mp4" type="video/mp4" />
        </video>
      </div>

      <p className="sr-only">{site.disclaimer}</p>
    </section>
  );
}
