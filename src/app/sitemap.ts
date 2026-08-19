import type { MetadataRoute } from "next";

import { getStore } from "@/lib/db";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, priority: 1 },
    { url: `${base}/products`, lastModified: now, priority: 0.9 },
    ...["shipping", "returns", "privacy", "terms"].map((slug) => ({
      url: `${base}/policies/${slug}`,
      lastModified: now,
      priority: 0.3,
    })),
  ];

  // A database that is unreachable at build time should cost us the product
  // URLs, not the whole deploy.
  try {
    const products = await getStore().listProducts();
    return [
      ...staticRoutes,
      ...products.map((product) => ({
        url: `${base}/products/${product.slug}`,
        lastModified: now,
        priority: 0.8,
      })),
    ];
  } catch (error) {
    console.error("[femi][sitemap] could not load products:", error);
    return staticRoutes;
  }
}
