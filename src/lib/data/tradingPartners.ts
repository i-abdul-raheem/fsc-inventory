import { prisma } from "@/lib/prisma";

export async function listCustomersForSelect() {
  return prisma.customer.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, tradingName: true, city: true },
  });
}
