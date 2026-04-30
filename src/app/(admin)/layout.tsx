import { AdminShell } from "@/components/layout/admin-shell";
import { requireRole } from "@/lib/auth/session";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Every /admin/* route is admin-only. Customers get bounced to /app,
  // techs to their tech home (or /sign-in if no session). Per-page
  // requireRole calls are now defense-in-depth — no longer necessary
  // for correctness.
  //
  // When a tech-specific portal exists, build it under a separate route
  // group (e.g. (tech)/tech/...) rather than widening this layout.
  const session = await requireRole("admin", "/admin");

  return (
    <AdminShell userName={session.name} userEmail={session.email} roleLabel="Operations">
      {children}
    </AdminShell>
  );
}
