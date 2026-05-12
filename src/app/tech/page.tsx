import { Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

// Placeholder tech portal. Until the technician-facing tools ship,
// signed-in technicians land here from homeForRole("technician") so
// they DON'T end up in an infinite /admin/* redirect loop (the admin
// layout requires role=admin and would bounce them back to the tech
// home — which previously pointed at /admin/schedule).
export default async function TechHome() {
  const session = await requireSession("/tech");
  const firstName = session.name.split(/\s+/)[0] || session.name;

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <Card className="text-center">
        <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-royal-soft text-royal-ink">
          <Wrench className="h-5 w-5" aria-hidden />
        </div>
        <Badge tone="default" className="mt-4">
          Technician
        </Badge>
        <h1 className="display-section mt-3 text-3xl text-ink">
          Hey {firstName} — tech portal is coming.
        </h1>
        <p className="mt-4 text-sm leading-7 text-ink-muted">
          Your account is set up as a technician. The route + schedule view is being built
          right now. In the meantime, operations will reach out directly with your jobs.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button href="/" variant="secondary">
            Return home
          </Button>
          <form action="/api/auth/sign-out" method="post">
            <Button type="submit" variant="ghost">
              Sign out
            </Button>
          </form>
        </div>
      </Card>
    </main>
  );
}
