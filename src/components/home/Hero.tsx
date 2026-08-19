"use client";

import { Hero3DStage } from "@/components/three/Hero3DStage";
import { ButtonLink } from "@/components/ui/Button";
import { site } from "@/lib/site";
import type { PackTheme } from "@/lib/types";

interface HeroPack {
  theme: PackTheme;
  size: string;
  length: string;
  padCount: number;
}

export function Hero({ packs }: { packs: HeroPack[] }) {
  return (
    <section className="relative isolate overflow-hidden">
      {/* Layered gradient ground. Stays visible if WebGL is unavailable. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-20 bg-[radial-gradient(120%_80%_at_20%_0%,#fff5f8_0%,#ffe6ee_45%,#fffaf7_100%)]"
      />
      <div
        aria-hidden
        className="absolute -top-24 -left-24 -z-10 size-96 rounded-full bg-femi-200/40 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -right-32 bottom-0 -z-10 size-[28rem] rounded-full bg-gold-soft/40 blur-3xl"
      />

      <div className="container-page grid items-center gap-6 py-12 sm:gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-6 lg:py-24">
        <div className="animate-rise relative z-10 order-2 max-w-xl lg:order-1">
          <span className="inline-flex items-center gap-2 rounded-full border border-femi-200 bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-femi-700">
            <span aria-hidden className="size-1.5 rounded-full bg-femi-500" />
            Free delivery over ₹{site.delivery.freeAbove} · Ships with {site.courier.name}
          </span>

          <h1 className="mt-5 font-display text-[2.6rem] leading-[1.05] text-balance-pretty text-ink sm:text-6xl">
            Period care
            <br />
            made <span className="text-femi-600 italic">simple.</span>
          </h1>

          <p className="mt-5 max-w-md text-base leading-relaxed text-ink-soft sm:text-lg">
            Ultra-thin, soft cotton-finish pads in L, XL and XXL — comfortable to wear, reliable
            through the day and night, and delivered quietly to your door.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <ButtonLink href="/products" size="lg">
              Shop now
            </ButtonLink>
            <ButtonLink href="/products?category=value-packs" variant="secondary" size="lg">
              See value packs
            </ButtonLink>
          </div>

          <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-femi-200/70 pt-6">
            {[
              { value: "3 sizes", label: "290 · 320 · 410mm" },
              { value: "4.7★", label: "average rating" },
              { value: "3–6 days", label: "typical delivery" },
            ].map((stat) => (
              <div key={stat.label}>
                <dt className="font-display text-xl text-ink">{stat.value}</dt>
                <dd className="mt-0.5 text-xs leading-snug text-ink-faint">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* On phones the 3D stage leads, so the packs are the first thing you see. */}
        <div className="relative order-1 -mx-4 aspect-[7/5] w-[calc(100%+2rem)] sm:mx-0 sm:aspect-[16/9] sm:w-full lg:order-2 lg:aspect-square">
          <Hero3DStage packs={packs} />
        </div>
      </div>
    </section>
  );
}
