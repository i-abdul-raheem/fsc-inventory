"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { guardAction } from "@/lib/auth/rbac";
import { PERM } from "@/lib/domain/permissions";
import { SALES_ORDER_STATUS } from "@/lib/domain/status";
import { prisma } from "@/lib/prisma";
import { receiveSupplierStock, tryAllocateAfterStockChange } from "@/lib/workflows/orderService";

async function invalidateRelated() {
  revalidatePath("/procurement");
  revalidatePath("/orders");
  revalidatePath("/inventory");
  revalidatePath("/");
}

export async function runRecheckAllocationsFromProcurement(orderId: string) {
  await guardAction(PERM.ordersWorkflowRetry);
  await tryAllocateAfterStockChange(prisma, orderId);
  await invalidateRelated();
  redirect("/procurement?rechecked=1");
}

export async function runReceiveSkuFromProcurement(formData: FormData) {
  await guardAction(PERM.inventoryReceive);
  const itemId = String(formData.get("itemId") ?? "").trim();
  const qtyRaw = String(formData.get("qty") ?? "").trim();
  const qty = Number.parseInt(qtyRaw, 10);
  if (!itemId || !Number.isFinite(qty) || qty <= 0) {
    redirect(`/procurement?err=${encodeURIComponent("Choose a SKU and enter a positive quantity.")}`);
  }
  try {
    await receiveSupplierStock(prisma, itemId, qty);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    redirect(`/procurement?err=${encodeURIComponent(msg)}`);
  }
  await invalidateRelated();
  redirect("/procurement?received=1");
}

export async function runSaveProcurementSupplierRef(formData: FormData) {
  await guardAction(PERM.moduleProcurement);
  const needId = String(formData.get("needId") ?? "").trim();
  const supplierReference = String(formData.get("supplierReference") ?? "").trim();
  if (!needId) {
    redirect(`/procurement?err=${encodeURIComponent("Missing procurement line.")}`);
  }

  const need = await prisma.procurementNeed.findUnique({
    where: { id: needId },
    include: { salesOrder: { select: { status: true } } },
  });
  if (!need) {
    redirect(`/procurement?err=${encodeURIComponent("Line not found.")}`);
  }
  if (need.salesOrder.status !== SALES_ORDER_STATUS.AWAITING_PROCUREMENT) {
    redirect(`/procurement?err=${encodeURIComponent("That order is no longer awaiting procurement.")}`);
  }

  await prisma.procurementNeed.update({
    where: { id: needId },
    data: { supplierReference: supplierReference || null },
  });
  await invalidateRelated();
  redirect("/procurement?supplierSaved=1");
}
