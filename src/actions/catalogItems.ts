"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { guardAction } from "@/lib/auth/rbac";
import { ITEM_KIND } from "@/lib/domain/status";
import { PERM } from "@/lib/domain/permissions";
import { prisma } from "@/lib/prisma";

function parseOptionalInt(raw: string | undefined): number | null {
  const t = String(raw ?? "").trim();
  if (t === "" || t === "none") return null;
  const n = Number.parseInt(t, 10);
  return Number.isFinite(n) ? n : null;
}

function skuNorm(raw: unknown): string {
  return String(raw ?? "").trim();
}

/** Parse up to twenty BOM rows; merge duplicate component IDs by summing qty. */
function parseBomRows(formData: FormData): { componentItemId: string; qtyPerKit: number }[] | null {
  const map = new Map<string, number>();
  for (let i = 0; i < 20; i += 1) {
    const componentItemId = String(formData.get(`componentItemId_${i}`) ?? "").trim();
    const qtyRaw = String(formData.get(`qtyPerKit_${i}`) ?? "").trim();
    if (!componentItemId) continue;
    const qty = Number.parseInt(qtyRaw, 10);
    if (!Number.isFinite(qty) || qty < 1) {
      return null;
    }
    map.set(componentItemId, (map.get(componentItemId) ?? 0) + qty);
  }
  if (map.size === 0) return [];
  const lines = [...map.entries()].map(([componentItemId, qtyPerKit]) => ({
    componentItemId,
    qtyPerKit,
  }));
  return lines;
}

async function invalidateCatalog() {
  revalidatePath("/catalog");
  revalidatePath("/inventory");
  revalidatePath("/procurement");
  revalidatePath("/orders");
  revalidatePath("/orders/new");
  revalidatePath("/");
  revalidatePath("/reports");
  revalidatePath("/reports/inventory-valuation");
  revalidatePath("/reports/balance-sheet");
  revalidatePath("/alerts");
}

export async function createCatalogComponent(formData: FormData) {
  await guardAction(PERM.catalogComponentCreate);

  const sku = skuNorm(formData.get("sku"));
  const name = String(formData.get("name") ?? "").trim();
  const descriptionRaw = String(formData.get("description") ?? "").trim();
  const description = descriptionRaw === "" ? null : descriptionRaw;

  const qtyRaw = String(formData.get("initialQtyOnHand") ?? "0").trim();
  const initialQty = qtyRaw === "" ? 0 : Number.parseInt(qtyRaw, 10);
  if (!Number.isFinite(initialQty) || initialQty < 0) {
    redirect("/catalog?err=qty");
  }

  const below = parseOptionalInt(String(formData.get("lowStockAlertBelow") ?? ""));
  if (below !== null && below < 1) {
    redirect("/catalog?err=thresh");
  }

  const cost = parseOptionalInt(String(formData.get("standardCostCents") ?? ""));
  if (cost !== null && cost < 0) {
    redirect("/catalog?err=cost");
  }

  if (!sku || !name) {
    redirect("/catalog?err=required");
  }

  try {
    await prisma.item.create({
      data: {
        sku,
        name,
        description,
        kind: ITEM_KIND.COMPONENT,
        lowStockAlertBelow: below,
        standardCostCents: cost,
        stock: { create: { qtyOnHand: initialQty } },
      },
    });
  } catch {
    redirect("/catalog?err=duplicateSku");
  }

  await invalidateCatalog();
  redirect("/catalog?created=component");
}

export async function createCatalogKit(formData: FormData) {
  await guardAction(PERM.catalogKitCreate);

  const sku = skuNorm(formData.get("sku"));
  const name = String(formData.get("name") ?? "").trim();
  const descriptionRaw = String(formData.get("description") ?? "").trim();
  const description = descriptionRaw === "" ? null : descriptionRaw;

  if (!sku || !name) {
    redirect("/catalog?err=required");
  }

  const parsed = parseBomRows(formData);
  if (parsed === null) {
    redirect("/catalog?err=bomQty");
  }
  if (parsed.length === 0) {
    redirect("/catalog?err=bomEmpty");
  }

  const componentIds = [...new Set(parsed.map((l) => l.componentItemId))];
  const comps = await prisma.item.findMany({
    where: { id: { in: componentIds } },
    select: { id: true, kind: true, sku: true },
  });
  if (comps.length !== componentIds.length) {
    redirect("/catalog?err=bomMissing");
  }
  for (const c of comps) {
    if (c.kind !== ITEM_KIND.COMPONENT) {
      redirect("/catalog?err=bomKit");
    }
  }

  try {
    await prisma.item.create({
      data: {
        sku,
        name,
        description,
        kind: ITEM_KIND.KIT,
        bomAsKit: {
          create: parsed.map((l) => ({
            componentItemId: l.componentItemId,
            qtyPerKit: l.qtyPerKit,
          })),
        },
      },
    });
  } catch {
    redirect("/catalog?err=duplicateSku");
  }

  await invalidateCatalog();
  redirect("/catalog?created=kit");
}

export async function updateCatalogItemCore(formData: FormData) {
  await guardAction(PERM.catalogItemEditCore);

  const itemId = String(formData.get("itemId") ?? "").trim();
  if (!itemId) redirect("/catalog?err=item");

  const name = String(formData.get("name") ?? "").trim();
  const descriptionRaw = String(formData.get("description") ?? "").trim();
  const description = descriptionRaw === "" ? null : descriptionRaw;
  const active = String(formData.get("active") ?? "") === "1";
  const newSku = skuNorm(formData.get("sku"));

  if (!name || !newSku) {
    redirect("/catalog?err=required");
  }

  const existing = await prisma.item.findUnique({ where: { id: itemId } });
  if (!existing) redirect("/catalog?err=missing");

  if (newSku !== existing.sku) {
    const lines = await prisma.salesOrderLine.count({ where: { itemId } });
    if (lines > 0) {
      redirect("/catalog?err=skuLocked");
    }
  }

  try {
    await prisma.item.update({
      where: { id: itemId },
      data: { sku: newSku, name, description, active },
    });
  } catch {
    redirect("/catalog?err=duplicateSku");
  }

  await invalidateCatalog();
  redirect("/catalog?saved=details");
}

export async function setComponentOnHandFromCatalog(formData: FormData) {
  await guardAction(PERM.catalogItemStockQty);

  const itemId = String(formData.get("itemId") ?? "").trim();
  if (!itemId) redirect("/catalog?err=item");

  const item = await prisma.item.findUnique({ where: { id: itemId } });
  if (!item || item.kind !== ITEM_KIND.COMPONENT) redirect("/catalog?err=notComponent");

  const qtyRaw = String(formData.get("qtyOnHand") ?? "").trim();
  const qty = Number.parseInt(qtyRaw, 10);
  if (!Number.isFinite(qty) || qty < 0) {
    redirect("/catalog?err=qty");
  }

  await prisma.stockLevel.upsert({
    where: { itemId },
    create: { itemId, qtyOnHand: qty },
    update: { qtyOnHand: qty },
  });

  await invalidateCatalog();
  redirect("/catalog?saved=stock");
}

export async function updateKitBillOfMaterials(formData: FormData) {
  await guardAction(PERM.catalogItemKitBom);

  const kitItemId = String(formData.get("kitItemId") ?? "").trim();
  if (!kitItemId) redirect("/catalog?err=item");

  const kit = await prisma.item.findUnique({
    where: { id: kitItemId },
    include: { bomAsKit: true },
  });
  if (!kit || kit.kind !== ITEM_KIND.KIT) redirect("/catalog?err=notKit");

  const parsed = parseBomRows(formData);
  if (parsed === null) {
    redirect("/catalog?err=bomQty");
  }
  if (parsed.length === 0) {
    redirect("/catalog?err=bomEmpty");
  }

  const componentIds = [...new Set(parsed.map((l) => l.componentItemId))];
  const comps = await prisma.item.findMany({
    where: { id: { in: componentIds } },
    select: { id: true, kind: true },
  });
  if (comps.length !== componentIds.length) {
    redirect("/catalog?err=bomMissing");
  }
  for (const c of comps) {
    if (c.kind !== ITEM_KIND.COMPONENT) {
      redirect("/catalog?err=bomKit");
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.billOfMaterialLine.deleteMany({ where: { kitItemId } });
    await tx.billOfMaterialLine.createMany({
      data: parsed.map((l) => ({
        kitItemId,
        componentItemId: l.componentItemId,
        qtyPerKit: l.qtyPerKit,
      })),
    });
  });

  await invalidateCatalog();
  redirect("/catalog?saved=bom");
}
