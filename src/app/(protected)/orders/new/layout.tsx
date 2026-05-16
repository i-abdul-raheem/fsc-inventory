import { requireRoute } from "@/lib/auth/rbac";
import { PERM } from "@/lib/domain/permissions";

export default async function NewOrderLayout({ children }: { children: React.ReactNode }) {
  await requireRoute(PERM.ordersPoCreate);
  return children;
}
