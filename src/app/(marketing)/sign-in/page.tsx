import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/ui/reveal";
import { SignInForm } from "@/components/forms/sign-in-form";
import { FixpassMark, FIXPASS_TAGLINE } from "@/components/ui/brand-mark";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Fixpass account to manage requests, billing, and membership.",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;

  return (
    <main className="relative">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-12 lg:py-20">
        {/* Brand promise panel */}
        <Reveal>
          <div className="surface-dark relative overflow-hidden rounded-[var(--radius-xl)] p-8 sm:p-12 lg:p-16">
            <div className="relative flex items-center justify-between">
              <FixpassMark size={48} onDark />
              <Link
                href="/"
                className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60 transition hover:text-white"
              >
                ← Back home
              </Link>
            </div>

            <div className="relative mt-14">
              <span className="eyebrow-light">Secure access</span>
              <h1 className="display-hero mt-4 text-4xl text-white sm:text-5xl lg:text-6xl">
                Sign in once.
                <br />
                We route you to the right workspace.
              </h1>
              <p className="mt-6 max-w-lg text-base leading-7 text-white/75">
                Use the same Fixpass credentials as the mobile app. Customer, technician, and operations
                accounts are routed automatically based on role.
              </p>
            </div>

            <div className="relative mt-12 grid gap-3 sm:grid-cols-3">
              <RolePromiseCard title="Customer" copy="Request, track, and pay." />
              <RolePromiseCard title="Technician" copy="Today’s route & jobs." />
              <RolePromiseCard title="Operations" copy="Assign, quote, oversee." />
            </div>

            <div className="relative mt-10 flex items-center gap-3 rounded-2xl border border-white/15 bg-white/[0.08] p-4 text-xs text-white/70 backdrop-blur">
              <ShieldCheck size={18} />
              <span>End-to-end encrypted. Billing and payments handled by Stripe.</span>
            </div>

            <p className="relative mt-14 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/40">
              {FIXPASS_TAGLINE}
            </p>
          </div>
        </Reveal>

        <Card className="rounded-[var(--radius-xl)] p-8 sm:p-10 lg:p-12" animate={false}>
          <SignInForm nextPath={next} initialError={error} />
        </Card>
      </div>
    </main>
  );
}

function RolePromiseCard({ title, copy }: { title: string; copy: string }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/[0.08] px-4 py-5 text-sm backdrop-blur">
      <p className="font-semibold text-white">{title}</p>
      <p className="mt-2 text-xs text-white/70">{copy}</p>
    </div>
  );
}
