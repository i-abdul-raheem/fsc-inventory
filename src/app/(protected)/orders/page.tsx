import Link from "next/link";

import HideUnless from "@/components/rbac/HideUnless";
import { getPrincipal } from "@/lib/auth/rbac";
import { formatDateTimeKsa } from "@/lib/format/datetime";
import { PERM } from "@/lib/domain/permissions";
import { prisma } from "@/lib/prisma";

function prettyStatus(status: string) {
  return status.replaceAll("_", " ").toLowerCase();
}

export default async function OrdersIndexPage() {
  const principal = await getPrincipal();
  const canCreate = Boolean(principal?.permissions.has(PERM.ordersPoCreate));

  const orders = await prisma.salesOrder.findMany({
    orderBy: { createdAt: "desc" },
    take: 150,
    select: {
      id: true,
      customerName: true,
      customerPoRef: true,
      status: true,
      internalPickSlipRef: true,
      createdAt: true,
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">Orders</h1>
          <p className="mt-2 max-w-xl text-sm text-slate-600">
            Customer POs from draft through ship. Times use Asia/Riyadh.
          </p>
        </div>
        <HideUnless permission={PERM.ordersPoCreate}>
          <Link
            href="/orders/new"
            className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-800"
          >
            New PO
          </Link>
        </HideUnless>
      </div>

      <section className="overflow-x-auto rounded-xl border border-zinc-300 bg-white text-sm shadow-sm">
        <table className="w-full min-w-[36rem] text-left">
          <thead className="border-b border-slate-200 bg-slate-100 text-xs font-semibold text-slate-600">
            <tr>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Cust. PO ref</th>
              <th className="px-4 py-3">Pick slip #</th>
              <th className="px-4 py-3">Stage</th>
              <th className="px-4 py-3 text-right">Created</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-zinc-600">
                  No POs yet
                  {canCreate ? (
                    <>
                      {" "}
                      — start with{" "}
                      <Link href="/orders/new" className="underline">
                        New PO
                      </Link>
                      .
                    </>
                  ) : (
                    "."
                  )}
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="border-t border-zinc-200 hover:bg-zinc-50">
                  <td className="px-4 py-3">
                    <Link href={`/orders/${order.id}`} className="font-semibold text-slate-900">
                      {order.customerName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-600">{order.customerPoRef ?? "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs">{order.internalPickSlipRef ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[10px] font-medium capitalize text-slate-800">
                      {prettyStatus(order.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-zinc-600">
                    {formatDateTimeKsa(order.createdAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
