import Link from "next/link";
import { ArrowRight, ClipboardList } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import { getAdminSnapshot } from "@/lib/repositories/admin";

export const dynamic = "force-dynamic";

// Order so the operator's eye lands on what needs attention first:
// pending → under review → scheduled → everything else. Inside each
// bucket the underlying snapshot already orders by created_at desc.
const STATUS_PRIORITY: Record<string, number> = {
  pending: 0,
  "under review": 1,
  scheduled: 2,
  "technician assigned": 2,
  "en route": 3,
  arrived: 3,
  completed: 4,
  cancelled: 5,
  "quoted separately": 5,
};

export default async function AdminRequestsPage() {
  const snap = await getAdminSnapshot();
  const ordered = [...snap.requests].sort((a, b) => {
    const pa = STATUS_PRIORITY[a.status.toLowerCase()] ?? 9;
    const pb = STATUS_PRIORITY[b.status.toLowerCase()] ?? 9;
    return pa - pb;
  });

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
                {ordered.map((r) => (
                  <tr
                    key={r.id}
                    className="cursor-pointer bg-surface transition hover:bg-canvas-elevated"
                  >
                    {/* Each cell wraps a Link so the entire row is one
                        big tappable target without nesting <a> in a
                        <tr> (browsers mishandle that). */}
                    <td className="px-5 py-4">
                      <Link href={`/admin/requests/${r.id}`} className="focus-ring block">
                        <p className="font-semibold text-ink">{r.title}</p>
                        <p className="mt-0.5 text-xs text-ink-muted">
                          {r.area} · {r.category}
                        </p>
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-ink-muted">
                      <Link href={`/admin/requests/${r.id}`} className="focus-ring block">
                        {r.customerName}
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-ink-muted">
                      <Link href={`/admin/requests/${r.id}`} className="focus-ring block">
                        {r.preferredWindow}
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/requests/${r.id}`}
                        className="focus-ring inline-flex items-center gap-2"
                      >
                        <StatusPill status={r.status} />
                        <ArrowRight className="h-3.5 w-3.5 text-ink-subtle" aria-hidden />
                      </Link>
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
