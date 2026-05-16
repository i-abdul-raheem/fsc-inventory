import { requireRoute } from "@/lib/auth/rbac";
import { PERM } from "@/lib/domain/permissions";

export default async function ProcurementLayout({ children }: { children: React.ReactNode }) {
  await requireRoute(PERM.moduleProcurement);
  return children;
}
