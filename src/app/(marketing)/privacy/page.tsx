import type { Metadata } from "next";
import { Reveal } from "@/components/ui/reveal";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How Fixpass collects, uses, and protects the personal data you share with us.",
  alternates: { canonical: "https://www.getfixpass.com/privacy" },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
      <Reveal>
        <span className="eyebrow">Legal</span>
        <h1 className="display-hero mt-4 text-5xl text-ink sm:text-6xl">Privacy.</h1>
        <p className="mt-4 text-sm text-ink-subtle">Last updated: April 2026</p>
      </Reveal>

      <article className="prose prose-sm mt-10 max-w-none text-ink-muted [&_h2]:display-section [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:text-ink [&_p]:leading-7 [&_a]:text-royal">
        <p>
          Fixpass is a home-maintenance membership operated in Katy, Texas. We collect information that
          lets us run a membership, schedule technicians, bill accurately, and keep your home looked
          after. This page explains what we collect, why, and how you can control it.
        </p>

        <h2>What we collect</h2>
        <p>
          Your name, email, phone, service address, access notes, and a record of the repair requests
          you submit. Billing info (credit card) is handled by Stripe — we never see full card
          numbers. If you use the Fixpass mobile app, we also collect push-notification tokens so we
          can tell you when a request moves forward.
        </p>

        <h2>How we use it</h2>
        <p>
          To create and manage your account, confirm coverage, route requests to an operator, schedule
          visits with technicians, and notify you as work progresses. We do not sell personal data and
          we do not share it with advertisers.
        </p>

        <h2>Analytics</h2>
        <p>
          We run privacy-respecting analytics (PostHog, Sentry for crash reports) with default-PII off.
          We honor Do Not Track and we respect browser-level opt-outs. You can ask for your events to
          be deleted any time.
        </p>

        <h2>Your rights</h2>
        <p>
          You can ask to export your data, ask us to delete your account, or restrict how we use your
          info. Email <a href="mailto:hello@getfixpass.com">hello@getfixpass.com</a> and we&apos;ll
          process the request inside 30 days.
        </p>

        <h2>Security</h2>
        <p>
          Passwords are stored hashed (Supabase Auth). Access to your data is gated by row-level
          security policies in our database so another customer can&apos;t see your records even if our
          app had a bug. Stripe handles payment cryptography end-to-end.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about privacy?{" "}
          <a href="mailto:hello@getfixpass.com">hello@getfixpass.com</a>
        </p>
      </article>
    </main>
  );
}
