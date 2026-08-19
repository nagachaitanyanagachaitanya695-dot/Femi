import type { ReactNode } from "react";

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center rounded-card border border-femi-100 bg-white/70 px-6 py-14 text-center">
      <div
        aria-hidden
        className="mb-5 grid size-16 place-items-center rounded-full bg-femi-50 text-3xl"
      >
        {icon ?? "🌸"}
      </div>
      <h3 className="font-display text-xl text-ink">{title}</h3>
      {description && <p className="mt-2 text-sm leading-relaxed text-ink-soft">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
