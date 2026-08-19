"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAuth } from "@/components/providers/AuthProvider";
import { useCart } from "@/components/providers/CartProvider";

import { CartIcon, GridIcon, HomeIcon, UserIcon } from "./Icons";

/** Thumb-reachable navigation. Hidden from tablets up, where the header is enough. */
export function MobileTabBar() {
  const pathname = usePathname();
  const { count, ready } = useCart();
  const { user } = useAuth();

  const tabs = [
    { href: "/", label: "Home", icon: HomeIcon, match: (p: string) => p === "/" },
    { href: "/products", label: "Shop", icon: GridIcon, match: (p: string) => p.startsWith("/products") },
    { href: "/cart", label: "Cart", icon: CartIcon, match: (p: string) => p.startsWith("/cart") },
    {
      href: user ? "/account" : "/login",
      label: user ? "Account" : "Sign in",
      icon: UserIcon,
      match: (p: string) => p.startsWith("/account") || p.startsWith("/login"),
    },
  ];

  if (pathname.startsWith("/admin")) return null;

  return (
    <nav
      aria-label="Quick navigation"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-femi-100 bg-cream/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
    >
      <ul className="grid grid-cols-4">
        {tabs.map((tab) => {
          const active = tab.match(pathname);
          const Icon = tab.icon;
          return (
            <li key={tab.label}>
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={`focus-ring relative flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold transition ${
                  active ? "text-femi-600" : "text-ink-faint"
                }`}
              >
                <span className="relative">
                  <Icon className="size-5" />
                  {tab.label === "Cart" && ready && count > 0 && (
                    <span className="absolute -top-1 -right-2 grid min-w-4 place-items-center rounded-full bg-femi-500 px-1 text-[10px] font-bold text-white">
                      {count > 9 ? "9+" : count}
                    </span>
                  )}
                </span>
                {tab.label}
                {active && (
                  <span aria-hidden className="absolute inset-x-6 top-0 h-0.5 rounded-full bg-femi-500" />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
