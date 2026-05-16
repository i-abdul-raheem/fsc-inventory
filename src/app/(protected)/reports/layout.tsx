import { requireRoute } from "@/lib/auth/rbac";
import { PERM } from "@/lib/domain/permissions";

export default async function ReportsLayout({ children }: { children: React.ReactNode }) {
  await requireRoute(PERM.moduleReports);
  return children;
}
