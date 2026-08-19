"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { SearchIcon } from "@/components/layout/Icons";
import { categories } from "@/lib/catalog";
import { money } from "@/lib/format";
import type { Product } from "@/lib/types";

import { ProductCard } from "./ProductCard";

type Sort = "popular" | "price-asc" | "price-desc" | "rating" | "discount";

const SORTS: { value: Sort; label: string }[] = [
  { value: "popular", label: "Most popular" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Highest rated" },
  { value: "discount", label: "Biggest discount" },
];

export function ProductBrowser({ products }: { products: Product[] }) {
  const router = useRouter();
  const params = useSearchParams();

  const prices = products.length > 0 ? products.map((p) => p.price) : [0, 100];
  const floor = 0;
  // Round the top of the range up to a clean step above the priciest pack.
  const ceiling = Math.ceil(Math.max(...prices) / 50) * 50;

  const [query, setQuery] = useState(params.get("q") ?? "");
  const [category, setCategory] = useState(params.get("category") ?? "all");
  const [maxPrice, setMaxPrice] = useState(Number(params.get("max")) || ceiling);
  const [sort, setSort] = useState<Sort>((params.get("sort") as Sort) ?? "popular");
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Keep the URL in step so filtered views can be shared and refreshed.
  useEffect(() => {
    const next = new URLSearchParams();
    if (query.trim()) next.set("q", query.trim());
    if (category !== "all") next.set("category", category);
    if (maxPrice < ceiling) next.set("max", String(maxPrice));
    if (sort !== "popular") next.set("sort", sort);

    const search = next.toString();
    router.replace(search ? `/products?${search}` : "/products", { scroll: false });
  }, [query, category, maxPrice, sort, ceiling, router]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();

    const filtered = products.filter((product) => {
      if (category !== "all" && product.category !== category) return false;
      if (product.price > maxPrice) return false;
      if (!needle) return true;

      const haystack = [
        product.name,
        product.short,
        product.size,
        product.length,
        `${product.padCount} pads`,
        product.category,
      ]
        .join(" ")
        .toLowerCase();
      return needle.split(/\s+/).every((word) => haystack.includes(word));
    });

    const sorted = [...filtered];
    switch (sort) {
      case "price-asc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        sorted.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
        break;
      case "discount":
        sorted.sort((a, b) => (b.mrp - b.price) / b.mrp - (a.mrp - a.price) / a.mrp);
        break;
      default:
        sorted.sort((a, b) => b.popularity - a.popularity);
    }
    return sorted;
  }, [products, query, category, maxPrice, sort]);

  const activeFilters =
    (category !== "all" ? 1 : 0) + (maxPrice < ceiling ? 1 : 0) + (query.trim() ? 1 : 0);

  const reset = () => {
    setQuery("");
    setCategory("all");
    setMaxPrice(ceiling);
    setSort("popular");
  };

  const filterControls = (
    <div className="grid gap-7">
      <fieldset>
        <legend className="text-sm font-bold text-ink">Category</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {[{ slug: "all", name: "All products" }, ...categories].map((option) => {
            const selected = category === option.slug;
            return (
              <button
                key={option.slug}
                type="button"
                onClick={() => setCategory(option.slug)}
                aria-pressed={selected}
                className={`focus-ring rounded-full border px-4 py-2 text-sm font-medium transition ${
                  selected
                    ? "border-femi-500 bg-femi-500 text-white"
                    : "border-femi-200 bg-white text-ink-soft hover:border-femi-300 hover:text-femi-700"
                }`}
              >
                {option.name}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div>
        <label htmlFor="max-price" className="flex items-center justify-between text-sm font-bold text-ink">
          Maximum price
          <span className="font-semibold text-femi-600">{money(maxPrice)}</span>
        </label>
        <input
          id="max-price"
          type="range"
          min={floor}
          max={ceiling}
          step={10}
          value={maxPrice}
          onChange={(event) => setMaxPrice(Number(event.target.value))}
          className="focus-ring mt-3 w-full accent-femi-500"
        />
        <div className="mt-1 flex justify-between text-xs text-ink-faint">
          <span>{money(floor)}</span>
          <span>{money(ceiling)}</span>
        </div>
      </div>

      <div>
        <label htmlFor="sort" className="text-sm font-bold text-ink">
          Sort by
        </label>
        <select
          id="sort"
          value={sort}
          onChange={(event) => setSort(event.target.value as Sort)}
          className="focus-ring mt-3 w-full rounded-2xl border border-femi-200 bg-white px-4 py-3 text-sm text-ink"
        >
          {SORTS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {activeFilters > 0 && (
        <Button variant="ghost" onClick={reset} className="justify-self-start">
          Clear all filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[16rem_1fr] lg:gap-10">
      <div className="relative lg:col-start-2 lg:row-start-1">
        <label htmlFor="product-search" className="sr-only">
          Search products
        </label>
        <SearchIcon className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-ink-faint" />
        <input
          id="product-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name, size or pack…"
          className="focus-ring h-12 w-full rounded-full border border-femi-200 bg-white pr-4 pl-11 text-[16px] text-ink placeholder:text-ink-faint"
        />
      </div>

      <aside className="hidden lg:block lg:row-start-2">
        <div className="sticky top-24 rounded-card border border-femi-100 bg-white p-6">
          {filterControls}
        </div>
      </aside>

      <div className="lg:col-start-2 lg:row-start-2">
        <div className="mb-5 flex items-center justify-between gap-3">
          <p className="text-sm text-ink-soft" aria-live="polite">
            <span className="font-semibold text-ink">{results.length}</span>{" "}
            {results.length === 1 ? "product" : "products"}
            {activeFilters > 0 && " matching your filters"}
          </p>
          <Button variant="secondary" size="sm" onClick={() => setDrawerOpen(true)} className="lg:hidden">
            Filters{activeFilters > 0 ? ` (${activeFilters})` : ""}
          </Button>
        </div>

        {results.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="No products match that"
            description="Try a different search term, or clear your filters to see everything."
            action={<Button onClick={reset}>Clear filters</Button>}
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {results.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-ink/35 backdrop-blur-[2px]"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Filter products"
            className="animate-rise absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-3xl bg-cream p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]"
          >
            <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-femi-200" aria-hidden />
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-xl text-ink">Filters</h2>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="focus-ring grid size-9 place-items-center rounded-full bg-white text-ink-soft"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            {filterControls}
            <Button onClick={() => setDrawerOpen(false)} className="mt-8 w-full" size="lg">
              Show {results.length} {results.length === 1 ? "product" : "products"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
