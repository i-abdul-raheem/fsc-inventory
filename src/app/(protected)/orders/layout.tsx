import { requireRoute } from "@/lib/auth/rbac";
import { PERM } from "@/lib/domain/permissions";

export default async function OrdersBranchLayout({ children }: { children: React.ReactNode }) {
  await requireRoute(PERM.moduleOrders);
  return children;
}
