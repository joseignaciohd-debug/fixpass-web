import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { faqs } from "@/lib/config/site-data";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Common questions about Fixpass memberships, coverage, scheduling, and billing.",
};

// JSON-LD FAQPage — Google picks this up for rich-result snippets.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function FaqPage() {
  return (
    <main className="relative">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="mx-auto max-w-3xl px-5 pb-10 pt-16 sm:px-8 lg:px-12 lg:pt-24">
        <Reveal>
          <span className="eyebrow">Frequently asked</span>
          <h1 className="display-hero mt-4 text-5xl text-ink sm:text-6xl">Answers.</h1>
          <p className="mt-6 text-lg leading-8 text-ink-muted">
            Here&apos;s what most households ask before joining. Miss one?{" "}
            <a className="link-underline text-royal" href="/contact">
              Drop us a line
            </a>
            .
          </p>
        </Reveal>
      </section>

      <section className="mx-auto max-w-3xl px-5 pb-16 sm:px-8 lg:px-12">
        <div className="grid gap-3">
          {faqs.map((f) => (
            <details
              key={f.q}
              className="group rounded-2xl border border-border bg-surface px-5 py-4 transition-colors open:bg-canvas-elevated"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-base font-semibold text-ink">
                {f.q}
                <span className="text-2xl text-ink-subtle transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm leading-7 text-ink-muted">{f.a}</p>
            </details>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button href="/join">Start a membership</Button>
          <Button href="/contact" variant="secondary">Contact us</Button>
        </div>
      </section>
    </main>
  );
}
