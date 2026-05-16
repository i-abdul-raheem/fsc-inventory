"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { guardAction } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma";
import { PERM } from "@/lib/domain/permissions";
import { SALES_ORDER_STATUS } from "@/lib/domain/status";
import {
  advanceToPickReady,
  finalizeFulfillment,
  markShipped,
  submitSalesOrder,
  tryAllocateAfterStockChange,
} from "@/lib/workflows/orderService";

async function invalidateAll() {
  revalidatePath("/");
  revalidatePath("/orders");
  revalidatePath("/procurement");
  revalidatePath("/inventory");
  revalidatePath("/customers");
}

export async function createSalesOrder(formData: FormData) {
  await guardAction(PERM.ordersPoCreate);
  const customerIdRaw = String(formData.get("customerId") ?? "").trim();
  let customerName = String(formData.get("customerName") ?? "").trim();
  let customerId: string | undefined;

  if (customerIdRaw) {
    const linked = await prisma.customer.findFirst({
      where: { id: customerIdRaw, active: true },
      select: { id: true, name: true },
    });
    if (!linked) {
      redirect("/orders/new?err=badCustomer");
    }
    customerName = linked.name;
    customerId = linked.id;
  } else if (!customerName) {
    redirect("/orders/new?err=missingCustomer");
  }

  const customerPoRef = String(formData.get("customerPoRef") ?? "").trim();

  const lineEntries: { itemId: string; quantity: number; unitPrice: number | null }[] = [];
  for (let i = 0; i < 20; i += 1) {
    const itemId = String(formData.get(`itemId_${i}`) ?? "").trim();
    const qtyRaw = String(formData.get(`qty_${i}`) ?? "").trim();
    const priceRaw = String(formData.get(`unitPrice_${i}`) ?? "").trim();
    if (!itemId || !qtyRaw) continue;
    const quantity = Number.parseInt(qtyRaw, 10);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      redirect(`/orders/new?err=badQty&row=${i}`);
    }
    const unitPrice =
      priceRaw === "" ? null : Number.parseInt(priceRaw, 10) * /* SAR halalas */ 1;
    if (priceRaw !== "" && (!Number.isFinite(unitPrice) || unitPrice! < 0)) {
      redirect(`/orders/new?err=badPrice&row=${i}`);
    }
    lineEntries.push({ itemId, quantity, unitPrice: unitPrice ?? null });
  }

  if (lineEntries.length === 0) {
    redirect("/orders/new?err=noLines");
  }

  const order = await prisma.salesOrder.create({
    data: {
      customerId,
      customerName,
      customerPoRef: customerPoRef || undefined,
      status: SALES_ORDER_STATUS.DRAFT,
      lines: {
        create: lineEntries.map((l) => ({
          itemId: l.itemId,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
        })),
      },
    },
    select: { id: true },
  });

  await invalidateAll();
  redirect(`/orders/${order.id}`);
}

export async function runSubmitOrder(orderId: string) {
  await guardAction(PERM.ordersWorkflowSubmit);
  try {
    await submitSalesOrder(prisma, orderId);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    redirect(`/orders/${orderId}?err=${encodeURIComponent(msg)}`);
  }
  await invalidateAll();
  redirect(`/orders/${orderId}`);
}

export async function runRecheckAllocations(orderId: string) {
  await guardAction(PERM.ordersWorkflowRetry);
  await tryAllocateAfterStockChange(prisma, orderId);
  await invalidateAll();
  redirect(`/orders/${orderId}`);
}

export async function runIssuePickSlip(orderId: string) {
  await guardAction(PERM.ordersWorkflowPick);
  try {
    await advanceToPickReady(prisma, orderId);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    redirect(`/orders/${orderId}?err=${encodeURIComponent(msg)}`);
  }
  await invalidateAll();
  redirect(`/orders/${orderId}`);
}

export async function runFinalizeFulfillment(orderId: string) {
  await guardAction(PERM.ordersWorkflowFulfill);
  try {
    await finalizeFulfillment(prisma, orderId);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    redirect(`/orders/${orderId}?err=${encodeURIComponent(msg)}`);
  }
  await invalidateAll();
  redirect(`/orders/${orderId}`);
}

export async function runMarkShipped(formData: FormData) {
  await guardAction(PERM.ordersWorkflowShip);
  const orderId = String(formData.get("orderId") ?? "").trim();
  const note = String(formData.get("carrierNote") ?? "").trim();
  if (!orderId) redirect("/orders");
  try {
    await markShipped(prisma, orderId, note || undefined);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    redirect(`/orders/${orderId}?err=${encodeURIComponent(msg)}`);
  }
  await invalidateAll();
  redirect(`/orders/${orderId}`);
}

export async function runCancelSalesOrder(orderId: string) {
  await guardAction(PERM.ordersWorkflowCancel);
  const order = await prisma.salesOrder.findUnique({ where: { id: orderId } });
  if (!order) redirect("/orders");

  const terminal = [
    SALES_ORDER_STATUS.SHIPPED,
    SALES_ORDER_STATUS.CANCELLED,
    SALES_ORDER_STATUS.FULFILLED,
  ] as string[];
  if (terminal.includes(order.status)) {
    redirect(`/orders/${orderId}?err=${encodeURIComponent("Cannot cancel terminal order")}`);
  }

  await prisma.$transaction([
    prisma.reservation.deleteMany({ where: { salesOrderId: orderId } }),
    prisma.procurementNeed.deleteMany({ where: { salesOrderId: orderId } }),
    prisma.salePosting.deleteMany({ where: { salesOrderId: orderId } }),
    prisma.salesOrder.update({
      where: { id: orderId },
      data: { status: SALES_ORDER_STATUS.CANCELLED },
    }),
  ]);

  await invalidateAll();
  redirect(`/orders/${orderId}`);
}
