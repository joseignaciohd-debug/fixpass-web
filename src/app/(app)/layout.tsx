import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { getCurrentSession, homeForRole } from "@/lib/auth/session";

// /app/* layout — gates on a signed-in customer session. Middleware
// redirects signed-out users to /sign-in; this layer makes sure the
// role is right (admins land in /admin, techs in /admin/schedule).
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getCurrentSession();
  if (!session) redirect("/sign-in");
  if (session.role !== "customer") redirect(homeForRole(session.role));

  return (
    <AppShell userName={session.name} userEmail={session.email}>
      {children}
    </AppShell>
  );
}
