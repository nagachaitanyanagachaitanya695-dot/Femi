import Link from "next/link";

/**
 * The Femi 9 brand mark.
 *
 * Traced from the brand's own product film, so the script wordmark and the
 * stylised 9 match the packaging exactly. Two colour variants ship rather than
 * one tinted file: a plain <img> is cached, needs no CSS mask support, and
 * cannot fail to a coloured rectangle on an old browser.
 */
export function Logo({
  className = "",
  tone = "default",
  priority = false,
}: {
  className?: string;
  tone?: "default" | "light";
  priority?: boolean;
}) {
  const src = tone === "light" ? "/brand/femi-logo-light.svg" : "/brand/femi-logo.svg";

  return (
    <Link
      href="/"
      className={`focus-ring inline-flex items-center ${className}`}
      aria-label="Femi 9 — home"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- a static SVG needs
          no optimisation pipeline, and next/image would only add a request. */}
      <img
        src={src}
        alt="Femi 9"
        width={499}
        height={200}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        className="h-8 w-auto sm:h-9"
        draggable={false}
      />
    </Link>
  );
}
