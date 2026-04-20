import { Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  return (
    <Card>
      <div className="flex items-center gap-3">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-soft text-emerald-ink">
          <Users className="h-4 w-4" />
        </div>
        <div>
          <p className="eyebrow">Customer operations</p>
          <h1 className="display-section mt-1 text-2xl text-ink">
            Membership health, open demand, high-touch households
          </h1>
        </div>
        <Badge tone="default" className="ml-auto">0 records</Badge>
      </div>
      <p className="mt-6 text-sm text-ink-muted">
        Once members + properties exist, this board shows plan + revenue + open requests + attention
        flags per household, with avatars and mobile-friendly fallback cards.
      </p>
    </Card>
  );
}
