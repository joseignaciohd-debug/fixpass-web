import type { MetadataRoute } from "next";

// Marketing surface only — portal pages are authenticated, don't index.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.getfixpass.com";
  const now = new Date();

  const pages = [
    { path: "/",              priority: 1.0, changeFrequency: "weekly" as const },
    { path: "/plans",         priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/how-it-works",  priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/coverage",      priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/faq",           priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/contact",       priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/support",       priority: 0.5, changeFrequency: "monthly" as const },
    { path: "/join",          priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/sign-in",       priority: 0.4, changeFrequency: "yearly" as const },
    { path: "/privacy",       priority: 0.3, changeFrequency: "yearly" as const },
    { path: "/terms",         priority: 0.3, changeFrequency: "yearly" as const },
  ];

  return pages.map((p) => ({
    url: `${base}${p.path}`,
    lastModified: now,
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }));
}
