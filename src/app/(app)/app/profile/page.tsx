import { CreditCard, FileText, Home, LifeBuoy, LogOut, Mail, Phone, ShieldCheck } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GradientCard } from "@/components/ui/gradient-card";
import { SectionGroup } from "@/components/ui/section-group";
import { requireSession } from "@/lib/auth/session";
import { getCustomerSnapshot } from "@/lib/repositories/customer";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await requireSession("/app/profile");
  const snapshot = await getCustomerSnapshot(session.userId, { name: session.name, email: session.email });

  return (
    <div className="space-y-6">
      <GradientCard tone="royal" className="sm:p-10">
        <div className="flex flex-wrap items-center gap-6">
          <Avatar name={snapshot.user.name} size="lg" />
          <div className="min-w-0 flex-1">
            <Badge tone="inverse">Profile</Badge>
            <h1 className="display-hero mt-3 text-3xl text-white sm:text-4xl">{snapshot.user.name}</h1>
            <p className="mt-2 text-sm text-white/78">{snapshot.user.email}</p>
          </div>
          <Badge tone="inverse">Member</Badge>
        </div>
      </GradientCard>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionGroup
          title="Account"
          rows={[
            { icon: <Mail className="h-4 w-4" />, label: "Email", value: snapshot.user.email },
            { icon: <Phone className="h-4 w-4" />, label: "Phone", value: snapshot.user.phone || "Not set" },
            {
              icon: <CreditCard className="h-4 w-4" />,
              label: "Billing & receipts",
              href: "/app/membership",
            },
            {
              icon: <ShieldCheck className="h-4 w-4" />,
              label: "Membership",
              value: snapshot.subscription?.status ?? "None",
              href: "/app/membership",
            },
          ]}
        />

        <SectionGroup
          title="Property"
          rows={[
            {
              icon: <Home className="h-4 w-4" />,
              label: snapshot.property?.nickname ?? "Registered property",
              value: snapshot.property?.address ?? "Not set",
              href: "/app/property",
            },
            {
              icon: <FileText className="h-4 w-4" />,
              label: "Access notes",
              value: snapshot.property?.accessNotes ? "Edit" : "Add",
              href: "/app/property",
            },
          ]}
        />
      </div>

      <Card>
        <p className="eyebrow">Support &amp; legal</p>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {[
            "Responses within 24 hours",
            "Most covered visits target 1 to 3 business days",
            "Excluded or oversized work may be quoted separately",
          ].map((item) => (
            <div key={item} className="rounded-2xl border border-border bg-canvas-elevated px-5 py-4 text-sm leading-6 text-ink-muted">
              {item}
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button href="/support" iconLeft={<LifeBuoy className="h-4 w-4" />}>
            Open support
          </Button>
          <Button href="/privacy" variant="secondary">
            Privacy
          </Button>
          <Button href="/terms" variant="secondary">
            Terms
          </Button>
          <form action="/api/auth/sign-out" method="post" className="ml-auto">
            <Button type="submit" variant="outline" iconLeft={<LogOut className="h-4 w-4" />}>
              Sign out
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
