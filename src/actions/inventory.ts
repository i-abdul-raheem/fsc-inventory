"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { guardAction } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma";
import { PERM } from "@/lib/domain/permissions";
import { receiveSupplierStock } from "@/lib/workflows/orderService";

export async function runReceiveInbound(formData: FormData) {
  await guardAction(PERM.inventoryReceive);
  const itemId = String(formData.get("itemId") ?? "").trim();
  const qtyRaw = String(formData.get("qty") ?? "").trim();
  const qty = Number.parseInt(qtyRaw, 10);
  if (!itemId || !Number.isFinite(qty) || qty <= 0) {
    redirect("/inventory?err=badForm");
  }
  try {
    await receiveSupplierStock(prisma, itemId, qty);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    redirect(`/inventory?err=${encodeURIComponent(msg)}`);
  }

  revalidatePath("/inventory");
  revalidatePath("/orders");
  revalidatePath("/procurement");
  revalidatePath("/");
  redirect("/inventory?received=1");
}

export async function runAdjustPhysicalStock(formData: FormData) {
  await guardAction(PERM.inventoryAdjust);
  const itemId = String(formData.get("itemId") ?? "").trim();
  const deltaRaw = String(formData.get("delta") ?? "").trim();
  const delta = Number.parseInt(deltaRaw, 10);
  if (!itemId || !Number.isFinite(delta) || delta === 0) {
    redirect("/inventory?err=badAdjust");
  }

  await prisma.$transaction(async (tx) => {
    const existing = await tx.stockLevel.findUnique({ where: { itemId } });
    const baseline = existing?.qtyOnHand ?? 0;
    const next = baseline + delta;
    if (next < 0) {
      throw new RangeError(`Adjustment would yield negative stock (have ${baseline}, delta ${delta}).`);
    }

    await tx.stockLevel.upsert({
      where: { itemId },
      update: { qtyOnHand: next },
      create: {
        itemId,
        qtyOnHand: Math.max(0, delta),
      },
    });
  }).catch((e) => {
    const msg = e instanceof RangeError ? e.message : String(e);
    redirect(`/inventory?err=${encodeURIComponent(msg)}`);
  });

  revalidatePath("/inventory");
  revalidatePath("/orders");
  revalidatePath("/procurement");
  revalidatePath("/");
  redirect(`/inventory?adjusted=1&ref=${encodeURIComponent(itemId)}`);
}
