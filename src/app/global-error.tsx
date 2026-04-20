"use client";

// Global error boundary — catches root-layout failures. Kept intentionally
// small so even if the main CSS/JS bundle is corrupted, this renders.

import { AlertOctagon } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif" }}>
        <main
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            textAlign: "center",
            background: "#F4F7FB",
            color: "#0B1B3A",
          }}
        >
          <AlertOctagon width={40} height={40} color="#D23F5A" />
          <h1 style={{ fontSize: "1.75rem", marginTop: "1.25rem", fontWeight: 600 }}>
            Fixpass ran into a serious error.
          </h1>
          <p style={{ maxWidth: "32rem", marginTop: "0.75rem", color: "#475776", lineHeight: 1.6 }}>
            Please refresh the page. If this keeps happening, email{" "}
            <a href="mailto:hello@getfixpass.com" style={{ color: "#1F4FD1", textDecoration: "underline" }}>
              hello@getfixpass.com
            </a>
            {error.digest ? ` with reference ${error.digest}.` : "."}
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "1.5rem",
              background: "#1F4FD1",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "999px",
              padding: "0.75rem 1.5rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
