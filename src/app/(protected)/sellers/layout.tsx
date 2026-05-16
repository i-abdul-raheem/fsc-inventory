import { requireRoute } from "@/lib/auth/rbac";
import { PERM } from "@/lib/domain/permissions";

export default async function SellersLayout({ children }: { children: React.ReactNode }) {
  await requireRoute(PERM.moduleSellers);
  return children;
}
