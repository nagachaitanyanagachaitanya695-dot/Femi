"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { MobileTabBar } from "./MobileTabBar";

/**
 * The storefront's header, footer and mobile tab bar.
 *
 * The admin dashboard lives under the same root layout but brings its own
 * chrome, so the shop navigation is left out there rather than stacking two
 * headers on top of each other.
 */
export function StoreChrome({
  header,
  footer,
  children,
}: {
  header: ReactNode;
  footer: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  /**
   * The landing page is the film and nothing else — no bar across the top, no
   * footer, no tab bar. Its own buttons carry the reader into the shop, and
   * any chrome over it would break the single full-screen scene it is.
   */
  const isLanding = pathname === "/";
  const chrome = !isAdmin && !isLanding;

  return (
    <>
      {chrome && header}
      <main id="main" className={chrome ? "pb-20 md:pb-0" : undefined}>
        {children}
      </main>
      {chrome && footer}
      {chrome && <MobileTabBar />}
    </>
  );
}
