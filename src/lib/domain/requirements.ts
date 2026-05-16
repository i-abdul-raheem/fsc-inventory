import type { BillOfMaterialLine, Item } from "@prisma/client";

export type ItemWithBom = Item & {
  bomAsKit: (BillOfMaterialLine & { component: Item })[];
};

/** Explode ordered lines into leaf component quantities. */
export function explodeToComponents(args: {
  item: ItemWithBom;
  quantity: number;
}): Map<string, { itemId: string; qty: number }> {
  const { item, quantity } = args;
  const out = new Map<string, { itemId: string; qty: number }>();

  if (item.kind === "COMPONENT") {
    const cur = out.get(item.id)?.qty ?? 0;
    out.set(item.id, { itemId: item.id, qty: cur + quantity });
    return out;
  }

  for (const line of item.bomAsKit) {
    const need = line.qtyPerKit * quantity;
    const comp = line.componentItemId;
    const existing = out.get(comp)?.qty ?? 0;
    out.set(comp, { itemId: comp, qty: existing + need });
  }
  return out;
}

/** Merge exploded lines for a whole order into one requirement map per component SKU. */
export function mergeRequirements(
  parts: Iterable<Map<string, { itemId: string; qty: number }>>,
): Map<string, number> {
  const merged = new Map<string, number>();
  for (const m of parts) {
    for (const [, row] of m) {
      merged.set(row.itemId, (merged.get(row.itemId) ?? 0) + row.qty);
    }
  }
  return merged;
}

export function assertKitHasBom(item: ItemWithBom): void {
  if (item.kind !== "KIT") return;
  if (item.bomAsKit.length === 0) {
    throw new Error(`Kit ${item.sku} has no bill of materials.`);
  }
  for (const line of item.bomAsKit) {
    if (line.component.kind === "KIT") {
      throw new Error(
        `Nested kits are not supported in this MVP (found kit ${item.sku} → ${line.component.sku}).`,
      );
    }
  }
}
