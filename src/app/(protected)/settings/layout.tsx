import { requireRoute } from "@/lib/auth/rbac";
import { PERM } from "@/lib/domain/permissions";

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  await requireRoute(PERM.moduleAccount);
  return children;
}
