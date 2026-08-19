import type { ReactNode } from "react";

type Tone = "sale" | "soft" | "outline" | "stock" | "gold";

const TONES: Record<Tone, string> = {
  sale: "bg-femi-500 text-white",
  soft: "bg-femi-100 text-femi-700",
  outline: "border border-femi-200 bg-white/80 text-femi-700",
  stock: "bg-leaf/12 text-leaf",
  gold: "bg-gold-soft text-[#6b4a10]",
};

export function Badge({
  children,
  tone = "soft",
  className = "",
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
