import { Card } from "@/components/ui/card";
import { PropertyForm } from "@/components/forms/property-form";
import { getCurrentSession } from "@/lib/auth/session";
import { getCustomerSnapshot } from "@/lib/repositories/customer";

export const dynamic = "force-dynamic";

export default async function PropertyPage() {
  const session = (await getCurrentSession())!;
  const snapshot = await getCustomerSnapshot(session.userId, { name: session.name, email: session.email });

  return (
    <div className="space-y-6">
      <Card animate={false}>
        <p className="eyebrow">Registered property</p>
        <h1 className="display-section mt-2 text-3xl text-ink">Your home on file</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-ink-muted">
          One property per membership. Keep the address + access notes up to date so technicians arrive
          ready.
        </p>
      </Card>

      <Card>
        <PropertyForm initial={snapshot.property} />
      </Card>
    </div>
  );
}
