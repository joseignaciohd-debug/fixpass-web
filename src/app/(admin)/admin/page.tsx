import { AlertTriangle, CalendarDays, Inbox, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { StatusPill } from "@/components/ui/status-pill";
import { getAdminSnapshot } from "@/lib/repositories/admin";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const snap = await getAdminSnapshot();
  const q = snap.queueSummary;

  const queueChips = [
    { label: "New intake", value: q.newIntake, tone: "royal" as const },
    { label: "Needs scheduling", value: q.needsScheduling, tone: "honey" as const },
    { label: "Quote review", value: q.quoteReview, tone: "sky" as const },
    { label: "Fair-use", value: q.fairUseReview, tone: "brick" as const },
    { label: "Unassigned", value: q.unassigned, tone: "emerald" as const },
  ];

  return (
    <div className="space-y-8">
      <section className="grid gap-4 lg:grid-cols-4">
        <MetricCard
          label="Active members"
          value={String(snap.metrics.activeMembers)}
          change={`${snap.metrics.coveredRequests} covered requests`}
          tone="positive"
        />
        <MetricCard
          label="MRR"
          value={`$${snap.metrics.mrr.toFixed(0)}`}
          change={`$${snap.metrics.outstandingRevenue.toFixed(0)} upcoming`}
          tone="positive"
          delay={0.05}
        />
        <MetricCard
          label="Quote opportunities"
          value={String(snap.metrics.quoteOpportunities)}
          change={`${snap.metrics.fairUseCount} fair-use reviews`}
          tone={snap.metrics.quoteOpportunities > 0 ? "alert" : "neutral"}
          delay={0.1}
        />
        <MetricCard
          label="Avg labor"
          value={`${snap.metrics.averageLaborMinutes}m`}
          change="per visit this cycle"
          tone="neutral"
          delay={0.15}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_1fr]">
        <Card delay={0.06}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow">Owner queue</p>
              <h2 className="display-section mt-2 text-2xl text-ink">What needs attention today</h2>
            </div>
            <Badge tone="default" icon={<Inbox className="h-3 w-3" />}>
              {queueChips.reduce((s, c) => s + c.value, 0)} items
            </Badge>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {queueChips.map((c) => (
              <div
                key={c.label}
                className="rounded-2xl border border-border bg-canvas-elevated p-5 transition hover:border-border-strong"
              >
                <Badge tone={c.tone}>{c.label}</Badge>
                <p className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold tabular-nums text-ink">
                  {c.value}
                </p>
                <p className="mt-2 text-sm text-ink-muted">
                  {c.value === 0 ? "No action required." : "Requires owner attention."}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card delay={0.08}>
          <p className="eyebrow">Incoming requests</p>
          <p className="mt-2 text-sm text-ink-muted">Newest service activity.</p>
          {snap.requests.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-border bg-canvas-elevated p-5 text-sm text-ink-muted">
              No requests yet.
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {snap.requests.slice(0, 3).map((r) => (
                <article key={r.id} className="rounded-2xl border border-border bg-surface p-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-semibold text-ink">{r.title}</p>
                    <StatusPill status={r.status} />
                  </div>
                  <p className="mt-2 text-sm text-ink-muted">
                    {r.customerName} · {r.planName}
                  </p>
                </article>
              ))}
            </div>
          )}
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card delay={0.1}>
          <div className="flex items-center gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-honey-soft text-cream-ink">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <p className="eyebrow">Ops attention</p>
              <h2 className="display-section mt-1 text-2xl text-ink">Nothing flagged</h2>
            </div>
          </div>
          <p className="mt-4 text-sm text-ink-muted">
            Fair-use reviews and pending quote approvals will show up here.
          </p>
        </Card>

        <Card delay={0.12}>
          <div className="flex items-center gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sky-soft text-sky-ink">
              <CalendarDays className="h-4 w-4" />
            </div>
            <div>
              <p className="eyebrow">Today&apos;s dispatch</p>
              <h2 className="display-section mt-1 text-2xl text-ink">Scheduled &amp; in progress</h2>
            </div>
          </div>
          <p className="mt-4 text-sm text-ink-muted">
            Once operators assign + schedule, those visits will appear here in time order.
          </p>
        </Card>
      </section>

      <Card delay={0.14}>
        <div className="flex items-center gap-3">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-royal-soft text-royal-ink">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <p className="eyebrow">Member watchlist</p>
            <h2 className="display-section mt-1 text-2xl text-ink">Who needs follow-up</h2>
          </div>
        </div>
        <p className="mt-4 text-sm text-ink-muted">
          Signals from usage + fair-use flags + open request count surface here.
        </p>
      </Card>
    </div>
  );
}
