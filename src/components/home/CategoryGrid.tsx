import Link from "next/link";

import { SectionHeading } from "@/components/ui/Section";
import type { Category, Product } from "@/lib/types";

export function CategoryGrid({
  categories,
  products,
}: {
  categories: Category[];
  products: Product[];
}) {
  const countFor = (slug: string) => products.filter((p) => p.category === slug).length;

  return (
    <>
      <SectionHeading
        eyebrow="Find your size"
        title="Shop by category"
        description="Regular days, heavy days, long nights, or a full cycle in one box."
      />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={`/products?category=${category.slug}`}
            className="focus-ring group relative overflow-hidden rounded-card border border-femi-100 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
          >
            <span
              aria-hidden
              className="absolute -top-10 -right-10 size-28 rounded-full opacity-25 transition-transform duration-500 group-hover:scale-125"
              style={{ backgroundColor: category.theme.base }}
            />
            <span
              aria-hidden
              className="block h-1.5 w-10 rounded-full"
              style={{ backgroundColor: category.theme.band }}
            />
            <h3 className="relative mt-5 font-display text-xl text-ink">{category.name}</h3>
            <p className="relative mt-2 text-sm leading-relaxed text-ink-soft">{category.blurb}</p>
            <p className="relative mt-5 text-xs font-semibold text-femi-600">
              {countFor(category.slug)} product{countFor(category.slug) === 1 ? "" : "s"} →
            </p>
          </Link>
        ))}
      </div>
    </>
  );
}
