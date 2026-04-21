// Dynamic favicon — matches the brand mark without shipping a static
// .ico. Next.js picks this up as /favicon.ico + inserts the correct
// <link rel="icon"> automatically.

import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0B1B3A 0%, #1F4FD1 100%)",
          borderRadius: 14,
        }}
      >
        <div
          style={{
            color: "#FFFFFF",
            fontSize: 44,
            fontWeight: 800,
            fontFamily: "system-ui, Arial, sans-serif",
            letterSpacing: -2,
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
