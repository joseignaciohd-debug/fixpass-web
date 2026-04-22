import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { billingCycles, plans, planPrice } from "@/lib/config/site-data";
import { currency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default function AdminPlansPage() {
  return (
    <div className="grid gap-6">
      {plans.map((p, i) => (
        <Card key={p.id} delay={0.04 * i}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="eyebrow">Plan</p>
              <h2 className="display-section mt-1 text-3xl text-ink">{p.name}</h2>
              <p className="mt-2 text-sm text-ink-muted">
                {typeof p.includedVisits === "number" ? `${p.includedVisits} included visits` : p.includedVisits} ·{" "}
                {p.maxLaborMinutes}-minute cap
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="emerald">active</Badge>
              {billingCycles.map((c) => (
                <Badge key={c.id} tone="honey">
                  {c.short}: {currency(planPrice(p, c.id))}
                </Badge>
              ))}
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-ink-muted">{p.tagline}</p>
        </Card>
      ))}
    </div>
  );
}
