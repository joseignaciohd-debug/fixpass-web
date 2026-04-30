// TrustBadges — compact row of reassurances. Shows up on the landing
// + /plans + /join so first-time visitors see risk-reducers fast.

import { CreditCard, HeartHandshake, Lock, ShieldCheck, Sparkles, Wrench } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";

const badges = [
  {
    icon: Lock,
    title: "Stripe-secured",
    copy: "Card numbers never touch Fixpass. PCI-compliant billing end-to-end.",
    tone: "royal" as const,
  },
  {
    icon: ShieldCheck,
    title: "Vetted technicians",
    copy: "Background checks, tenure minimum, insured on every visit.",
    tone: "emerald" as const,
  },
  {
    icon: Sparkles,
    title: "Operator-reviewed",
    copy: "Humans triage every request. No bot dispatch, no cold dispatch.",
    tone: "sky" as const,
  },
  {
    icon: HeartHandshake,
    title: "30-day warranty",
    copy: "If covered work breaks within 30 days for the same reason, we come back.",
    tone: "honey" as const,
  },
  {
    icon: Wrench,
    title: "Clear scope",
    copy: "Every visit caps at 90 minutes + 3 related tasks. No surprises.",
    tone: "lapis" as const,
  },
  {
    icon: CreditCard,
    title: "Cancel anytime",
    copy: "Coverage runs to the end of your prepaid term, then stops. No surprise renewal charges.",
    tone: "basil" as const,
  },
];

const tones = {
  royal:   "bg-royal-soft   text-royal-ink",
  emerald: "bg-emerald-soft text-emerald-ink",
  sky:     "bg-sky-soft     text-sky-ink",
  honey:   "bg-honey-soft   text-cream-ink",
  lapis:   "bg-lapis-soft   text-lapis-ink",
  basil:   "bg-basil-soft   text-basil-ink",
} as const;

export function TrustBadges({
  compact = false,
  className = "",
}: {
  compact?: boolean;
  className?: string;
}) {
  const list = compact ? badges.slice(0, 4) : badges;

  return (
    <div
      className={`grid gap-3 sm:grid-cols-2 lg:grid-cols-${compact ? "4" : "3"} ${className}`}
    >
      {list.map((b, i) => (
        // Slightly stronger stagger (0.08s per tile) so the grid "types in"
        // as it scrolls into view — matches the rest of the marketing motion.
        <Reveal key={b.title} delay={0.08 * i}>
          <div className="flex h-full items-start gap-3 rounded-2xl border border-border bg-surface p-4 transition hover:-translate-y-0.5 hover:border-border-strong">
            <span
              className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tones[b.tone]}`}
              aria-hidden
            >
              <b.icon className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">{b.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-ink-muted">{b.copy}</p>
            </div>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
