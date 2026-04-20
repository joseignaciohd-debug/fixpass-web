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
  },
  twitter: {
    card: "summary_large_image",
    title: "Fixpass — Home maintenance, handled.",
    description: "Premium home-maintenance membership. Vetted pros. Stripe-secured billing.",
  },
  applicationName: "Fixpass",
  appleWebApp: {
    title: "Fixpass",
    statusBarStyle: "black-translucent",
  },
  robots: { index: true, follow: true },
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
