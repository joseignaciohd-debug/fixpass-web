import { Settings as SettingsIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { defaultRules } from "@/lib/config/site-data";

export const dynamic = "force-dynamic";

export default function AdminSettingsPage() {
  return (
    <Card>
      <div className="flex items-center gap-3">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-royal-soft text-royal-ink">
          <SettingsIcon className="h-4 w-4" />
        </div>
        <div>
          <p className="eyebrow">Operational defaults</p>
          <h1 className="display-section mt-1 text-2xl text-ink">Standing rules</h1>
        </div>
        <Badge tone="emerald" className="ml-auto">Read-only</Badge>
      </div>

      <p className="mt-4 text-sm leading-7 text-ink-muted">
        These guardrails are baked into every Fixpass membership. They shape what technicians can
        accept as covered, what gets quoted separately, and how scheduling negotiates across tiers.
        Editable controls ship once the ops-config schema lands.
      </p>

      <div className="mt-6 grid gap-2">
        {defaultRules.map((rule) => (
          <div
            key={rule}
            className="rounded-2xl border border-border bg-canvas-elevated px-4 py-3 text-sm text-ink"
          >
            {rule}
          </div>
        ))}
      </div>
    </Card>
  );
}
