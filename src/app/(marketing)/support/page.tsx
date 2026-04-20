import type { Metadata } from "next";
import { LifeBuoy, Mail, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IconTile } from "@/components/ui/icon-tile";
import { Reveal } from "@/components/ui/reveal";

export const metadata: Metadata = {
  title: "Support",
  description: "Reach the Fixpass team for membership, scheduling, billing, or quote questions.",
};

const channels = [
  {
    title: "Email",
    body: "The fastest path for non-urgent issues. Replies inside 24h on business days.",
    value: "hello@getfixpass.com",
    href: "mailto:hello@getfixpass.com",
    icon: Mail,
    tone: "royal" as const,
  },
  {
    title: "Call",
    body: "Prefer a voice? Leave a message and we'll return it same-business-day.",
    value: "(713) 555-0188",
    href: "tel:+17135550188",
    icon: Phone,
    tone: "emerald" as const,
  },
  {
    title: "Open a request",
    body: "Already a member? Log in and submit from your account — it threads to your property.",
    value: "Go to your account →",
    href: "/app/requests",
    icon: MessageCircle,
    tone: "sky" as const,
  },
];

export default function SupportPage() {
  return (
    <main className="relative">
      <section className="mx-auto max-w-5xl px-5 pb-10 pt-16 sm:px-8 lg:px-12 lg:pt-24">
        <Reveal className="text-center">
          <IconTile
            icon={<LifeBuoy className="h-4 w-4" />}
            label=""
            tone="royal"
            className="mx-auto w-fit border-0 bg-transparent p-0 hover:shadow-none"
          />
          <span className="eyebrow mt-4 block">Support</span>
          <h1 className="display-hero mt-3 text-5xl text-ink sm:text-6xl">We&apos;re here.</h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-ink-muted">
            Pick the channel that fits the question. Every channel reaches the same operator team —
            there&apos;s no phone-tree maze.
          </p>
        </Reveal>
      </section>

      <section className="mx-auto max-w-5xl px-5 pb-16 sm:px-8 lg:px-12">
        <div className="grid gap-6 md:grid-cols-3">
          {channels.map((c, i) => (
            <Card key={c.title} delay={0.05 * i}>
              <IconTile
                icon={<c.icon className="h-4 w-4" />}
                label={c.title}
                tone={c.tone}
                className="border-0 bg-transparent p-0 hover:shadow-none"
              />
              <p className="mt-4 text-sm leading-6 text-ink-muted">{c.body}</p>
              <Button href={c.href} variant="secondary" className="mt-6 w-full">
                {c.value}
              </Button>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 pb-20 text-center sm:px-8 lg:px-12">
        <Reveal>
          <h2 className="display-section text-3xl text-ink sm:text-4xl">Looking for FAQs?</h2>
          <p className="mt-4 text-ink-muted">
            Most common questions live on the FAQ page — might have what you need already.
          </p>
          <div className="mt-6">
            <Button href="/faq">Read FAQs</Button>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
