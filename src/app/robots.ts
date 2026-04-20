import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Keep auth-gated zones out of search indexes.
        disallow: ["/app", "/admin", "/api"],
      },
    ],
    sitemap: "https://www.getfixpass.com/sitemap.xml",
  };
}
