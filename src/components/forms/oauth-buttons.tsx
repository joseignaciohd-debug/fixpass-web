"use client";

// OAuthButtons — "Continue with Google / Apple" via Supabase Auth.
// Shared by the sign-in form and the join form. The provider redirect
// lands on /auth/callback, which exchanges the code for a session and
// forwards to `nextPath` (validated server-side).
//
// The SVGs are the providers' official marks (required by their brand
// guidelines) — not Fixpass artwork.

import { useState } from "react";
import { useToast } from "@/components/ui/toast";
import { Funnel, track } from "@/lib/analytics/posthog";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Provider = "google" | "apple";

// Apple stays hidden until the Apple Developer account + Supabase
// provider config exist. Flip on by setting NEXT_PUBLIC_ENABLE_APPLE_AUTH=1
// in Vercel — no code change needed.
const APPLE_ENABLED = process.env.NEXT_PUBLIC_ENABLE_APPLE_AUTH === "1";

export function OAuthButtons({ nextPath }: { nextPath?: string }) {
  const toast = useToast();
  const [pending, setPending] = useState<Provider | null>(null);

  async function signInWith(provider: Provider) {
    setPending(provider);
    track(Funnel.OAuthStarted, { provider });
    try {
      const next = nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "/app";
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (error) {
        toast.show(error.message || "Could not start sign-in. Try again.", "error");
        track(Funnel.OAuthFailed, { provider, reason: error.message });
        setPending(null);
      }
      // On success the browser navigates away to the provider — leave
      // the button in its pending state so it doesn't flicker back.
    } catch (err) {
      console.error("[oauth]", err);
      toast.show("Unexpected error. Try again in a moment.", "error");
      track(Funnel.OAuthFailed, { provider, reason: "exception" });
      setPending(null);
    }
  }

  return (
    <div className={`grid gap-3 ${APPLE_ENABLED ? "sm:grid-cols-2" : ""}`}>
      <ProviderButton
        label="Continue with Google"
        pending={pending === "google"}
        disabled={pending !== null}
        onClick={() => signInWith("google")}
        icon={<GoogleIcon />}
      />
      {APPLE_ENABLED ? (
        <ProviderButton
          label="Continue with Apple"
          pending={pending === "apple"}
          disabled={pending !== null}
          onClick={() => signInWith("apple")}
          icon={<AppleIcon />}
        />
      ) : null}
    </div>
  );
}

/** Horizontal "or" rule used between the OAuth buttons and the email form. */
export function OAuthDivider({ label = "or continue with email" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3" role="separator" aria-label={label}>
      <span className="h-px flex-1 bg-border" />
      <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-subtle">
        {label}
      </span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

function ProviderButton({
  label,
  icon,
  pending,
  disabled,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  pending: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="focus-ring inline-flex items-center justify-center gap-2.5 rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-ink shadow-[inset_0_1px_0_rgb(var(--highlight)/0.5)] transition hover:border-border-strong hover:bg-canvas-elevated active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span className="shrink-0" aria-hidden>
        {icon}
      </span>
      {pending ? "Redirecting…" : label}
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72a5.41 5.41 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 17 20" aria-hidden="true" fill="currentColor">
      <path d="M14.13 10.62c.02 2.9 2.54 3.86 2.57 3.87-.02.07-.4 1.38-1.33 2.73-.8 1.17-1.63 2.33-2.94 2.36-1.29.02-1.7-.77-3.17-.77-1.47 0-1.93.74-3.14.79-1.27.05-2.23-1.26-3.04-2.43C1.42 14.78.16 10.4 1.86 7.43a4.72 4.72 0 0 1 3.99-2.42c1.24-.02 2.41.84 3.17.84.76 0 2.18-1.03 3.68-.88.63.03 2.39.25 3.52 1.91-.09.06-2.1 1.23-2.08 3.66M11.7 3.39c.67-.81 1.12-1.94.99-3.06-.96.04-2.13.64-2.82 1.45-.62.72-1.16 1.87-1.02 2.97 1.08.08 2.17-.55 2.85-1.36" />
    </svg>
  );
}
