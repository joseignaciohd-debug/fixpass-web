"use client";

// ResetPasswordForm — sends the Supabase reset email. The follow-up
// "set new password" page would live at /reset-password/confirm; for now
// the Supabase email link drops users at /sign-in with a session.

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const schema = z.object({
  email: z.string().trim().email("Double-check the email."),
});

type FormValues = z.infer<typeof schema>;

export function ResetPasswordForm() {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [banner, setBanner] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: FormValues) {
    setState("loading");
    setBanner(null);
    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        // Land on /reset-password/confirm where the user types the new
        // password. Supabase attaches the recovery token to the URL
        // hash and the confirm form's useEffect detects the session.
        redirectTo:
          typeof window !== "undefined"
            ? `${window.location.origin}/reset-password/confirm`
            : undefined,
      });
      if (error) {
        setBanner(error.message || "Could not send reset email.");
        setState("error");
        return;
      }
      setState("success");
      setBanner(`Email sent to ${values.email}. Check your inbox — it can take a minute.`);
    } catch (err) {
      console.error("[reset]", err);
      setBanner("Unexpected error. Try again in a moment.");
      setState("error");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
      <label className="grid gap-1.5 text-sm font-medium text-ink">
        <span>Email</span>
        <input
          {...register("email")}
          type="email"
          className="fp-input"
          autoComplete="email"
          placeholder="you@example.com"
          aria-invalid={Boolean(errors.email)}
        />
        {errors.email ? <span className="text-xs text-brick-ink">{errors.email.message}</span> : null}
      </label>

      <Button type="submit" loading={state === "loading"}>
        {state === "loading" ? "Sending…" : "Send reset link"}
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
