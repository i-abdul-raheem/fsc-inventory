import type { PrismaClient } from "@prisma/client";

import { ensurePermissionRows } from "@/lib/auth/permissionDb";

/** Upsert static permission rows (idempotent). */
export async function syncPermissionRows(db: PrismaClient): Promise<void> {
  await ensurePermissionRows(db);
}
