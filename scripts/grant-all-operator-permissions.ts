/**
 * One-time / maintenance: attach every IMS permission row to users with OPERATOR role.
 * Admins ignore UserPermission rows. Run after upgrading an existing DB: `npm run db:grant-operators-all`.
 */
import { PrismaClient } from "@prisma/client";

import { ALL_PERMISSION_CODES } from "../src/lib/domain/permissions";
import { USER_ROLE } from "../src/lib/domain/roles";
import { replaceUserPermissionGrants } from "../src/lib/auth/permissionDb";
import { syncPermissionRows } from "../src/lib/auth/syncPermissions";

const prisma = new PrismaClient();

async function main() {
  await syncPermissionRows(prisma);
  const operators = await prisma.user.findMany({
    where: { role: USER_ROLE.OPERATOR, active: true },
    select: { id: true },
  });

  for (const u of operators) {
    await replaceUserPermissionGrants(prisma, u.id, ALL_PERMISSION_CODES);
  }

  console.log(`Granted ${ALL_PERMISSION_CODES.length} permissions to ${operators.length} operators.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
