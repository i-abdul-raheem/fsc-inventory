import { requireRoute } from "@/lib/auth/rbac";
import { PERM } from "@/lib/domain/permissions";

export default async function CatalogLayout({ children }: { children: React.ReactNode }) {
  await requireRoute(PERM.moduleCatalog);
  return children;
}
