import Link from "next/link";
import { ArrowRight, PlusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import { getCurrentSession } from "@/lib/auth/session";
import { getCustomerSnapshot } from "@/lib/repositories/customer";

export const dynamic = "force-dynamic";

export default async function RequestsListPage() {
  const session = (await getCurrentSession())!;
  const snapshot = await getCustomerSnapshot(session.userId, { name: session.name, email: session.email });

  return (
    <div className="space-y-6">
      <Card animate={false}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Your requests</p>
            <h1 className="display-section mt-2 text-3xl text-ink">Track every repair in one place</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-muted">
              Every request gets operator review within 24 hours. Most covered visits schedule inside
              1–3 business days.
            </p>
          </div>
          <Button href="/app/requests/new" iconLeft={<PlusCircle className="h-4 w-4" />}>
            New request
          </Button>
        </div>
      </Card>

      {snapshot.requests.length === 0 ? (
        <Card className="text-center">
          <h3 className="display-section text-xl text-ink">No requests yet.</h3>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-ink-muted">
            When you submit your first repair, its status + timeline + photos will live here.
          </p>
          <Button href="/app/requests/new" className="mt-6">
            Submit your first request
          </Button>
        </Card>
      ) : (
        <div className="grid gap-3">
          {snapshot.requests.map((r, i) => (
            <Card key={r.id} delay={0.04 * i}>
              <Link href={`/app/requests/${r.id}`} className="focus-ring -m-6 block p-6 sm:-m-8 sm:p-8">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold text-ink">
                      {r.title}
                    </h3>
                    <p className="mt-2 text-sm text-ink-muted">
                      {r.area || "—"} · {r.preferredWindow}
                    </p>
                  </div>
                  <div className="flex flex-col items-start gap-2 md:items-end">
                    <StatusPill status={r.status} />
                    <Badge tone="default">{new Date(r.createdAt).toLocaleDateString()}</Badge>
                  </div>
                </div>
                <p className="mt-4 line-clamp-2 text-sm leading-7 text-ink-muted">{r.description}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-ink">
                  View details <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
