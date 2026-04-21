import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/ui/reveal";
import { ResetPasswordConfirmForm } from "@/components/forms/reset-password-confirm-form";

export const metadata: Metadata = {
  title: "Set a new password",
  description: "Complete the Fixpass password reset flow.",
};

// Supabase's password-reset email link lands here (we configure
// redirectTo in the send-reset form to point at this URL). When the
// user clicks the link, Supabase attaches a recovery token to the
// URL hash; the client form extracts it and sets the new password.
export default function ResetPasswordConfirmPage() {
  return (
    <main className="relative">
      <div className="mx-auto grid max-w-xl gap-8 px-5 py-14 sm:px-8 lg:px-12 lg:py-24">
        <Reveal>
          <span className="eyebrow">Account</span>
          <h1 className="display-hero mt-4 text-4xl text-ink sm:text-5xl">Set a new password.</h1>
          <p className="mt-4 text-base leading-7 text-ink-muted">
            The link is single-use and expires in 1 hour. Choose something strong and memorable.
          </p>
        </Reveal>

        <Card animate={false}>
          <ResetPasswordConfirmForm />
        </Card>
      </div>
    </main>
  );
}
