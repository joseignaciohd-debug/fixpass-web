"use client";

// JoinForm — the marketing "Start membership" form. Creates an account
// in Supabase (email/password) + captures the property intake in one
// shot, then kicks to /app where the subscribe flow runs Stripe checkout.

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { OAuthButtons, OAuthDivider } from "@/components/forms/oauth-buttons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Funnel, identifyUser, track } from "@/lib/analytics/posthog";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

// Bump this whenever /terms changes materially. Stored alongside the
// acceptance timestamp so we can prove WHICH version a member agreed to.
// Matches the "Last updated" date on /terms.
const TERMS_VERSION = "2026-04";

const schema = z.object({
  name: z.string().trim().min(1, "Your name, please.").max(120),
  email: z.string().trim().email("Double-check the email."),
  password: z.string().min(8, "At least 8 characters."),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  address: z.string().trim().max(200).optional().or(z.literal("")),
  details: z.string().trim().max(1500).optional().or(z.literal("")),
  termsAccepted: z
    .boolean()
    .refine((v) => v === true, { message: "Please confirm you've read the Terms & Conditions." }),
});

type FormValues = z.infer<typeof schema>;

export function JoinForm({
  preselectPlan,
  preselectCycle,
}: {
  preselectPlan?: string;
  preselectCycle?: string;
} = {}) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [banner, setBanner] = useState<string | null>(null);
  // Step 1 = credentials (name/email/password). Step 2 = property intake.
  // Splitting reduces the visible field count from 7 to 3 at a time
  // and lets the confirmation email start sending between steps.
  const [step, setStep] = useState<1 | 2>(1);

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
      city: "",
      address: "",
      details: "",
      termsAccepted: false,
    },
    mode: "onBlur",
  });

  async function goToStep2() {
    // Validate only the step-1 fields before advancing. Zod schema on
    // useForm handles the enforcement; we just target which fields fire.
    const ok = await trigger(["name", "email", "password"]);
    if (ok) setStep(2);
  }

  async function onSubmit(values: FormValues) {
    setState("loading");
    setBanner(null);
    track(Funnel.JoinSignUpStarted, { city: values.city || null });
    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.name,
            phone: values.phone || null,
            city: values.city || null,
            address: values.address || null,
            details: values.details || null,
            // If the user landed on /join via a plan card on /plans, carry
            // that pick forward so /app/subscribe can pre-select the same
            // (plan, cycle) combo instead of asking again.
            preselect_plan: preselectPlan ?? null,
            preselect_cycle: preselectCycle ?? null,
            // Consent audit trail — proof the member accepted the Terms,
            // when, and which version. Persisted in auth user metadata
            // (no DB migration needed).
            terms_accepted_at: new Date().toISOString(),
            terms_version: TERMS_VERSION,
          },
          // Email confirmation handled by Supabase — user can come back via magic link.
          // Thread the preselect through the redirect so /app/subscribe
          // pre-picks the same (plan, cycle) combo the user chose on /plans.
          emailRedirectTo:
            typeof window !== "undefined"
              ? `${window.location.origin}/app${
                  preselectPlan
                    ? `/subscribe?plan=${preselectPlan}${preselectCycle ? `&cycle=${preselectCycle}` : ""}`
                    : ""
                }`
              : undefined,
        },
      });

      if (error) {
        setBanner(error.message || "Could not create account.");
        setState("error");
        track(Funnel.JoinSignUpFailed, { reason: error.message });
        return;
      }

      // Supabase's signUp for an *already-confirmed* email returns
      // `{ user, session: null }` with an empty `identities` array —
      // i.e. looks identical to the first-time-awaiting-confirmation
      // case from the outside. If we blindly say "check your email,"
      // the user waits forever for a mail that won't come because
      // Supabase suppresses re-confirmation. Detect and redirect them
      // to sign in instead.
      const identities = (data.user as { identities?: unknown[] } | null)?.identities ?? null;
      const alreadyRegistered = Array.isArray(identities) && identities.length === 0;
      if (alreadyRegistered) {
        setState("error");
        setBanner(
          `An account for ${values.email} already exists. Try signing in instead — use "Forgot password" if needed.`,
        );
        track(Funnel.JoinSignUpFailed, { reason: "already_registered" });
        return;
      }

      track(Funnel.JoinSignUpSucceeded);
      if (data.user?.id) identifyUser(data.user.id, { email: values.email });

      // If email confirmation is required (recommended in prod), session is null
      // and we surface a confirmation banner. If confirmation is off, we redirect.
      if (!data.session) {
        setState("success");
        setBanner(
          `Account created. Check ${values.email} for a confirmation email to finish signing in.`,
        );
        return;
      }

      setState("success");
      setBanner("Welcome! Taking you to your account…");
      router.replace("/app");
      router.refresh();
    } catch (err) {
      console.error("[join]", err);
      setBanner("Unexpected error. Try again in a moment.");
      setState("error");
    }
  }

  return (
    <Card className="rounded-[var(--radius-xl)] p-7 sm:p-10" animate={false}>
      <div className="border-b border-border pb-5">
        <p className="eyebrow">Start your membership</p>
        <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-ink">
          Create your Fixpass account
        </h2>
        <p className="mt-2 text-sm leading-6 text-ink-muted">
          We&apos;ll confirm coverage before any charges run.
        </p>
        {preselectPlan ? (
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-royal/25 bg-royal-soft px-3 py-1.5 text-xs font-semibold text-royal-ink">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-royal" />
            Continuing with <span className="capitalize">{preselectPlan}</span>
            {preselectCycle ? ` · ${preselectCycle === "1yr" ? "1-year" : preselectCycle === "6mo" ? "6-month" : "3-month"}` : ""}
          </div>
        ) : null}
      </div>

      {/* Step indicator */}
      <div className="mt-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.14em]">
        <StepPill n={1} label="Account" active={step === 1} done={step === 2} />
        <span className="h-px flex-1 bg-border" />
        <StepPill n={2} label="Property" active={step === 2} done={false} />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 grid gap-4 sm:grid-cols-2">
        {step === 1 ? (
          <>
            <div className="grid gap-4 sm:col-span-2">
              {/* OAuth signups skip the property step — /app collects the
                  property + plan details after the account exists. */}
              <OAuthButtons
                nextPath={
                  preselectPlan
                    ? `/app/subscribe?plan=${preselectPlan}${preselectCycle ? `&cycle=${preselectCycle}` : ""}`
                    : "/app"
                }
              />
              <p className="text-center text-xs text-ink-subtle">
                By continuing, you agree to the{" "}
                <Link
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-royal underline underline-offset-2"
                >
                  Terms &amp; Conditions
                </Link>
                .
              </p>
              <OAuthDivider />
            </div>
            <Field label="Full name" error={errors.name?.message} className="sm:col-span-2">
              <input {...register("name")} className="fp-input" autoComplete="name" aria-invalid={Boolean(errors.name)} />
            </Field>
            <Field label="Email" error={errors.email?.message} className="sm:col-span-2">
              <input
                {...register("email")}
                type="email"
                className="fp-input"
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
              />
            </Field>
            <Field label="Password" error={errors.password?.message} className="sm:col-span-2">
              <input
                {...register("password")}
                type="password"
                className="fp-input"
                autoComplete="new-password"
                placeholder="8+ characters"
                aria-invalid={Boolean(errors.password)}
              />
            </Field>
            <div className="mt-3 flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-ink-subtle">
                No charges yet — billing runs via Stripe after ops confirms your plan.
              </p>
              <Button
                type="button"
                onClick={goToStep2}
                iconRight={<ArrowRight size={16} />}
              >
                Next: Your property
              </Button>
            </div>
          </>
        ) : (
          <>
            <Field label="Phone" error={errors.phone?.message}>
              <input
                {...register("phone")}
                className="fp-input"
                autoComplete="tel"
                placeholder="(713) 555-0188"
              />
            </Field>
            <Field label="City" error={errors.city?.message}>
              <input {...register("city")} className="fp-input" placeholder="Katy" autoComplete="address-level2" />
            </Field>
            <Field label="Property address" error={errors.address?.message} className="sm:col-span-2">
              <input
                {...register("address")}
                className="fp-input"
                placeholder="Street address in Katy, TX"
                autoComplete="street-address"
              />
            </Field>
            <Field
              label="What would you like help with? (optional)"
              error={errors.details?.message}
              className="sm:col-span-2"
            >
              <textarea
                {...register("details")}
                rows={3}
                className="fp-input resize-y"
                placeholder="Shelves to mount, a few picture hangs, a sticky door…"
              />
            </Field>

            <div className="sm:col-span-2">
              <label className="flex items-start gap-3 rounded-2xl border border-border bg-canvas-elevated px-4 py-3.5 text-sm leading-6 text-ink-muted">
                <input
                  type="checkbox"
                  {...register("termsAccepted")}
                  aria-invalid={Boolean(errors.termsAccepted)}
                  className="focus-ring mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-border-strong accent-royal"
                />
                <span>
                  I have read and understand the{" "}
                  <Link
                    href="/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-royal underline underline-offset-2"
                  >
                    Terms &amp; Conditions
                  </Link>
                  .
                </span>
              </label>
              {errors.termsAccepted ? (
                <span className="mt-1.5 block text-xs text-brick-ink">
                  {errors.termsAccepted.message}
                </span>
              ) : null}
            </div>

            <div className="mt-3 flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="focus-ring inline-flex items-center gap-1.5 text-sm font-semibold text-ink-muted transition hover:text-ink"
              >
                <ArrowLeft size={14} /> Back
              </button>
              <Button
                type="submit"
                loading={state === "loading"}
                iconRight={<ArrowRight size={16} />}
              >
                {state === "loading" ? "Creating account…" : "Create account"}
              </Button>
            </div>
          </>
        )}

        {banner ? (
          <div
            role={state === "error" ? "alert" : "status"}
            className={`sm:col-span-2 flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${
              state === "error"
                ? "border-brick/25 bg-brick-soft text-brick-ink"
                : "border-emerald/25 bg-emerald-soft text-emerald-ink"
            }`}
          >
            {state === "success" ? <CheckCircle2 size={18} className="mt-0.5 shrink-0" /> : null}
            <span>{banner}</span>
          </div>
        ) : null}
      </form>
    </Card>
  );
}

function StepPill({
  n,
  label,
  active,
  done,
}: {
  n: number;
  label: string;
  active: boolean;
  done: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] ${
        active
          ? "bg-ink text-white"
          : done
          ? "bg-emerald-soft text-emerald-ink"
          : "bg-canvas-elevated text-ink-subtle"
      }`}
    >
      <span
        className={`grid h-4 w-4 place-items-center rounded-full text-[9px] font-semibold ${
          active ? "bg-white/20" : done ? "bg-emerald/30" : "bg-ink-subtle/20"
        }`}
      >
        {done ? "✓" : n}
      </span>
      {label}
    </span>
  );
}

function Field({
  label,
  error,
  children,
  className,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`grid gap-1.5 text-sm font-medium text-ink ${className ?? ""}`}>
      <span>{label}</span>
      {children}
      {error ? <span className="text-xs text-brick-ink">{error}</span> : null}
    </label>
  );
}
