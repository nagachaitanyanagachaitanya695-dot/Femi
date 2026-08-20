"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useAuth } from "@/components/providers/AuthProvider";
import { useCart } from "@/components/providers/CartProvider";
import { ButtonLink } from "@/components/ui/Button";
import { categories } from "@/lib/catalog";

import { CartIcon, SearchIcon, UserIcon } from "./Icons";
import { Logo } from "./Logo";

const LINKS = [
  { href: "/products", label: "Shop all" },
  { href: "/products?category=overnight", label: "Overnight" },
  { href: "/products?category=value-packs", label: "Value packs" },
  { href: "/#faq", label: "Help" },
];

export function Navbar() {
  const { count, ready } = useCart();
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = query.trim();
    router.push(trimmed ? `/products?q=${encodeURIComponent(trimmed)}` : "/products");
    setSearchOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-femi-100/80 bg-cream/85 backdrop-blur-md">
      <div className="container-page flex h-16 items-center gap-3">
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="primary-menu"
          aria-label="Menu"
          className="focus-ring -ml-1 grid size-10 place-items-center rounded-full text-ink transition hover:bg-femi-50 lg:hidden"
        >
          <span aria-hidden className="relative block h-3.5 w-5">
            <span
              className={`absolute inset-x-0 top-0 h-0.5 rounded bg-current transition-transform ${menuOpen ? "translate-y-1.5 rotate-45" : ""}`}
            />
            <span
              className={`absolute inset-x-0 top-1.5 h-0.5 rounded bg-current transition-opacity ${menuOpen ? "opacity-0" : ""}`}
            />
            <span
              className={`absolute inset-x-0 top-3 h-0.5 rounded bg-current transition-transform ${menuOpen ? "-translate-y-1.5 -rotate-45" : ""}`}
            />
          </span>
        </button>

        <Logo priority />

        <nav aria-label="Primary" className="ml-6 hidden items-center gap-1 lg:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="focus-ring rounded-full px-3.5 py-2 text-sm font-medium text-ink-soft transition hover:bg-femi-50 hover:text-femi-700"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <form onSubmit={submitSearch} className="hidden items-center md:flex">
            <label htmlFor="nav-search" className="sr-only">
              Search products
            </label>
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-faint" />
              <input
                id="nav-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search pads…"
                className="focus-ring h-10 w-44 rounded-full border border-femi-200 bg-white pr-3 pl-9 text-sm text-ink placeholder:text-ink-faint transition focus:w-56 focus:border-femi-400"
              />
            </div>
          </form>

          <button
            type="button"
            onClick={() => setSearchOpen((open) => !open)}
            aria-label="Search"
            aria-expanded={searchOpen}
            className="focus-ring grid size-10 place-items-center rounded-full text-ink transition hover:bg-femi-50 md:hidden"
          >
            <SearchIcon />
          </button>

          <Link
            href={user ? "/account" : "/login"}
            aria-label={user ? "Your account" : "Sign in"}
            className="focus-ring hidden size-10 place-items-center rounded-full text-ink transition hover:bg-femi-50 sm:grid"
          >
            <UserIcon />
          </Link>

          <Link
            href="/cart"
            aria-label={`Cart${ready && count > 0 ? `, ${count} item${count === 1 ? "" : "s"}` : ""}`}
            className="focus-ring relative grid size-10 place-items-center rounded-full text-ink transition hover:bg-femi-50"
          >
            <CartIcon />
            {ready && count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 grid min-w-5 place-items-center rounded-full bg-femi-500 px-1 text-[11px] font-bold text-white">
                {count > 99 ? "99+" : count}
              </span>
            )}
          </Link>

          <span className="ml-2 hidden lg:block">
            <ButtonLink href="/products" size="sm">
              Shop now
            </ButtonLink>
          </span>
        </div>
      </div>

      {searchOpen && (
        <div className="container-page pb-3 md:hidden">
          <form onSubmit={submitSearch} className="relative">
            <label htmlFor="mobile-search" className="sr-only">
              Search products
            </label>
            <SearchIcon className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-ink-faint" />
            <input
              id="mobile-search"
              ref={searchRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search pads, sizes, packs…"
              className="focus-ring h-12 w-full rounded-full border border-femi-200 bg-white pr-4 pl-11 text-[16px] text-ink placeholder:text-ink-faint"
            />
          </form>
        </div>
      )}

      {menuOpen && (
        <nav
          id="primary-menu"
          aria-label="Mobile"
          className="animate-rise border-t border-femi-100 bg-cream lg:hidden"
        >
          <div className="container-page grid gap-1 py-3">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="focus-ring rounded-2xl px-3 py-3 text-sm font-semibold text-ink transition hover:bg-femi-50"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 border-t border-femi-100 pt-3">
              <p className="px-3 pb-1 text-xs font-semibold tracking-widest text-ink-faint uppercase">
                Categories
              </p>
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/products?category=${category.slug}`}
                  className="focus-ring block rounded-2xl px-3 py-2.5 text-sm text-ink-soft transition hover:bg-femi-50"
                >
                  {category.name}
                </Link>
              ))}
            </div>
            <Link
              href={user ? "/account" : "/login"}
              className="focus-ring mt-2 rounded-2xl px-3 py-3 text-sm font-semibold text-femi-700 transition hover:bg-femi-50"
            >
              {user ? `Your account (${user.fullName || user.email})` : "Sign in / Sign up"}
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
