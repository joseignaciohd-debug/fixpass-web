"use client";

// SignInForm — email/password sign-in via Supabase Auth (client-side).
// On success, pushes the user to the role-appropriate home. The home
// target is computed server-side by the /app or /admin layout via
// requireRole(), but we do a soft redirect here too for snappiness.

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Funnel, identifyUser, track } from "@/lib/analytics/posthog";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const schema = z.object({
  email: z.string().trim().email("Double-check the email."),
  password: z.string().min(1, "Password required."),
});

type FormValues = z.infer<typeof schema>;

const initialErrorMap: Record<string, string> = {
  credentials: "The email or password did not match a Fixpass account.",
  role: "This account is authenticated but not linked to a Fixpass role yet.",
  config: "Sign-in is not configured correctly. Try again or contact support.",
  confirm_invalid: "That confirmation link is missing or malformed. Try signing in or request a new confirmation.",
  confirm_expired: "That confirmation link has expired or was already used. Sign in to request a new one.",
};

export function SignInForm({ nextPath, initialError }: { nextPath?: string; initialError?: string }) {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  // Show any initial error (e.g., ?error=credentials from proxy) once.
  // Uses the global toast system so the message is visible against our
  // dark hero backgrounds — the inline brick-soft banner used to vanish
  // against the navy wash, which broke login debugging.
  useEffect(() => {
    if (initialError) {
      toast.show(initialErrorMap[initialError] ?? "Sign-in failed.", "error");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialError]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
    mode: "onBlur",
  });

  async function onSubmit(values: FormValues) {
    setLoading(true);
    track(Funnel.SignInSubmitted);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        // Supabase returns a few predictable strings — translate the
        // important ones into user-friendly copy, fall back to raw.
        const msg = error.message?.toLowerCase() ?? "";
        let pretty = error.message || "Sign-in failed.";
        if (msg.includes("email not confirmed")) {
          pretty = "Check your email for a confirmation link before signing in.";
        } else if (msg.includes("invalid login")) {
          pretty = "Email or password doesn't match a Fixpass account.";
        }
        toast.show(pretty, "error");
        track(Funnel.SignInFailed, { reason: error.message });
        return;
      }

      // Identify for PostHog before redirect.
      if (data.user?.id) identifyUser(data.user.id, { email: values.email });
      track(Funnel.SignInSucceeded);

      // Role-aware redirect: let the server decide via /app landing.
      const target = nextPath && nextPath.startsWith("/") ? nextPath : "/app";
      router.replace(target);
      // Force a server re-render so the proxy sees the fresh cookie.
      router.refresh();
    } catch (err) {
      console.error("[sign-in]", err);
      toast.show("Unexpected error. Try again in a moment.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="flex items-center gap-3 border-b border-border pb-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink text-white">
          <Lock size={18} />
        </div>
        <div>
          <p className="eyebrow">Account sign in</p>
          <h2 className="mt-1 font-[family-name:var(--font-display)] text-2xl font-semibold text-ink">
            Open your Fixpass account
          </h2>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-7 grid gap-5">
        <label className="grid gap-2 text-sm font-medium text-ink">
          Email
          <input
            {...register("email")}
            type="email"
            className="fp-input"
            placeholder="you@example.com"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
          />
          {errors.email ? (
            <span className="text-xs text-brick-ink">{errors.email.message}</span>
          ) : null}
        </label>

        <label className="grid gap-2 text-sm font-medium text-ink">
          <span className="flex items-center justify-between">
            Password
            <Link href="/reset-password" className="text-xs font-semibold text-royal hover:underline">
              Forgot?
            </Link>
          </span>
          <input
            {...register("password")}
            type="password"
            className="fp-input"
            placeholder="Enter your password"
            autoComplete="current-password"
            aria-invalid={Boolean(errors.password)}
          />
          {errors.password ? (
            <span className="text-xs text-brick-ink">{errors.password.message}</span>
          ) : null}
        </label>

        <Button type="submit" loading={loading} iconRight={<ArrowRight size={16} />} className="mt-2">
          {loading ? "Signing in…" : "Log in"}
        </Button>

        <p className="text-center text-xs text-ink-subtle">
          Your session stays active for 30 days on this device.
        </p>
      </form>

      <p className="mt-8 text-center text-sm text-ink-muted">
        New to Fixpass?{" "}
        <Link href="/join" className="font-semibold text-royal hover:underline">
          Start a membership →
        </Link>
      </p>
    </>
  );
}
