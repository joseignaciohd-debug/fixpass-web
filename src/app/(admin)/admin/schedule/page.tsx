import { CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import { getAdminSnapshot } from "@/lib/repositories/admin";

export const dynamic = "force-dynamic";

export default async function AdminSchedulePage() {
  const snap = await getAdminSnapshot();
  const scheduled = snap.requests.filter(
    (r) => r.scheduledFor || r.status === "scheduled" || r.status === "technician assigned",
  );

  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sky-soft text-sky-ink">
            <CalendarDays className="h-4 w-4" />
          </div>
          <div>
            <p className="eyebrow">Schedule board</p>
            <h1 className="display-section mt-1 text-2xl text-ink">Upcoming &amp; assigned visits</h1>
          </div>
        </div>
        <Badge tone="default">{scheduled.length} scheduled</Badge>
      </div>

      {scheduled.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-border bg-canvas-elevated p-6 text-sm text-ink-muted">
          Nothing on the board yet. As operators confirm scheduling, they&apos;ll show up here in time
          order.
        </div>
      ) : (
        <div className="mt-6 grid gap-3">
          {scheduled.map((r) => (
            <article key={r.id} className="grid gap-4 rounded-2xl border border-border bg-surface p-5 lg:grid-cols-[1.1fr_0.85fr_0.55fr]">
              <div>
                <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-ink">
                  {r.title}
                </h3>
                <p className="mt-1 text-sm text-ink-muted">{r.customerName}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
                  Scheduled
                </p>
                <p className="mt-1 font-[family-name:var(--font-display)] text-base font-semibold text-ink">
                  {r.scheduledFor ?? r.preferredWindow}
                </p>
              </div>
              <div className="flex items-start lg:justify-end">
                <StatusPill status={r.status} />
              </div>
            </article>
          ))}
        </div>
      )}
    </Card>
  );
}
