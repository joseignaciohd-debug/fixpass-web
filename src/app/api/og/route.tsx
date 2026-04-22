// Dynamic Open Graph image. Any page can reference /api/og?title=...
// to get a 1200x630 PNG that Twitter/Slack/iMessage render inline.
// Uses @vercel/og which runs as an Edge function for fast cold starts.
//
// Edge runtime specifically — Node runtime on Vercel fails to bundle
// @vercel/og's wasm binary ("Cannot find module index.node.js").
// That's why we fetch+base64 the brand PNG instead of reading it off
// disk: the file isn't in the edge bundle, but HTTP to our own origin
// is reliable.

import { ImageResponse } from "@vercel/og";

export const runtime = "edge";

// Pre-generated @vercel/og doesn't support next/font; we inline a base64
// Fraunces 600 via fetch from Google Fonts at runtime (cached by Vercel
// at the edge). For local dev, falls back to the system serif.
async function loadFraunces() {
  try {
    const res = await fetch(
      "https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700&display=swap",
    );
    const css = await res.text();
    const url = /url\((.+?)\) format\('(truetype|opentype)'\)/.exec(css)?.[1];
    if (!url) return null;
    const font = await fetch(url);
    return await font.arrayBuffer();
  } catch {
    return null;
  }
}

// Fetch the brand PNG from our own public/ directory via HTTP and
// turn it into a data URL. Satori's built-in <img> loader failed
// silently in edge runtime — inlining bytes is bulletproof.
async function loadMark(origin: string): Promise<string | null> {
  try {
    const res = await fetch(`${origin}/brand/fixpass-mark.png`);
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    const base64 = arrayBufferToBase64(buf);
    return `data:image/png;base64,${base64}`;
  } catch {
    return null;
  }
}

// Edge runtime has Buffer but not the Node Buffer.toString('base64')
// helper in all environments. This works everywhere Uint8Array does.
function arrayBufferToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  // btoa is available in edge runtime.
  return typeof btoa === "function" ? btoa(bin) : "";
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const { searchParams } = url;
  const title = (searchParams.get("title") ?? "Home maintenance, handled.").slice(0, 120);
  const eyebrow = (searchParams.get("eyebrow") ?? "Fixpass — Katy, TX").slice(0, 80);
  const subtitle = (searchParams.get("subtitle") ?? "").slice(0, 160);

  const [fraunces, markUrl] = await Promise.all([loadFraunces(), loadMark(url.origin)]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background:
            "linear-gradient(135deg, #0B1B3A 0%, #1F4FD1 55%, #1F3FB6 100%)",
          color: "#FFFFFF",
          fontFamily: "Fraunces, Georgia, serif",
        }}
      >
        {/* Ambient glow orbs */}
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -120,
            width: 380,
            height: 380,
            borderRadius: "50%",
            background: "#2F7BFF",
            opacity: 0.35,
            filter: "blur(80px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -120,
            left: -80,
            width: 340,
            height: 340,
            borderRadius: "50%",
            background: "#E8C46C",
            opacity: 0.28,
            filter: "blur(90px)",
          }}
        />

        {/* Eyebrow — real brand mark on a cream tile (PNG is navy on
            transparent, so it reads cleanly against the neutral square
            without needing a white variant). */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, zIndex: 2 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              background: "#F4F0E4",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {markUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={markUrl}
                alt=""
                width={40}
                height={40}
                style={{ objectFit: "contain" }}
              />
            ) : (
              // Fallback if the mark PNG fetch failed — a bold "F" on
              // cream at least keeps the OG card on-brand instead of
              // crashing the render.
              <div
                style={{
                  color: "#0B1B3A",
                  fontSize: 28,
                  fontWeight: 800,
                  fontFamily: "Inter, sans-serif",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  lineHeight: 1,
                }}
              >
                F
              </div>
            )}
          </div>
          <div
            style={{
              fontSize: 18,
              letterSpacing: 4,
              textTransform: "uppercase",
              fontWeight: 800,
              fontFamily: "Inter, sans-serif",
              color: "rgba(255,255,255,0.72)",
            }}
          >
            {eyebrow}
          </div>
        </div>

        {/* Title + subtitle */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20, zIndex: 2 }}>
          <div
            style={{
              fontSize: 86,
              lineHeight: 1.04,
              fontWeight: 700,
              letterSpacing: "-0.03em",
              maxWidth: 1000,
            }}
          >
            {title}
          </div>
          {subtitle ? (
            <div
              style={{
                fontSize: 24,
                lineHeight: 1.4,
                fontFamily: "Inter, sans-serif",
                color: "rgba(255,255,255,0.8)",
                maxWidth: 800,
              }}
            >
              {subtitle}
            </div>
          ) : null}
        </div>

        {/* Footer strip */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontFamily: "Inter, sans-serif",
            fontSize: 18,
            color: "rgba(255,255,255,0.7)",
            zIndex: 2,
          }}
        >
          <span>getfixpass.com</span>
          <span>Stripe-secured billing · Vetted technicians</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: fraunces
        ? [
            {
              name: "Fraunces",
              data: fraunces,
              style: "normal",
              weight: 700,
            },
          ]
        : undefined,
    },
  );
}
