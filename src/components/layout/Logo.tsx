import Link from "next/link";

/** The Femi wordmark: a soft italic serif "Femi" beside the circular 9 mark. */
export function Logo({
  className = "",
  tone = "default",
}: {
  className?: string;
  tone?: "default" | "light";
}) {
  const ink = tone === "light" ? "text-white" : "text-femi-600";
  const mark = tone === "light" ? "bg-white text-femi-600" : "bg-femi-500 text-white";

  return (
    <Link href="/" className={`focus-ring inline-flex items-center gap-2 ${className}`} aria-label="Femi — home">
      <span className={`font-display text-2xl leading-none font-bold italic ${ink}`}>Femi</span>
      <span
        aria-hidden
        className={`grid size-6 place-items-center rounded-full text-xs font-bold ${mark}`}
      >
        9
      </span>
    </Link>
  );
}
