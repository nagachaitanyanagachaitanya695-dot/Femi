"use client";

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 20,
  label = "Quantity",
  size = "md",
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  label?: string;
  size?: "sm" | "md";
}) {
  const dimension = size === "sm" ? "size-8 text-base" : "size-10 text-lg";

  return (
    <div
      className="inline-flex items-center rounded-full border border-femi-200 bg-white p-1"
      role="group"
      aria-label={label}
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={`Decrease ${label.toLowerCase()}`}
        className={`focus-ring grid ${dimension} place-items-center rounded-full text-femi-700 transition hover:bg-femi-50 disabled:opacity-40`}
      >
        −
      </button>
      <span
        aria-live="polite"
        className={`min-w-9 text-center text-sm font-semibold tabular-nums text-ink`}
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={`Increase ${label.toLowerCase()}`}
        className={`focus-ring grid ${dimension} place-items-center rounded-full text-femi-700 transition hover:bg-femi-50 disabled:opacity-40`}
      >
        +
      </button>
    </div>
  );
}
