import type { PrismaClient } from "@prisma/client";

import { ALL_PERMISSION_CODES } from "@/lib/domain/permissions";

/** Idempotent: upsert static permission rows by `code`. */
export async function ensurePermissionRows(prisma: PrismaClient): Promise<void> {
  for (const code of ALL_PERMISSION_CODES) {
    await prisma.permission.upsert({
      where: { code },
      create: { code },
      update: {},
    });
  }
}

export async function fetchUserPermissionCodes(prisma: PrismaClient, userId: string): Promise<string[]> {
  const rows = await prisma.userPermission.findMany({
    where: { userId },
    select: { permission: { select: { code: true } } },
  });
  return rows.map((r) => r.permission.code);
}

/** Replace all grants for one user (delete then insert). */
export async function replaceUserPermissionGrants(
  prisma: PrismaClient,
  userId: string,
  grantedCodes: readonly string[],
): Promise<void> {
  await prisma.userPermission.deleteMany({ where: { userId } });
  if (grantedCodes.length === 0) return;

  const perms = await prisma.permission.findMany({
    where: { code: { in: [...grantedCodes] } },
    select: { id: true },
  });

  await prisma.userPermission.createMany({
    data: perms.map((p) => ({ userId, permissionId: p.id })),
  });
}
