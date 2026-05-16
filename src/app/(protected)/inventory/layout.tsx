import { requireRoute } from "@/lib/auth/rbac";
import { PERM } from "@/lib/domain/permissions";

export default async function InventoryLayout({ children }: { children: React.ReactNode }) {
  await requireRoute(PERM.moduleInventory);
  return children;
}
