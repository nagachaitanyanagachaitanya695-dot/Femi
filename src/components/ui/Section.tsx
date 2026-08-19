import type { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  action,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  action?: ReactNode;
}) {
  const centered = align === "center";
  return (
    <div
      className={`flex flex-col gap-4 ${centered ? "items-center text-center" : "sm:flex-row sm:items-end sm:justify-between"}`}
    >
      <div className={`max-w-2xl ${centered ? "" : "flex-1"}`}>
        {eyebrow && (
          <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-femi-600 uppercase">
            {eyebrow}
          </p>
        )}
        <h2 className="font-display text-3xl leading-tight text-balance-pretty text-ink sm:text-4xl">
          {title}
        </h2>
        {description && (
          <p className="mt-3 text-base leading-relaxed text-ink-soft text-balance-pretty">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function Section({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`container-page py-14 sm:py-20 ${className}`}>
      {children}
    </section>
  );
}
