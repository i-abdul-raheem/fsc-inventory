import { redirect } from "next/navigation";

import AppShell from "@/components/AppShell";
import { lowStockAlertCount } from "@/lib/alerts/lowStock";
import { getPrincipal, permissionListForClient } from "@/lib/auth/rbac";
import { PERM } from "@/lib/domain/permissions";
import { userIsAdmin } from "@/lib/domain/roles";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const principal = await getPrincipal();
  if (!principal) {
    redirect("/login");
  }
  const { session } = principal;
  const alertCount =
    principal.permissions.has(PERM.moduleAlerts) ? await lowStockAlertCount() : 0;
  const grantedPermissions = permissionListForClient(principal);

  return (
    <AppShell
      grantedPermissions={grantedPermissions}
      alertCount={alertCount}
      isAdmin={userIsAdmin(session.role)}
      showAlertsBell={principal.permissions.has(PERM.moduleAlerts)}
      user={{ email: session.email, name: session.name ?? null, role: session.role }}
    >
      {children}
    </AppShell>
  );
}
