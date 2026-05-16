import { requireRoute } from "@/lib/auth/rbac";
import { PERM } from "@/lib/domain/permissions";

export default async function CustomersLayout({ children }: { children: React.ReactNode }) {
  await requireRoute(PERM.moduleCustomers);
  return children;
}
