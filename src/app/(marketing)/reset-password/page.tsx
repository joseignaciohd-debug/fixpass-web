import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/ui/reveal";
import { ResetPasswordForm } from "@/components/forms/reset-password-form";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Reset your Fixpass account password via emailed link.",
};

export default function ResetPasswordPage() {
  return (
    <main className="relative">
      <div className="mx-auto grid max-w-3xl gap-10 px-5 py-14 sm:px-8 lg:px-12 lg:py-24">
        <Reveal>
          <span className="eyebrow">Account</span>
          <h1 className="display-hero mt-4 text-4xl text-ink sm:text-5xl">Reset your password.</h1>
          <p className="mt-4 max-w-md text-base leading-7 text-ink-muted">
            We&apos;ll email you a link to set a new one. The link expires in 1 hour.
          </p>
        </Reveal>

        <Card animate={false}>
          <ResetPasswordForm />
        </Card>
      </div>
    </main>
  );
}
