import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Logo } from "@/components/layout/Logo";
import { getCurrentUser } from "@/lib/auth/current-user";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false, nocache: true },
};

const TABS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
];

/**
 * Every admin page sits behind this layout, and every admin API route calls
 * requireAdmin() as well — the UI check is convenience, the API check is the
 * one that matters.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "admin") redirect("/account");

  return (
    <div className="min-h-dvh bg-sand/40">
      <div className="border-b border-femi-100 bg-white">
        <div className="container-page flex flex-wrap items-center gap-4 py-4">
          <Logo />
          <span className="rounded-full bg-femi-100 px-3 py-1 text-xs font-bold tracking-wide text-femi-700 uppercase">
            Admin
          </span>
          <nav aria-label="Admin" className="ml-auto flex flex-wrap gap-1">
            {TABS.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                className="focus-ring rounded-full px-4 py-2 text-sm font-medium text-ink-soft transition hover:bg-femi-50 hover:text-femi-700"
              >
                {tab.label}
              </Link>
            ))}
            <Link
              href="/"
              className="focus-ring rounded-full px-4 py-2 text-sm font-medium text-ink-soft transition hover:bg-femi-50"
            >
              View store
            </Link>
          </nav>
        </div>
      </div>
      <div className="container-page py-8 sm:py-10">{children}</div>
    </div>
  );
}
