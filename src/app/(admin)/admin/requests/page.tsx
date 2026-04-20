import { ClipboardList } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import { getAdminSnapshot } from "@/lib/repositories/admin";

export const dynamic = "force-dynamic";

export default async function AdminRequestsPage() {
  const snap = await getAdminSnapshot();

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center gap-3">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-royal-soft text-royal-ink">
            <ClipboardList className="h-4 w-4" />
          </div>
          <div>
            <p className="eyebrow">Service request board</p>
            <h1 className="display-section mt-1 text-2xl text-ink">Live intake, triage, assignment</h1>
          </div>
          <Badge tone="default" className="ml-auto">
            {snap.requests.length} active
          </Badge>
        </div>

        {snap.requests.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-border bg-canvas-elevated p-6 text-sm text-ink-muted">
            No requests yet. Member-submitted requests will populate here with status + assignment.
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-2xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-canvas-elevated text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
                <tr>
                  <th className="px-5 py-3">Request</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Preferred</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {snap.requests.map((r) => (
                  <tr key={r.id} className="bg-surface transition hover:bg-canvas-elevated">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-ink">{r.title}</p>
                      <p className="mt-0.5 text-xs text-ink-muted">
                        {r.area} · {r.category}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-ink-muted">{r.customerName}</td>
                    <td className="px-5 py-4 text-ink-muted">{r.preferredWindow}</td>
                    <td className="px-5 py-4">
                      <StatusPill status={r.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
