import { prisma } from "@/lib/prisma";

export async function listItemsLite() {
  return prisma.item.findMany({
    where: { active: true },
    orderBy: [{ kind: "asc" }, { sku: "asc" }],
    select: {
      id: true,
      sku: true,
      name: true,
      kind: true,
    },
  });
}
