import type { PrismaClient } from "@prisma/client";
import { PROCUREMENT_NEED_STATUS, SALES_ORDER_STATUS } from "@/lib/domain/status";
import {
  assertKitHasBom,
  explodeToComponents,
  mergeRequirements,
  type ItemWithBom,
} from "@/lib/domain/requirements";

const pickSlipAlphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

export function generatePickSlipRef(): string {
  let code = "";
  for (let i = 0; i < 8; i += 1) {
    code += pickSlipAlphabet[Math.floor(Math.random() * pickSlipAlphabet.length)];
  }
  return `PK-${code}`;
}

/** Available physical stock excluding reservations on other orders. */
export async function getAvailableQty(
  prisma: PrismaClient,
  itemId: string,
  opts?: { excludeOrderId?: string },
): Promise<number> {
  const stock = await prisma.stockLevel.findUnique({ where: { itemId } });
  const onHand = stock?.qtyOnHand ?? 0;
  const reservations = await prisma.reservation.groupBy({
    by: ["itemId"],
    _sum: { qty: true },
    where: {
      itemId,
      salesOrder: {
        status: {
          notIn: [
            SALES_ORDER_STATUS.FULFILLED,
            SALES_ORDER_STATUS.SHIPPED,
            SALES_ORDER_STATUS.CANCELLED,
          ],
        },
      },
      ...(opts?.excludeOrderId
        ? {
            salesOrderId: {
              not: opts.excludeOrderId,
            },
          }
        : {}),
    },
  });
  const held = reservations[0]?._sum.qty ?? 0;
  return onHand - held;
}

async function explodeOrderRequirements(
  tx: Pick<PrismaClient, "salesOrderLine" | "item">,
  salesOrderId: string,
): Promise<Map<string, number>> {
  const lines = await tx.salesOrderLine.findMany({
    where: { salesOrderId },
    include: { item: { include: { bomAsKit: { include: { component: true } } } } },
  });
  const maps: Map<string, { itemId: string; qty: number }>[] = [];
  for (const line of lines) {
    assertKitHasBom(line.item as ItemWithBom);
    maps.push(
      explodeToComponents({
        item: line.item as ItemWithBom,
        quantity: line.quantity,
      }),
    );
  }
  return mergeRequirements(maps);
}

export async function getExplodedRequirementsForOrder(prisma: PrismaClient, salesOrderId: string) {
  return explodeOrderRequirements(prisma, salesOrderId);
}

export async function submitSalesOrder(prisma: PrismaClient, salesOrderId: string) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.salesOrder.findUnique({ where: { id: salesOrderId } });
    if (!order) throw new Error("Order not found");
    if (order.status !== SALES_ORDER_STATUS.DRAFT) {
      throw new Error("Only draft orders can be submitted");
    }
    await tx.procurementNeed.deleteMany({ where: { salesOrderId } });
    await tx.reservation.deleteMany({ where: { salesOrderId } });

    const required = await explodeOrderRequirements(tx, salesOrderId);
    const gaps: { itemId: string; required: number; available: number; short: number }[] = [];

    for (const [itemId, qty] of required.entries()) {
      const available = await getAvailableQty(tx as PrismaClient, itemId);
      const short = Math.max(0, qty - available);
      if (short > 0) {
        gaps.push({ itemId, required: qty, available, short });
      }
    }

    if (gaps.length > 0) {
      for (const g of gaps) {
        await tx.procurementNeed.create({
          data: {
            salesOrderId,
            itemId: g.itemId,
            qtyRequired: g.required,
            qtyOutstanding: g.short,
            status: PROCUREMENT_NEED_STATUS.OPEN,
          },
        });
      }
      return tx.salesOrder.update({
        where: { id: salesOrderId },
        data: { status: SALES_ORDER_STATUS.AWAITING_PROCUREMENT },
      });
    }

    await applyReservations(tx as PrismaClient, salesOrderId, required);

    return tx.salesOrder.update({
      where: { id: salesOrderId },
      data: {
        status: SALES_ORDER_STATUS.RESERVED,
        internalPickSlipRef:
          order.internalPickSlipRef ?? generatePickSlipRef(),
      },
    });
  });
}

async function applyReservations(
  prisma: Pick<PrismaClient, "reservation">,
  salesOrderId: string,
  required: Map<string, number>,
) {
  for (const [itemId, qty] of required.entries()) {
    await prisma.reservation.create({
      data: { salesOrderId, itemId, qty },
    });
  }
}

/** After receiving supplier stock — re-evaluate shortages and reserve if possible. */
export async function tryAllocateAfterStockChange(prisma: PrismaClient, salesOrderId?: string) {
  const awaiting = await prisma.salesOrder.findMany({
    where: {
      status: SALES_ORDER_STATUS.AWAITING_PROCUREMENT,
      ...(salesOrderId ? { id: salesOrderId } : {}),
    },
    orderBy: { createdAt: "asc" },
  });
  for (const order of awaiting) {
    await prisma.$transaction(async (tx) => {
      const locked = await tx.salesOrder.findUnique({
        where: { id: order.id },
      });
      if (!locked || locked.status !== SALES_ORDER_STATUS.AWAITING_PROCUREMENT) return;

      await tx.procurementNeed.deleteMany({ where: { salesOrderId: order.id } });
      await tx.reservation.deleteMany({ where: { salesOrderId: order.id } });

      const required = await explodeOrderRequirements(tx, order.id);
      const gaps: { itemId: string; required: number; available: number; short: number }[] = [];
      for (const [itemId, qty] of required.entries()) {
        const available = await getAvailableQty(tx as PrismaClient, itemId);
        const short = Math.max(0, qty - available);
        if (short > 0) {
          gaps.push({ itemId, required: qty, available, short });
        }
      }

      if (gaps.length > 0) {
        for (const g of gaps) {
          await tx.procurementNeed.create({
            data: {
              salesOrderId: order.id,
              itemId: g.itemId,
              qtyRequired: g.required,
              qtyOutstanding: g.short,
              status: PROCUREMENT_NEED_STATUS.OPEN,
            },
          });
        }
        return;
      }

      await applyReservations(tx as PrismaClient, order.id, required);
      await tx.salesOrder.update({
        where: { id: order.id },
        data: {
          status: SALES_ORDER_STATUS.RESERVED,
          internalPickSlipRef:
            locked.internalPickSlipRef ?? generatePickSlipRef(),
        },
      });
    });
  }
}

/** Release pick slip step (print-friendly view). Does not deduct stock yet. */
export async function advanceToPickReady(prisma: PrismaClient, salesOrderId: string) {
  const order = await prisma.salesOrder.findUnique({ where: { id: salesOrderId } });
  if (!order) throw new Error("Order not found");
  if (order.status !== SALES_ORDER_STATUS.RESERVED) {
    throw new Error("Order must be RESERVED before issuing pick slip.");
  }
  return prisma.salesOrder.update({
    where: { id: salesOrderId },
    data: {
      status: SALES_ORDER_STATUS.PICK_READY,
      internalPickSlipRef:
        order.internalPickSlipRef ?? generatePickSlipRef(),
    },
  });
}

/**
 * Warehouse confirms pick/pack completed: deduct stock once, release reservations,
 * recognize sale (automates procurement manager's manual bookkeeping).
 */
export async function finalizeFulfillment(prisma: PrismaClient, salesOrderId: string) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.salesOrder.findUnique({
      where: { id: salesOrderId },
      include: { reservations: true },
    });
    if (!order) throw new Error("Order not found");
    if (order.status !== SALES_ORDER_STATUS.PICK_READY) {
      throw new Error(
        `Order must be PICK_READY to finalize fulfillment (currently ${order.status}).`,
      );
    }

    const lines = await tx.salesOrderLine.findMany({ where: { salesOrderId } });
    let revenueCents = 0;
    for (const line of lines) {
      if (line.unitPrice == null) continue;
      revenueCents += line.quantity * line.unitPrice;
    }

    let costOfGoodsCents = 0;
    for (const r of order.reservations) {
      const component = await tx.item.findUnique({
        where: { id: r.itemId },
        select: { standardCostCents: true },
      });
      costOfGoodsCents += r.qty * (component?.standardCostCents ?? 0);
    }

    for (const r of order.reservations) {
      const stock = await tx.stockLevel.findUnique({ where: { itemId: r.itemId } });
      const cur = stock?.qtyOnHand ?? 0;
      if (cur < r.qty) {
        throw new Error(
          `Insufficient on-hand qty for fulfillment on item reservation (itemId=${r.itemId}). Expected ${r.qty}, saw ${cur}.`,
        );
      }
      await tx.stockLevel.update({
        where: { itemId: r.itemId },
        data: { qtyOnHand: { decrement: r.qty } },
      });
    }

    await tx.reservation.deleteMany({ where: { salesOrderId } });

    await tx.salePosting.upsert({
      where: { salesOrderId },
      update: {
        revenueRecognizedCents: revenueCents,
        costOfGoodsRecognizedCents: costOfGoodsCents,
        recognizedAt: null,
        memo: "Posted at fulfillment in SAR halalas. P&L recognition runs on shipment (Asia/Riyadh).",
      },
      create: {
        salesOrderId,
        revenueRecognizedCents: revenueCents,
        costOfGoodsRecognizedCents: costOfGoodsCents,
        recognizedAt: null,
        memo: "Posted at fulfillment in SAR halalas. P&L recognition runs on shipment (Asia/Riyadh).",
      },
    });

    return tx.salesOrder.update({
      where: { id: salesOrderId },
      data: {
        status: SALES_ORDER_STATUS.FULFILLED,
        fulfilledAt: new Date(),
      },
    });
  });
}

export async function markShipped(prisma: PrismaClient, salesOrderId: string, carrierNote?: string) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.salesOrder.findUnique({ where: { id: salesOrderId } });
    if (!order) throw new Error("Order not found");
    if (order.status !== SALES_ORDER_STATUS.FULFILLED) {
      throw new Error("Order must be FULFILLED before shipping.");
    }

    const shippedAt = new Date();
    const updated = await tx.salesOrder.update({
      where: { id: salesOrderId },
      data: {
        status: SALES_ORDER_STATUS.SHIPPED,
        shippedAt,
        shippedCarrierNote: carrierNote,
      },
    });

    await tx.salePosting.updateMany({
      where: { salesOrderId },
      data: { recognizedAt: shippedAt },
    });

    return updated;
  });
}

/** Receive inbound supplier quantity (increases on-hand then tries pending allocations). */
export async function receiveSupplierStock(prisma: PrismaClient, itemId: string, qty: number) {
  if (qty <= 0) throw new Error("Quantity must be positive");
  await prisma.$transaction(async (tx) => {
    await tx.stockLevel.upsert({
      where: { itemId },
      create: { itemId, qtyOnHand: qty },
      update: { qtyOnHand: { increment: qty } },
    });
  });

  await tryAllocateAfterStockChange(prisma);
}
