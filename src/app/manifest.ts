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
      { src: "/icon", sizes: "64x64", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
