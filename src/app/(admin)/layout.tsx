import { redirect } from "next/navigation";
import { AdminShell } from "@/components/layout/admin-shell";
import { getCurrentSession, homeForRole } from "@/lib/auth/session";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getCurrentSession();
  if (!session) redirect("/sign-in");
  // Techs + admins share the /admin chrome with route-level gating below.
  if (session.role === "customer") redirect(homeForRole(session.role));

  return (
    <AdminShell
      userName={session.name}
      userEmail={session.email}
      roleLabel={session.role === "admin" ? "Operations" : "Technician"}
    >
      {children}
    </AdminShell>
  );
}
