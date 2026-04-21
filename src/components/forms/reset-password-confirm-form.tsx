"use client";

// Password-reset confirmation. Supabase attaches the recovery token
// to the URL hash (access_token + refresh_token). The JS library
// picks those up automatically via detectSessionInUrl — but that
// only runs on getSupabaseBrowserClient() calls. Once the session
// is live, updateUser({ password }) sets the new password.

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const schema = z
  .object({
    password: z.string().min(8, "At least 8 characters."),
    confirm: z.string().min(8, "Retype your new password."),
  })
  .refine((v) => v.password === v.confirm, {
    message: "Passwords don't match.",
    path: ["confirm"],
  });

type FormValues = z.infer<typeof schema>;

export function ResetPasswordConfirmForm() {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [banner, setBanner] = useState<string | null>(null);
  const [hasSession, setHasSession] = useState(false);

  // On mount, ask Supabase whether the recovery link yielded a session.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data } = await supabase.auth.getSession();
        if (active) setHasSession(Boolean(data.session));
      } catch {
        if (active) setHasSession(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirm: "" },
  });

  async function onSubmit(values: FormValues) {
    setState("loading");
    setBanner(null);
    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.updateUser({ password: values.password });
      if (error) {
        setBanner(error.message || "Could not update password.");
        setState("error");
        return;
      }
      setState("success");
      setBanner("Password updated. Taking you to your account…");
      setTimeout(() => router.replace("/app"), 800);
    } catch (err) {
      console.error("[reset-confirm]", err);
      setBanner("Unexpected error. Try the reset link again.");
      setState("error");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5">
      <div className="flex items-center gap-3 border-b border-border pb-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink text-white">
          <Lock size={18} />
        </div>
        <div>
          <p className="eyebrow">New password</p>
          <h2 className="mt-1 font-[family-name:var(--font-display)] text-2xl font-semibold text-ink">
            Choose something strong
          </h2>
        </div>
      </div>

      {!hasSession ? (
        <p
          role="status"
          className="rounded-2xl border border-honey/40 bg-honey-soft px-4 py-3 text-sm text-cream-ink"
        >
          If you just clicked the email link, hang on a moment while we finish logging you in. If this
          message stays, the link may have expired — request a new one from{" "}
          <a href="/reset-password" className="font-semibold underline">
            /reset-password
          </a>
          .
        </p>
      ) : null}

      <label className="grid gap-1.5 text-sm font-medium text-ink">
        New password
        <input
          {...register("password")}
          type="password"
          className="fp-input"
          autoComplete="new-password"
          placeholder="8+ characters"
          aria-invalid={Boolean(errors.password)}
        />
        {errors.password ? <span className="text-xs text-brick-ink">{errors.password.message}</span> : null}
      </label>

      <label className="grid gap-1.5 text-sm font-medium text-ink">
        Confirm password
        <input
          {...register("confirm")}
          type="password"
          className="fp-input"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.confirm)}
        />
        {errors.confirm ? <span className="text-xs text-brick-ink">{errors.confirm.message}</span> : null}
      </label>

      <Button type="submit" loading={state === "loading"} disabled={!hasSession}>
        {state === "loading" ? "Updating…" : "Update password"}
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
