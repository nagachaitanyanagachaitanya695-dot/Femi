import Link from "next/link";
import type { ReactNode } from "react";

import { Logo } from "@/components/layout/Logo";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="relative isolate overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(90%_70%_at_50%_0%,#fff5f8_0%,#fffaf7_70%)]"
      />
      <div className="container-page flex min-h-[70dvh] items-center justify-center py-12">
        <div className="w-full max-w-md">
          <div className="mb-6 flex justify-center">
            <Logo />
          </div>
          <div className="rounded-card border border-femi-100 bg-white p-6 shadow-soft sm:p-8">
            <h1 className="font-display text-2xl leading-tight text-ink sm:text-3xl">{title}</h1>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{subtitle}</p>
            <div className="mt-6">{children}</div>
          </div>
          {footer && <div className="mt-5 text-center text-sm text-ink-soft">{footer}</div>}
          <p className="mt-6 text-center text-xs leading-relaxed text-ink-faint">
            By continuing you agree to our{" "}
            <Link href="/policies/terms" className="focus-ring underline hover:text-femi-600">
              terms
            </Link>{" "}
            and{" "}
            <Link href="/policies/privacy" className="focus-ring underline hover:text-femi-600">
              privacy policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
