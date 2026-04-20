import { Activity, AlertTriangle, DollarSign, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { getAdminSnapshot } from "@/lib/repositories/admin";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const { metrics, source } = await getAdminSnapshot();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-4">
        <MetricCard
          label="Active members"
          value={String(metrics.activeMembers)}
          change={`${metrics.coveredRequests} covered requests`}
          tone="positive"
        />
        <MetricCard
          label="MRR"
          value={`$${metrics.mrr.toFixed(0)}`}
          change={`$${metrics.outstandingRevenue.toFixed(0)} upcoming`}
          tone="positive"
          delay={0.05}
        />
        <MetricCard
          label="Avg labor"
          value={`${metrics.averageLaborMinutes}m`}
          change="per visit this cycle"
          tone="neutral"
          delay={0.1}
        />
        <MetricCard
          label="Fair-use reviews"
          value={String(metrics.fairUseCount)}
          change={`${metrics.quoteOpportunities} quote opps`}
          tone={metrics.fairUseCount > 0 ? "alert" : "neutral"}
          delay={0.15}
        />
      </div>

      <Card>
        <div className="flex items-center gap-3">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sky-soft text-sky-ink">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <p className="eyebrow">Analytics layer</p>
            <h2 className="display-section mt-1 text-2xl text-ink">Source &amp; key stats</h2>
          </div>
        </div>

        <div className="mt-6 grid gap-3">
          <Row
            icon={<Users className="h-4 w-4" />}
            label="Source"
            value={source === "live" ? "Live Supabase" : "Empty — no DB yet"}
          />
          <Row
            icon={<DollarSign className="h-4 w-4" />}
            label="MRR"
            value={`$${metrics.mrr.toFixed(2)}`}
          />
          <Row
            icon={<AlertTriangle className="h-4 w-4" />}
            label="Open fair-use"
            value={String(metrics.fairUseCount)}
          />
        </div>
      </Card>
    </div>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-border bg-canvas-elevated px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-surface text-ink">
          {icon}
        </span>
        <span className="text-sm font-medium text-ink">{label}</span>
      </div>
      <Badge tone="default">{value}</Badge>
    </div>
  );
}
