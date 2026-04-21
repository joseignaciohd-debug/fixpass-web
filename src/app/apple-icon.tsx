// Apple touch icon — 180x180 for iOS home-screen installs.

import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0B1B3A 0%, #1F4FD1 55%, #1F3FB6 100%)",
          borderRadius: 36,
        }}
      >
        <div
          style={{
            color: "#FFFFFF",
            fontSize: 124,
            fontWeight: 800,
            fontFamily: "system-ui, Arial, sans-serif",
            letterSpacing: -6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: 1,
          }}
        >
          F
        </div>
      </div>
    ),
    { ...size },
  );
}
