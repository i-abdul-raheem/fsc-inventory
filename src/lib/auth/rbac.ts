import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth/session";
import { fetchUserPermissionCodes } from "@/lib/auth/permissionDb";
import { ALL_PERMISSION_CODES, type PermissionCode } from "@/lib/domain/permissions";
import { userIsAdmin } from "@/lib/domain/roles";
import { prisma } from "@/lib/prisma";

export const ACCESS_DENIED_PATH = "/access-denied";

export type AuthPrincipal = {
  session: NonNullable<Awaited<ReturnType<typeof getSession>>>;
  /** Includes every Permission.code for admins; persisted grants for operators */
  permissions: ReadonlySet<string>;
};

/** Request-scoped lookup: session + effective permission codes */
export const getPrincipal = cache(async (): Promise<AuthPrincipal | null> => {
  const session = await getSession();
  if (!session) return null;

  if (userIsAdmin(session.role)) {
    return { session, permissions: new Set<string>(ALL_PERMISSION_CODES) };
  }

  const codes = await fetchUserPermissionCodes(prisma, session.id);
  return {
    session,
    permissions: new Set(codes),
  };
});

/** Serialize principal permissions for client nav (stable order) */
export function permissionListForClient(p: AuthPrincipal): PermissionCode[] {
  return ALL_PERMISSION_CODES.filter((c) => p.permissions.has(c));
}

export async function requireRoute(permission: PermissionCode): Promise<AuthPrincipal> {
  const p = await getPrincipal();
  if (!p) redirect("/login");
  if (!p.permissions.has(permission)) redirect(ACCESS_DENIED_PATH);
  return p;
}

/** Server actions: block without revealing which resource failed */
export async function guardAction(permission: PermissionCode): Promise<AuthPrincipal> {
  const p = await getPrincipal();
  if (!p) redirect("/login");
  if (!p.permissions.has(permission)) redirect(ACCESS_DENIED_PATH);
  return p;
}
