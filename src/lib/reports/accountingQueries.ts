import { prisma } from "@/lib/prisma";
import { ITEM_KIND, SALES_ORDER_STATUS } from "@/lib/domain/status";

/** Inclusive day window in local wall-clock semantics (matches HTML date inputs). */
export type LocalCalendarRange = {
  rangeStartLocal: Date;
  rangeEndLocalInclusive: Date;
};

/** Parse yyyy-mm-dd strings from URL search params. */
export function parseLocalCalendarRange(
  fromParam: string | undefined,
  toParam: string | undefined,
): LocalCalendarRange {
  const fallback = calendarMonthToDateBounds(new Date());
  const parseOr = (iso: string | undefined, fb: Date) =>
    iso && iso.length >= 8 ? parseLocalDayStart(iso) : fb;
  let rangeStartLocal = parseOr(fromParam, fallback.rangeStartLocal);
  let rangeEndLocalInclusive = parseOr(toParam, fallback.rangeEndLocalInclusive);
  if (rangeEndLocalInclusive < rangeStartLocal) {
    [rangeStartLocal, rangeEndLocalInclusive] = [rangeEndLocalInclusive, rangeStartLocal];
  }
  rangeEndLocalInclusive = endOfLocalDay(rangeEndLocalInclusive);
  return { rangeStartLocal, rangeEndLocalInclusive };
}

function parseLocalDayStart(yyyyMmDd: string): Date {
  const parts = yyyyMmDd.split("-").map((p) => Number.parseInt(p, 10));
  const [y, m, d] = parts;
  if (
    parts.length !== 3 ||
    !Number.isFinite(y) ||
    !Number.isFinite(m) ||
    !Number.isFinite(d)
  ) {
    throw new RangeError(`Invalid calendar day: ${yyyyMmDd}`);
  }
  return new Date(y!, m! - 1, d!, 0, 0, 0, 0);
}

function endOfLocalDay(startOfDay: Date): Date {
  return new Date(
    startOfDay.getFullYear(),
    startOfDay.getMonth(),
    startOfDay.getDate(),
    23,
    59,
    59,
    999,
  );
}

function calendarMonthToDateBounds(reference: Date): LocalCalendarRange {
  const rangeStartLocal = new Date(reference.getFullYear(), reference.getMonth(), 1, 0, 0, 0, 0);
  const rangeEndLocalInclusive = endOfLocalDay(reference);
  return { rangeStartLocal, rangeEndLocalInclusive };
}

export async function summarizeProfitLoss(range: LocalCalendarRange) {
  const postings = await prisma.salePosting.findMany({
    where: {
      recognizedAt: {
        gte: range.rangeStartLocal,
        lte: range.rangeEndLocalInclusive,
      },
    },
    orderBy: { recognizedAt: "asc" },
    include: {
      salesOrder: { select: { id: true, customerName: true } },
    },
  });

  let revenue = 0;
  let costOfGoods = 0;
  for (const p of postings) {
    revenue += p.revenueRecognizedCents;
    costOfGoods += p.costOfGoodsRecognizedCents;
  }

  return {
    postings,
    revenueCents: revenue,
    costOfGoodsCents: costOfGoods,
    grossProfitCents: revenue - costOfGoods,
  };
}

/** Sales register backed by shipments in the calendar window (posting amounts may be zero if prices unset). */
export async function summarizeSalesRegister(range: LocalCalendarRange) {
  const orders = await prisma.salesOrder.findMany({
    where: {
      status: SALES_ORDER_STATUS.SHIPPED,
      shippedAt: {
        gte: range.rangeStartLocal,
        lte: range.rangeEndLocalInclusive,
      },
    },
    orderBy: { shippedAt: "asc" },
    include: {
      salePosting: true,
    },
  });

  let revenue = 0;
  let costOfGoods = 0;
  type OrderRegisterRow = (typeof orders)[number];
  const byCustomer = new Map<
    string,
    { revenueCents: number; orders: OrderRegisterRow[] }
  >();
  for (const o of orders) {
    const rev = o.salePosting?.revenueRecognizedCents ?? 0;
    const cogs = o.salePosting?.costOfGoodsRecognizedCents ?? 0;
    revenue += rev;
    costOfGoods += cogs;
    const agg =
      byCustomer.get(o.customerName) ??
      ({
        revenueCents: 0,
        orders: [],
      } as { revenueCents: number; orders: OrderRegisterRow[] });
    agg.revenueCents += rev;
    agg.orders.push(o);
    byCustomer.set(o.customerName, agg);
  }

  const customers = [...byCustomer.entries()]
    .map(([customerName, v]) => ({ customerName, ...v }))
    .sort((a, b) => b.revenueCents - a.revenueCents || a.customerName.localeCompare(b.customerName));

  return { orders, byCustomer: customers, revenueCents: revenue, costOfGoodsCents: costOfGoods };
}

export async function summarizeInventoryValuation() {
  const items = await prisma.item.findMany({
    where: { kind: ITEM_KIND.COMPONENT },
    include: { stock: true },
    orderBy: { sku: "asc" },
  });

  let totalCents = 0;
  const lines = items.map((item) => {
    const qty = item.stock?.qtyOnHand ?? 0;
    const unit = item.standardCostCents;
    const unitCentsUsed = unit ?? 0;
    const extended = qty * unitCentsUsed;
    totalCents += extended;
    return {
      sku: item.sku,
      name: item.name,
      qtyOnHand: qty,
      standardCostCents: unit,
      extendedInventoryCents: extended,
      missingCost: unit == null,
    };
  });

  const missingCosts = lines.filter((l) => l.missingCost && l.qtyOnHand !== 0);

  return { lines, totalCents, missingCosts };
}

/**
 * KSA-oriented snapshot: SAR inventory at standard halala cost vs. accumulated IMS gross surplus.
 * Cash, VAT, payables, and GAAP bridging are not modeled.
 */
export async function summarizeBalanceSheetSnapshot(asOfInput: string | undefined) {
  const fb = calendarMonthToDateBounds(new Date());
  const anchor = asOfInput && asOfInput.length >= 8 ? parseLocalDayStart(asOfInput) : fb.rangeEndLocalInclusive;
  const rangeEndInclusive = endOfLocalDay(anchor);

  const postings = await prisma.salePosting.findMany({
    where: {
      recognizedAt: {
        lte: rangeEndInclusive,
      },
    },
  });

  let revenue = 0;
  let costOfGoods = 0;
  for (const p of postings) {
    revenue += p.revenueRecognizedCents;
    costOfGoods += p.costOfGoodsRecognizedCents;
  }
  const surplusCents = revenue - costOfGoods;

  return {
    rangeEndInclusive,
    surplusCents,
    postingsCount: postings.length,
  };
}
