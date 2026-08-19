"use client";

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "whatsapp" | "danger";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-femi-500 text-white shadow-soft hover:bg-femi-600 hover:shadow-lift active:bg-femi-700",
  secondary:
    "border border-femi-200 bg-white text-femi-700 hover:border-femi-300 hover:bg-femi-50",
  ghost: "text-ink-soft hover:bg-femi-50 hover:text-femi-700",
  whatsapp: "bg-[#1d7a45] text-white shadow-soft hover:bg-[#166035] hover:shadow-lift",
  danger: "border border-femi-200 bg-white text-femi-700 hover:bg-femi-50",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-13 px-7 text-base",
};

const BASE =
  "focus-ring inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-55";

export function buttonClass(variant: Variant = "primary", size: Size = "md", extra = "") {
  return `${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${extra}`;
}

interface ButtonProps extends Omit<ComponentProps<"button">, "className"> {
  variant?: Variant;
  size?: Size;
  className?: string;
  loading?: boolean;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClass(variant, size, className)}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}

interface ButtonLinkProps extends Omit<ComponentProps<typeof Link>, "className"> {
  variant?: Variant;
  size?: Size;
  className?: string;
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonLinkProps) {
  return <Link {...props} className={buttonClass(variant, size, className)} />;
}

export function Spinner({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`size-4 animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
    />
  );
}
