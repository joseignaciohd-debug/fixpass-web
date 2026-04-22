import type { MetadataRoute } from "next";

// PWA manifest — lets users "Add to Home Screen" on iOS/Android and
// get a standalone-app experience. The icon comes from icon.tsx
// (Next.js auto-registers it).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Fixpass",
    short_name: "Fixpass",
    description: "Home maintenance, handled. The premium membership for Katy, TX.",
    start_url: "/",
    display: "standalone",
    background_color: "#F4F7FB",
    theme_color: "#0B1B3A",
    orientation: "portrait",
    categories: ["lifestyle", "productivity", "utilities"],
    icons: [
      { src: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { src: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { src: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
