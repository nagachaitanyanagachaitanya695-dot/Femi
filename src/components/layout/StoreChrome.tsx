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

  return (
    <>
      {!isAdmin && header}
      <main id="main" className={isAdmin ? undefined : "pb-20 md:pb-0"}>
        {children}
      </main>
      {!isAdmin && footer}
      <MobileTabBar />
    </>
  );
}
