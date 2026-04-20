"use client";

// PropertyForm — edit the registered property. Reuses the same
// address validation rules as the mobile app (nickname, 5 or 9 digit
// ZIP, state whitelist, address max length).

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Save } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { saveProperty } from "@/app/(app)/app/property/actions";

const US_STATES = /^(AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY|DC)$/i;

const schema = z.object({
  nickname: z.string().trim().min(1, "Give it a nickname.").max(60),
  addressLine1: z.string().trim().min(1, "Street address required.").max(120),
  city: z.string().trim().min(1, "City required.").max(80),
  state: z
    .string()
    .trim()
    .length(2, "Two-letter state code.")
    .transform((v) => v.toUpperCase())
    .refine((v) => US_STATES.test(v), "Unknown state code."),
  postalCode: z
    .string()
    .trim()
    .regex(/^\d{5}(-\d{4})?$/, "Use 77450 or 77450-1234."),
  homeType: z.string().trim().max(40).optional().or(z.literal("")),
  accessNotes: z.string().trim().max(400).optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

export function PropertyForm({
  initial,
}: {
  initial: {
    nickname: string;
    address: string;
    homeType: string;
    accessNotes: string;
  } | null;
}) {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [banner, setBanner] = useState<string | null>(null);

  // We can't perfectly reverse-parse the combined address string; prefill
  // nickname + notes + homeType, leave address fields empty unless the
  // row came back with structured data in the future.
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nickname: initial?.nickname ?? "My home",
      addressLine1: "",
      city: "",
      state: "",
      postalCode: "",
      homeType: initial?.homeType ?? "",
      accessNotes: initial?.accessNotes ?? "",
    },
  });

  async function onSubmit(values: FormValues) {
    setState("loading");
    setBanner(null);
    const res = await saveProperty(values);
    if (res?.error) {
      setBanner(res.error);
      setState("error");
      return;
    }
    setState("success");
    setBanner("Saved. Technicians will see the updated details.");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-medium text-ink">
          Nickname
          <input {...register("nickname")} className="fp-input" aria-invalid={Boolean(errors.nickname)} />
          {errors.nickname ? <span className="text-xs text-brick-ink">{errors.nickname.message}</span> : null}
        </label>
        <label className="grid gap-1.5 text-sm font-medium text-ink">
          Home type (optional)
          <input {...register("homeType")} className="fp-input" placeholder="Single-family, condo…" />
        </label>
      </div>

      <label className="grid gap-1.5 text-sm font-medium text-ink">
        Street address
        <input {...register("addressLine1")} className="fp-input" autoComplete="street-address" aria-invalid={Boolean(errors.addressLine1)} />
        {errors.addressLine1 ? <span className="text-xs text-brick-ink">{errors.addressLine1.message}</span> : null}
      </label>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="grid gap-1.5 text-sm font-medium text-ink">
          City
          <input {...register("city")} className="fp-input" autoComplete="address-level2" aria-invalid={Boolean(errors.city)} />
          {errors.city ? <span className="text-xs text-brick-ink">{errors.city.message}</span> : null}
        </label>
        <label className="grid gap-1.5 text-sm font-medium text-ink">
          State
          <input {...register("state")} className="fp-input uppercase" maxLength={2} placeholder="TX" autoComplete="address-level1" aria-invalid={Boolean(errors.state)} />
          {errors.state ? <span className="text-xs text-brick-ink">{errors.state.message}</span> : null}
        </label>
        <label className="grid gap-1.5 text-sm font-medium text-ink">
          ZIP
          <input {...register("postalCode")} className="fp-input" placeholder="77450" autoComplete="postal-code" aria-invalid={Boolean(errors.postalCode)} />
          {errors.postalCode ? <span className="text-xs text-brick-ink">{errors.postalCode.message}</span> : null}
        </label>
      </div>

      <label className="grid gap-1.5 text-sm font-medium text-ink">
        Access notes (optional)
        <textarea
          {...register("accessNotes")}
          rows={3}
          className="fp-input resize-y"
          placeholder="Gate code, pets, parking instructions…"
        />
        {errors.accessNotes ? <span className="text-xs text-brick-ink">{errors.accessNotes.message}</span> : null}
      </label>

      <Button type="submit" loading={state === "loading"} iconLeft={<Save className="h-4 w-4" />}>
        {state === "loading" ? "Saving…" : "Save property"}
      </Button>

      {banner ? (
        <div
          role={state === "error" ? "alert" : "status"}
          className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${
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
