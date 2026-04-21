"use client";

// NewRequestForm — mirrors the mobile requests intake. Zod-validated
// client-side, submitted via server action which writes to Supabase.
// Photos upload directly to Supabase Storage; only their paths ride
// the server-action payload (keeps the action fast + under any body
// size limits).

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { PhotoUpload } from "@/components/forms/photo-upload";
import { createServiceRequest } from "@/app/(app)/app/requests/actions";

const schema = z.object({
  title: z.string().trim().min(4, "A quick label — e.g. 'Patch nursery wall'.").max(120),
  description: z.string().trim().min(10, "A couple sentences helps us route it.").max(2000),
  area: z.string().trim().max(120).optional().or(z.literal("")),
  preferredWindow: z.string().trim().max(120).optional().or(z.literal("")),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

const quickCategories = ["Drywall patch", "Door adjust", "Caulk touch-up", "Shelves or decor"];

export function NewRequestForm({ userId }: { userId: string }) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [banner, setBanner] = useState<string | null>(null);
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [photoPaths, setPhotoPaths] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", description: "", area: "", preferredWindow: "", notes: "" },
  });

  async function onSubmit(values: FormValues) {
    setState("loading");
    setBanner(null);
    try {
      const res = await createServiceRequest({ ...values, photoPaths });
      if (res?.error) {
        setBanner(res.error);
        setState("error");
        return;
      }
      setState("success");
      setBanner("Request submitted. An operator will review within 24 hours.");
      router.push("/app/requests");
      router.refresh();
    } catch (err) {
      console.error("[new-request]", err);
      setBanner("Could not submit. Try again in a moment.");
      setState("error");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5">
      <div className="flex flex-wrap gap-2">
        {quickCategories.map((c) => (
          <Chip
            key={c}
            label={c}
            selected={selectedCat === c}
            onToggle={() => {
              const next = selectedCat === c ? null : c;
              setSelectedCat(next);
              if (next) setValue("title", next, { shouldValidate: false });
            }}
          />
        ))}
      </div>

      <label className="grid gap-1.5 text-sm font-medium text-ink">
        What do you need help with?
        <input
          {...register("title")}
          className="fp-input"
          placeholder="e.g. Patch small holes in living room"
          aria-invalid={Boolean(errors.title)}
        />
        {errors.title ? <span className="text-xs text-brick-ink">{errors.title.message}</span> : null}
      </label>

      <label className="grid gap-1.5 text-sm font-medium text-ink">
        Describe the issue
        <textarea
          {...register("description")}
          rows={5}
          className="fp-input resize-y"
          placeholder="Where it is, what would help the technician arrive ready, anything else operations should know."
          aria-invalid={Boolean(errors.description)}
        />
        {errors.description ? (
          <span className="text-xs text-brick-ink">{errors.description.message}</span>
        ) : null}
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-medium text-ink">
          Area
          <input {...register("area")} className="fp-input" placeholder="Living room" />
        </label>
        <label className="grid gap-1.5 text-sm font-medium text-ink">
          Preferred window
          <input {...register("preferredWindow")} className="fp-input" placeholder="Thursday morning" />
        </label>
      </div>

      <label className="grid gap-1.5 text-sm font-medium text-ink">
        Access notes (optional)
        <textarea
          {...register("notes")}
          rows={2}
          className="fp-input resize-y"
          placeholder="Gate code, pet, parking, anything else operations should know."
        />
      </label>

      <div className="grid gap-2">
        <p className="text-sm font-medium text-ink">Attach photos (optional)</p>
        <PhotoUpload userId={userId} onChange={setPhotoPaths} />
      </div>

      <Button type="submit" loading={state === "loading"} className="w-full sm:w-auto">
        {state === "loading" ? "Submitting…" : "Submit request"}
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
