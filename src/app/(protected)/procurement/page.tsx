import Link from "next/link";
import Notice from "@/components/Notice";
import HideUnless from "@/components/rbac/HideUnless";
import {
  runReceiveSkuFromProcurement,
  runRecheckAllocationsFromProcurement,
  runSaveProcurementSupplierRef,
} from "@/actions/procurement";
import { getPrincipal } from "@/lib/auth/rbac";
import { PERM } from "@/lib/domain/permissions";
import { SALES_ORDER_STATUS } from "@/lib/domain/status";
import { prisma } from "@/lib/prisma";

const btnPri =
  "inline-flex shrink-0 items-center justify-center rounded-md bg-teal-700 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-teal-800";
const btnGhost =
  "inline-flex shrink-0 items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50";
const inputSm =
  "w-full min-w-0 rounded-md border border-slate-300 px-2 py-1.5 text-xs text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600";

export default async function ProcurementPage({
  searchParams,
}: {
  searchParams?: Promise<{ err?: string; received?: string; rechecked?: string; supplierSaved?: string }>;
}) {
  const qp = await searchParams;
  let errMsg = qp?.err;
  if (errMsg) {
    try {
      errMsg = decodeURIComponent(errMsg);
    } catch {
      /**/
    }
  }

  const principal = await getPrincipal();
  const canRetry = Boolean(principal?.permissions.has(PERM.ordersWorkflowRetry));
  const canOrders = Boolean(principal?.permissions.has(PERM.moduleOrders));
  const canReceive = Boolean(principal?.permissions.has(PERM.inventoryReceive));

  const needs = await prisma.procurementNeed.findMany({
    where: {
      salesOrder: {
        status: SALES_ORDER_STATUS.AWAITING_PROCUREMENT,
      },
    },
    include: {
      item: {
        select: { id: true, sku: true, name: true },
      },
      salesOrder: {
        select: {
          customerName: true,
          customerPoRef: true,
          id: true,
        },
      },
    },
    orderBy: { id: "asc" },
  });

  const grouped = new Map<
    string,
    { itemId: string; sku: string; name: string; rows: typeof needs }
  >();
  for (const need of needs) {
    const bucket = grouped.get(need.itemId) ?? {
      itemId: need.itemId,
      sku: need.item.sku,
      name: need.item.name,
      rows: [] as typeof needs,
    };
    bucket.rows.push(need);
    grouped.set(need.itemId, bucket);
  }

  const groups = [...grouped.values()].sort((a, b) => a.sku.localeCompare(b.sku));

  const flashOk =
    qp?.received || qp?.rechecked || qp?.supplierSaved
      ? [
          qp.received ? "Receipt posted; allocation was retried for waiting orders." : null,
          qp.rechecked ? "Allocation rechecked for that order." : null,
          qp.supplierSaved ? "Supplier reference saved." : null,
        ]
          .filter(Boolean)
          .join(" ")
      : null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">Procurement</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Shortfalls by component. Post a receipt here or in Inventory, then retry allocation so orders move to
          reserved when stock covers the gap.
        </p>
      </div>

      {errMsg ? <Notice message={errMsg} /> : null}
      {flashOk ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-950">
          {flashOk}
        </div>
      ) : null}

      {groups.length > 0 ? (
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/inventory" className="font-medium text-teal-800 underline decoration-teal-800/40 hover:text-teal-950">
            Full inventory & receipts →
          </Link>
          <HideUnless permission={PERM.moduleOrders}>
            <Link href="/orders" className="font-medium text-teal-800 underline decoration-teal-800/40 hover:text-teal-950">
              All orders →
            </Link>
          </HideUnless>
        </div>
      ) : null}

      {groups.length === 0 ? (
        <p className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
          Nothing waiting on suppliers.
        </p>
      ) : (
        groups.map((g) => {
          const totalShort = g.rows.reduce((sum, row) => sum + row.qtyOutstanding, 0);
          return (
            <section
              key={g.itemId}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="flex flex-col gap-4 border-b border-slate-100 bg-slate-50/80 px-4 py-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
                <div>
                  <div className="font-semibold tracking-tight text-slate-900">{g.sku}</div>
                  <div className="text-xs text-slate-600">{g.name}</div>
                  <div className="mt-1 text-xs font-medium text-amber-900">{totalShort} units short (across orders)</div>
                </div>

                <HideUnless permission={PERM.inventoryReceive}>
                  <div className="flex w-full max-w-lg flex-col gap-2">
                    <form
                      action={runReceiveSkuFromProcurement}
                      className="flex w-full flex-col gap-2 sm:flex-row sm:items-end"
                    >
                      <input type="hidden" name="itemId" value={g.itemId} />
                      <label className="flex-1 text-xs font-medium text-slate-700">
                        Receive for this SKU
                        <input
                          name="qty"
                          type="number"
                          min={1}
                          required
                          placeholder={`e.g. ${totalShort}`}
                          className={`${inputSm} mt-1 tabular-nums`}
                        />
                      </label>
                      <button type="submit" className={btnPri + " sm:mb-0.5"}>
                        Post receipt
                      </button>
                    </form>
                    <Link
                      href={`/inventory?ref=${encodeURIComponent(g.itemId)}`}
                      className="text-xs font-medium text-slate-600 underline decoration-slate-400 hover:text-slate-900"
                    >
                      Open full receipt form (prefilled SKU)
                    </Link>
                  </div>
                </HideUnless>
              </div>

              <div className="overflow-x-auto p-4">
                <table className="w-full min-w-[36rem] text-left text-[13px]">
                  <thead className="text-xs font-medium text-slate-500">
                    <tr>
                      <th className="pb-2 pr-3">Order</th>
                      <th className="pb-2 pr-3 text-right tabular-nums">Required</th>
                      <th className="pb-2 pr-3 text-right tabular-nums">Gap</th>
                      <th className="pb-2 pr-3">Status</th>
                      <th className="pb-2 pr-3 min-w-[9rem]">Supplier ref</th>
                      <th className="pb-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {g.rows.map((need) => (
                      <tr key={need.id} className="border-t border-slate-100 align-top">
                        <td className="py-3 pr-3">
                          {canOrders ? (
                            <Link
                              href={`/orders/${need.salesOrder.id}`}
                              className="font-semibold text-teal-800 underline decoration-teal-800/30 hover:text-teal-950"
                            >
                              {need.salesOrder.customerName}
                            </Link>
                          ) : (
                            <span className="font-semibold text-slate-900">{need.salesOrder.customerName}</span>
                          )}
                          <div className="text-[11px] text-slate-500">
                            Cust ref {need.salesOrder.customerPoRef ?? "—"}
                          </div>
                        </td>
                        <td className="py-3 pr-3 text-right tabular-nums">{need.qtyRequired}</td>
                        <td className="py-3 pr-3 text-right tabular-nums font-semibold text-amber-900">
                          {need.qtyOutstanding}
                        </td>
                        <td className="py-3 pr-3 text-xs text-slate-600">{prettyStatus(need.status)}</td>
                        <td className="py-3 pr-3">
                          <form action={runSaveProcurementSupplierRef} className="flex flex-col gap-1.5 sm:flex-row sm:items-center">
                            <input type="hidden" name="needId" value={need.id} />
                            <input
                              name="supplierReference"
                              defaultValue={need.supplierReference ?? ""}
                              placeholder="PO / ASN"
                              className={inputSm}
                            />
                            <button type="submit" className={btnGhost}>
                              Save
                            </button>
                          </form>
                        </td>
                        <td className="py-3">
                          <div className="flex flex-col items-end gap-2 sm:flex-row sm:justify-end">
                            {canRetry ? (
                              <form action={runRecheckAllocationsFromProcurement.bind(null, need.salesOrder.id)}>
                                <button type="submit" className={btnPri}>
                                  Retry allocation
                                </button>
                              </form>
                            ) : null}
                            {canOrders ? (
                              <Link href={`/orders/${need.salesOrder.id}`} className={btnGhost}>
                                Open order
                              </Link>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {!canReceive && !canRetry ? (
                <p className="border-t border-slate-100 bg-slate-50 px-4 py-2 text-xs text-slate-600">
                  You can view shortfalls. Ask an admin for{" "}
                  <span className="font-medium">inventory receive</span> and/or{" "}
                  <span className="font-medium">retry allocation</span> to act from this page.
                </p>
              ) : null}
            </section>
          );
        })
      )}
    </div>
  );
}

function prettyStatus(s: string) {
  return s.replaceAll("_", " ").toLowerCase();
}
