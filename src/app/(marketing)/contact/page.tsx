import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/ui/reveal";
import { ContactForm } from "@/components/forms/contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Talk to Fixpass — operator-led home maintenance for Katy, TX. Questions, quotes, partnerships.",
};

export default function ContactPage() {
  return (
    <main className="relative">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-14 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:px-12 lg:py-20">
        <Reveal>
          <span className="eyebrow">Contact</span>
          <h1 className="display-hero mt-4 text-5xl text-ink sm:text-6xl">Let&apos;s talk.</h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-ink-muted">
            Questions about the membership, coverage, a specific repair, or a partnership? Drop a note
            and an operator will get back inside 24 hours.
          </p>

          <div className="mt-10 grid gap-3">
            <ContactRow
              icon={<Mail className="h-4 w-4" />}
              label="Email"
              value="hello@getfixpass.com"
              href="mailto:hello@getfixpass.com"
            />
            <ContactRow
              icon={<Phone className="h-4 w-4" />}
              label="Phone"
              value="(713) 555-0188"
              href="tel:+17135550188"
            />
            <ContactRow
              icon={<MapPin className="h-4 w-4" />}
              label="Service area"
              value="Katy, Texas and nearby zip codes"
            />
          </div>
        </Reveal>

        <ContactForm />
      </div>
    </main>
  );
}

function ContactRow({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
}) {
  const Inner = (
    <Card variant="flat" animate={false} className="flex items-center gap-4 p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-royal-soft text-royal-ink">
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted">{label}</p>
        <p className="mt-1 font-semibold text-ink">{value}</p>
      </div>
    </Card>
  );
  return href ? (
    <a href={href} className="focus-ring block rounded-[var(--radius-lg)]">
      {Inner}
    </a>
  ) : (
    Inner
  );
}
