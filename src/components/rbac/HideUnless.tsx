import type { ReactNode } from "react";

import { getPrincipal } from "@/lib/auth/rbac";
import type { PermissionCode } from "@/lib/domain/permissions";

/** Server-only: hide children when the signed-in user lacks the permission. */
export default async function HideUnless(props: {
  permission: PermissionCode;
  children: ReactNode;
}) {
  const p = await getPrincipal();
  if (!p || !p.permissions.has(props.permission)) return null;
  return props.children;
}
