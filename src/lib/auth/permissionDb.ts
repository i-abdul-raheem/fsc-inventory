import { Prisma } from "@prisma/client";
import type { PrismaClient } from "@prisma/client";

import { ALL_PERMISSION_CODES } from "@/lib/domain/permissions";

/** Idempotent: insert missing rows in `Permission` (raw SQL — works even if Prisma delegates are stale). */
export async function ensurePermissionRows(prisma: PrismaClient): Promise<void> {
  for (const code of ALL_PERMISSION_CODES) {
    await prisma.$executeRaw(
      Prisma.sql`
        INSERT INTO "Permission" ("id", "code")
        SELECT lower(hex(randomblob(16))), ${code}
        WHERE NOT EXISTS (SELECT 1 FROM "Permission" WHERE "code" = ${code})
      `,
    );
  }
}

export async function fetchUserPermissionCodes(prisma: PrismaClient, userId: string): Promise<string[]> {
  const rows = await prisma.$queryRaw<{ code: string }[]>(
    Prisma.sql`
      SELECT p."code" AS code
      FROM "UserPermission" up
      INNER JOIN "Permission" p ON p."id" = up."permissionId"
      WHERE up."userId" = ${userId}
    `,
  );
  return rows.map((r) => r.code);
}

/** Replace all grants for one user (delete then insert). */
export async function replaceUserPermissionGrants(
  prisma: PrismaClient,
  userId: string,
  grantedCodes: readonly string[],
): Promise<void> {
  await prisma.$executeRaw(Prisma.sql`DELETE FROM "UserPermission" WHERE "userId" = ${userId}`);
  if (grantedCodes.length === 0) return;

  const rows = await prisma.$queryRaw<{ id: string }[]>(
    Prisma.sql`
      SELECT "id" FROM "Permission" WHERE "code" IN (${Prisma.join(grantedCodes)})
    `,
  );

  for (const { id: permissionId } of rows) {
    await prisma.$executeRaw(
      Prisma.sql`
        INSERT INTO "UserPermission" ("userId", "permissionId", "assignedAt")
        VALUES (${userId}, ${permissionId}, datetime('now'))
      `,
    );
  }
}
