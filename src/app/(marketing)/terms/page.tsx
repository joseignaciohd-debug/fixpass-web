import type { Metadata } from "next";
import { Reveal } from "@/components/ui/reveal";

export const metadata: Metadata = {
  title: "Terms",
  description: "The contract between you and Fixpass when you join a membership.",
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
      <Reveal>
        <span className="eyebrow">Legal</span>
        <h1 className="display-hero mt-4 text-5xl text-ink sm:text-6xl">Terms.</h1>
        <p className="mt-4 text-sm text-ink-subtle">Last updated: April 2026</p>
      </Reveal>

      <article className="prose prose-sm mt-10 max-w-none text-ink-muted [&_h2]:display-section [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:text-ink [&_p]:leading-7 [&_a]:text-royal">
        <p>
          This page is the agreement between you (&ldquo;member&rdquo;) and Fixpass when you start a
          membership. It&apos;s written plainly on purpose. Long-form legalese is a separate document
          available on request.
        </p>

        <h2>What you get</h2>
        <p>
          Coverage for the membership tier you pick — Silver (2 visits/month), Gold (5), or Platinum
          (unlimited under fair use). Every visit is scoped to up to 3 related tasks and 90 labor
          minutes. Out-of-scope work gets a separate quote with your member discount applied.
        </p>

        <h2>Billing</h2>
        <p>
          Billed monthly or annually through Stripe. Recurring charges run on the same day each cycle.
          Cancel anytime from your account — coverage continues through the end of the paid period.
          Refunds for partial months aren&apos;t automatic but ops will review unusual situations.
        </p>

        <h2>Scheduling</h2>
        <p>
          Requests are reviewed by an operator before dispatch. Typical on-site turnaround is 1–3
          business days, depending on tier and technician availability. Emergencies (gas, flooding,
          electrical hazards) are out of scope — call your local utilities.
        </p>

        <h2>Access + safety</h2>
        <p>
          You authorize Fixpass technicians to enter the registered property to complete covered work.
          You&apos;re responsible for keeping the work area reasonably accessible and for letting us
          know about pets, access codes, or anything that would affect a safe visit.
        </p>

        <h2>Warranty</h2>
        <p>
          We stand behind our labor for 30 days. If something we fixed breaks again for the same
          reason, ops will re-dispatch inside the covered-visit envelope at no extra charge.
        </p>

        <h2>Liability</h2>
        <p>
          Fixpass technicians are insured. If a covered visit causes damage, file a claim through ops
          at <a href="mailto:hello@getfixpass.com">hello@getfixpass.com</a> within 7 days.
        </p>

        <h2>Changes</h2>
        <p>
          We may update these terms as Fixpass grows. Material changes get a 30-day notice to the email
          on file before they take effect.
        </p>
      </article>
    </main>
  );
}
