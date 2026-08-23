import Link from "next/link";

import { categories } from "@/lib/catalog";
import { site } from "@/lib/site";
import { supportLink } from "@/lib/whatsapp";

import { WhatsAppIcon } from "./Icons";
import { Logo } from "./Logo";

const POLICIES = [
  { href: "/policies/shipping", label: "Shipping & delivery" },
  { href: "/policies/returns", label: "Returns & refunds" },
  { href: "/policies/privacy", label: "Privacy policy" },
  { href: "/policies/terms", label: "Terms of service" },
];

export function Footer() {
  return (
    <footer className="mt-20 border-t border-femi-100 bg-white">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-soft">{site.description}</p>
          <a
            href={supportLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring mt-5 inline-flex items-center gap-2 rounded-full bg-[#1d7a45] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#166035]"
          >
            <WhatsAppIcon className="size-4" />
            Chat with us
          </a>
        </div>

        <nav aria-labelledby="footer-shop">
          <h2 id="footer-shop" className="text-sm font-bold tracking-widest text-ink uppercase">
            Shop
          </h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <Link href="/products" className="focus-ring text-ink-soft transition hover:text-femi-600">
                All products
              </Link>
            </li>
            {categories.map((category) => (
              <li key={category.slug}>
                <Link
                  href={`/products?category=${category.slug}`}
                  className="focus-ring text-ink-soft transition hover:text-femi-600"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-labelledby="footer-policies">
          <h2 id="footer-policies" className="text-sm font-bold tracking-widest text-ink uppercase">
            Policies
          </h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {POLICIES.map((policy) => (
              <li key={policy.href}>
                <Link href={policy.href} className="focus-ring text-ink-soft transition hover:text-femi-600">
                  {policy.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/account/orders" className="focus-ring text-ink-soft transition hover:text-femi-600">
                Track my order
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-bold tracking-widest text-ink uppercase">Contact</h2>
          <ul className="mt-4 space-y-3 text-sm text-ink-soft">
            <li>
              <span className="block text-xs tracking-wide text-ink-faint uppercase">WhatsApp orders</span>
              <a
                href={supportLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="focus-ring font-semibold text-ink transition hover:text-femi-600"
              >
                {site.whatsappDisplay}
              </a>
            </li>
            <li>
              <span className="block text-xs tracking-wide text-ink-faint uppercase">Email</span>
              <a
                href={`mailto:${site.supportEmail}`}
                className="focus-ring font-semibold break-all text-ink transition hover:text-femi-600"
              >
                {site.supportEmail}
              </a>
            </li>
            <li>
              <span className="block text-xs tracking-wide text-ink-faint uppercase">Courier partner</span>
              <a
                href={site.courier.site}
                target="_blank"
                rel="noopener noreferrer"
                className="focus-ring font-semibold text-ink transition hover:text-femi-600"
              >
                {site.courier.name}
              </a>
              <p className="mt-1 text-xs leading-relaxed text-ink-faint">{site.courier.note}</p>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-femi-100">
        <div className="container-page flex flex-col gap-3 py-6 text-xs text-ink-faint sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name}. All rights reserved.{" "}
            {/*
              Which build is on screen. Working out whether a change had
              actually shipped was costing more time than the changes did; one
              look at the footer now answers it. A commit hash is public
              information — the repository is public — and says nothing about
              configuration.
            */}
            <span className="opacity-60">
              build {(process.env.VERCEL_GIT_COMMIT_SHA ?? "local").slice(0, 7)}
            </span>
          </p>
          <p className="max-w-xl leading-relaxed">{site.disclaimer}</p>
        </div>
      </div>
    </footer>
  );
}
