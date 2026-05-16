import type { Item } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ITEM_KIND } from "@/lib/domain/status";

export type LowStockRow = {
  item: Pick<Item, "id" | "sku" | "name"> & { lowStockAlertBelow: number };
  qtyOnHand: number;
};

/** Alert when quantity on hand is strictly LESS than configured threshold */
export function meetsLowStockCriteria(
  qtyOnHand: number,
  threshold: number | null,
): threshold is number {
  if (threshold == null) return false;
  return qtyOnHand < threshold;
}

/** Components with alerting enabled and breached threshold */
export async function getLowStockAlerts(): Promise<LowStockRow[]> {
  const items = await prisma.item.findMany({
    where: {
      kind: ITEM_KIND.COMPONENT,
      active: true,
      lowStockAlertBelow: { not: null },
    },
    include: { stock: true },
    orderBy: { sku: "asc" },
  });

  const rows: LowStockRow[] = [];
  for (const item of items) {
    const t = item.lowStockAlertBelow;
    if (t == null) continue;
    const qtyOnHand = item.stock?.qtyOnHand ?? 0;
    if (qtyOnHand >= t) continue;
    rows.push({
      item: {
        id: item.id,
        sku: item.sku,
        name: item.name,
        lowStockAlertBelow: t,
      },
      qtyOnHand,
    });
  }
  return rows;
}

export async function lowStockAlertCount(): Promise<number> {
  return (await getLowStockAlerts()).length;
}
