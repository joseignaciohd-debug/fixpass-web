"use client";

// ContactForm — marketing lead form. Submits to /api/contact which
// logs the lead and emails the ops inbox. Client-side Zod validates
// before the network call; server validates again as defense-in-depth.

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";

const schema = z.object({
  name: z.string().trim().min(1, "Your name, please.").max(120),
  email: z.string().trim().email("Double-check the email address."),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  address: z.string().trim().max(200).optional().or(z.literal("")),
  message: z.string().trim().min(10, "A couple sentences helps us route it.").max(2000),
});

type FormValues = z.infer<typeof schema>;

export function ContactForm() {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [banner, setBanner] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", phone: "", city: "", address: "", message: "" },
  });

  async function onSubmit(values: FormValues) {
    setState("loading");
    setBanner(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Request failed");
      setState("success");
      setBanner("Thanks — we'll follow up inside 24 hours.");
      reset();
    } catch {
      setState("error");
      setBanner("Could not submit. Email hello@getfixpass.com directly and we'll reply quickly.");
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="surface-card rounded-[var(--radius-xl)] p-7 sm:p-10"
    >
      <div className="border-b border-border pb-5">
        <p className="eyebrow">Talk to Fixpass</p>
        <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-ink">
          Tell us what you need.
        </h2>
        <p className="mt-2 text-sm leading-6 text-ink-muted">
          We&apos;ll help you choose the right plan and get you scheduled quickly.
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
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
        <Field label="Phone" error={errors.phone?.message} className="sm:col-span-2">
          <input
            {...register("phone")}
            className="fp-input"
            placeholder="(713) 555-0188"
            autoComplete="tel"
          />
        </Field>
        <Field label="City" error={errors.city?.message}>
          <input {...register("city")} className="fp-input" placeholder="Katy" autoComplete="address-level2" />
        </Field>
        <Field label="Property address" error={errors.address?.message}>
          <input
            {...register("address")}
            className="fp-input"
            placeholder="Street address"
            autoComplete="street-address"
          />
        </Field>
        <Field label="What would you like help with?" error={errors.message?.message} className="sm:col-span-2">
          <textarea
            {...register("message")}
            rows={4}
            className="fp-input resize-y"
            placeholder="Shelves to mount, a few picture hangs, a sticky door…"
            aria-invalid={Boolean(errors.message)}
          />
        </Field>
      </div>

      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-ink-subtle">
          Submitting doesn&apos;t charge anything. An operator follows up to confirm fit and plan.
        </p>
        <Button type="submit" loading={state === "loading"} iconRight={<ArrowRight size={16} />}>
          {state === "loading" ? "Submitting…" : "Request access"}
        </Button>
      </div>

      {banner ? (
        <div
          role={state === "error" ? "alert" : "status"}
          className={`mt-5 flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${
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
