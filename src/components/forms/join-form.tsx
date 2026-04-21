"use client";

// JoinForm — the marketing "Start membership" form. Creates an account
// in Supabase (email/password) + captures the property intake in one
// shot, then kicks to /app where the subscribe flow runs Stripe checkout.

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Funnel, identifyUser, track } from "@/lib/analytics/posthog";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const schema = z.object({
  name: z.string().trim().min(1, "Your name, please.").max(120),
  email: z.string().trim().email("Double-check the email."),
  password: z.string().min(8, "At least 8 characters."),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  address: z.string().trim().max(200).optional().or(z.literal("")),
  details: z.string().trim().max(1500).optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

export function JoinForm() {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [banner, setBanner] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "", phone: "", city: "", address: "", details: "" },
  });

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
          },
          // Email confirmation handled by Supabase — user can come back via magic link.
          emailRedirectTo:
            typeof window !== "undefined" ? `${window.location.origin}/app` : undefined,
        },
      });

      if (error) {
        setBanner(error.message || "Could not create account.");
        setState("error");
        track(Funnel.JoinSignUpFailed, { reason: error.message });
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
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label="Full name" error={errors.name?.message}>
          <input {...register("name")} className="fp-input" autoComplete="name" aria-invalid={Boolean(errors.name)} />
        </Field>
        <Field label="Email" error={errors.email?.message}>
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

        <div className="mt-3 flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-ink-subtle">
            Submitting doesn&apos;t charge anything. Billing runs via Stripe once ops confirms your plan.
          </p>
          <Button
            type="submit"
            loading={state === "loading"}
            iconRight={<ArrowRight size={16} />}
          >
            {state === "loading" ? "Creating account…" : "Create account"}
          </Button>
        </div>

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
