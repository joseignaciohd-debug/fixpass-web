import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, CreditCard, MapPin, PhoneCall } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/ui/reveal";
import { FixpassMark } from "@/components/ui/brand-mark";
import { JoinForm } from "@/components/forms/join-form";

export const metadata: Metadata = {
  title: "Join Fixpass",
  description:
    "Start a Fixpass membership in Katy, TX. Tell us about your home and we'll confirm the right plan.",
};

const steps = [
  { icon: MapPin,     title: "We confirm coverage",       copy: "We verify your property fits the current Katy launch area.", tone: "emerald" as const },
  { icon: PhoneCall,  title: "An operator reaches out",   copy: "Quick call or email to guide plan choice and property intake.", tone: "sky" as const },
  { icon: CreditCard, title: "You activate via Stripe",   copy: "Pay securely, schedule your first visit inside your allowance.", tone: "royal" as const },
];

export default function JoinPage() {
  return (
    <main className="relative">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
          <Reveal>
            <span className="eyebrow">Start a membership</span>
            <h1 className="display-hero mt-4 text-4xl text-ink sm:text-5xl lg:text-6xl">
              Tell us about your home.
              <br />
              We&apos;ll handle the follow-through.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-ink-muted">
              Fixpass is a curated membership for households that want small repairs handled without
              the scramble. Submit the form and our operations team will reach out to confirm fit.
            </p>

            <div className="mt-10 space-y-3">
              {steps.map((s, i) => (
                <div
                  key={s.title}
                  className="flex items-start gap-4 rounded-2xl border border-border bg-surface/80 p-5"
                >
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                      s.tone === "emerald"
                        ? "bg-emerald-soft text-emerald-ink"
                        : s.tone === "sky"
                        ? "bg-sky-soft text-sky-ink"
                        : "bg-royal-soft text-royal-ink"
                    }`}
                  >
                    <s.icon size={18} />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-subtle">
                      Step 0{i + 1}
                    </p>
                    <p className="mt-1 font-[family-name:var(--font-display)] text-lg font-semibold text-ink">
                      {s.title}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-ink-muted">{s.copy}</p>
                  </div>
                </div>
              ))}
            </div>

            <Card variant="muted" animate={false} className="mt-10 flex items-start gap-4">
              <FixpassMark size={36} color="rgb(var(--ink))" strokeWidth={7} />
              <div>
                <p className="font-[family-name:var(--font-display)] text-lg font-semibold text-ink">
                  Already a member?
                </p>
                <p className="mt-1 text-sm leading-6 text-ink-muted">
                  Sign in and we&apos;ll route you to your account.
                </p>
                <Link
                  href="/sign-in"
                  className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-royal hover:underline"
                >
                  Go to sign in →
                </Link>
              </div>
            </Card>

            <div className="mt-8 flex items-center gap-2 text-xs text-ink-subtle">
              <CheckCircle2 size={14} className="text-emerald" />
              Billing secured end-to-end by Stripe
            </div>
          </Reveal>

          <JoinForm />
        </div>
      </div>
    </main>
  );
}
