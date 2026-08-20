import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/site-url";


const base = getSiteUrl();

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
