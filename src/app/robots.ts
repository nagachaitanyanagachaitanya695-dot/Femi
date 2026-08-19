import type { MetadataRoute } from "next";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Nothing behind a login, and nothing order-specific, belongs in an index.
      disallow: ["/admin", "/account", "/checkout", "/cart", "/order", "/api", "/login", "/signup"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
