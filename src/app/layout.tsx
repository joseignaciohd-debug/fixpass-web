import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { ToastProvider } from "@/components/ui/toast";
import { AnalyticsProvider } from "@/components/analytics/analytics-provider";

// Fonts — self-hosted at build. Only weights actually used in the design
// system are downloaded (mirrors what the mobile app ships).
//   Fraunces — warm editorial serif, display only
//   Inter — crisp UI workhorse for body + controls
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-fraunces",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F4F7FB" },
    { media: "(prefers-color-scheme: dark)", color: "#060B1B" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.getfixpass.com"),
  title: {
    default: "Fixpass — Home maintenance, handled.",
    template: "%s — Fixpass",
  },
  description:
    "The premium home-maintenance membership in Katy, TX. Predictable Stripe billing, vetted technicians, and operator-led scheduling for every small repair your home needs.",
  openGraph: {
    title: "Fixpass — Home maintenance, handled.",
    description:
      "The premium membership for home maintenance in Katy, TX. Vetted technicians, transparent coverage, Stripe-secured billing.",
    type: "website",
    siteName: "Fixpass",
    url: "https://www.getfixpass.com",
    locale: "en_US",
    images: [
      {
        url: "/api/og?title=Home%20maintenance%2C%20handled.&eyebrow=Fixpass%20%E2%80%94%20Katy%2C%20TX&subtitle=Predictable%20Stripe%20billing%2C%20vetted%20technicians%2C%20operator-led%20scheduling.",
        width: 1200,
        height: 630,
        alt: "Fixpass — Home maintenance, handled.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fixpass — Home maintenance, handled.",
    description: "Premium home-maintenance membership. Vetted pros. Stripe-secured billing.",
    images: [
      "/api/og?title=Home%20maintenance%2C%20handled.&eyebrow=Fixpass%20%E2%80%94%20Katy%2C%20TX",
    ],
  },
  applicationName: "Fixpass",
  appleWebApp: {
    title: "Fixpass",
    statusBarStyle: "black-translucent",
  },
  // Favicons — ship all common sizes explicitly so Google, Safari,
  // Firefox, Chrome, and social-unfurl bots all get a crisp image
  // without guessing. The ?v=3 cache-buster invalidates any pre-brand
  // cache entries still living in the wild.
  icons: {
    icon: [
      { url: "/favicon.ico?v=3", sizes: "any" },
      { url: "/favicon-16x16.png?v=3", type: "image/png", sizes: "16x16" },
      { url: "/favicon-32x32.png?v=3", type: "image/png", sizes: "32x32" },
      { url: "/favicon-48x48.png?v=3", type: "image/png", sizes: "48x48" },
    ],
    apple: [
      { url: "/apple-touch-icon.png?v=3", sizes: "180x180", type: "image/png" },
    ],
    shortcut: [{ url: "/favicon.ico?v=3" }],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "https://www.getfixpass.com" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      // ThemeProvider adds .dark pre-paint; hydration diff is intended.
      suppressHydrationWarning
      className={`${fraunces.variable} ${inter.variable}`}
    >
      <head>
        {/* Pre-paint theme decision — reads OS preference + localStorage before
            React hydrates. Keeps dark-mode users from seeing a flash of light. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('fixpass-theme');var m=window.matchMedia('(prefers-color-scheme: dark)').matches;var d=s==='dark'||(s==null&&m);if(d)document.documentElement.classList.add('dark');}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <ToastProvider>
            {/* AnalyticsProvider uses useSearchParams which causes a CSR
                bailout. We render it as a SIBLING (not a wrapper) so that
                bailout only affects the empty sidecar, not the page tree. */}
            <Suspense fallback={null}>
              <AnalyticsProvider />
            </Suspense>
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
