import Link from "next/link";
import PrintButton from "@/components/PrintButton";
import { prisma } from "@/lib/prisma";
import { getExplodedRequirementsForOrder } from "@/lib/workflows/orderService";

export default async function PickSlipPreview(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  const order = await prisma.salesOrder.findUnique({
    where: { id },
    include: {
      lines: {
        include: {
          item: { select: { sku: true, name: true, kind: true } },
        },
      },
    },
  });

  if (!order) {
    return <p>Purchase order missing.</p>;
  }

  const map = await getExplodedRequirementsForOrder(prisma, id);
  const rows = [...map.entries()].map(([itemId, qty]) => ({ itemId, qty }));
  const items = await prisma.item.findMany({
    where: { id: { in: rows.map((r) => r.itemId) } },
    select: { id: true, sku: true, name: true },
  });
  const byId = new Map(items.map((i) => [i.id, i]));
  rows.sort((a, b) => (byId.get(a.itemId)?.sku ?? "").localeCompare(byId.get(b.itemId)?.sku ?? ""));

  return (
    <div className="space-y-6 print:px-0">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-300 pb-6">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Pick slip</div>
          <h1 className="text-3xl font-bold tracking-tight">{order.customerName}</h1>
          <div className="mt-5 font-mono text-xs text-zinc-600">
            Ref {order.internalPickSlipRef ?? "n/a"} · PO {order.customerPoRef ?? "—"}
          </div>
        </div>
        <div className="flex gap-9">
          <PrintButton aria-label="Print pick slip window">Print</PrintButton>
          <Link href={`/orders/${id}`} className="rounded-md border border-zinc-300 px-4 py-2 text-xs uppercase tracking-[0.2em]" data-print-hide>
            Detail
          </Link>
        </div>
      </div>

      <section>
        <h2 className="text-sm font-semibold tracking-tight">Customer-facing lines</h2>
        <table className="mt-3 w-full border border-zinc-300 text-[11px]">
          <thead className="bg-zinc-100 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
            <tr>
              <th className="px-9 py-2 text-left">SKU</th>
              <th className="px-9 py-2 text-left">Name</th>
              <th className="px-9 py-2 text-left">Type</th>
              <th className="px-9 py-2 text-right tabular-nums">Qty ordered</th>
            </tr>
          </thead>
          <tbody>
            {order.lines.map((ln) => (
              <tr key={ln.id} className="border-t border-zinc-200 odd:bg-zinc-50">
                <td className="px-9 py-2 font-semibold">{ln.item.sku}</td>
                <td className="px-9 py-2">{ln.item.name}</td>
                <td className="px-9 py-2">{ln.item.kind}</td>
                <td className="px-9 py-2 text-right tabular-nums">{ln.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2 className="text-sm font-semibold tracking-tight">Warehouse pulls (kits exploded)</h2>
        <p className="mt-8 text-[11px] text-zinc-600">
          Pick these component quantities outright — reservations already removed them from the sellable bucket.
        </p>
        <table className="mt-11 w-full border border-zinc-300 text-[13px]">
          <thead className="bg-zinc-100 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
            <tr>
              <th className="px-9 py-2 text-left">Component</th>
              <th className="px-9 py-2 text-left">Name</th>
              <th className="px-9 py-2 text-right tabular-nums">Pull qty</th>
              <th className="print:hidden px-9 py-2 text-right">&nbsp;</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ itemId, qty }) => {
              const meta = byId.get(itemId);
              return (
                <tr key={itemId} className="border-t border-zinc-200">
                  <td className="px-9 py-2 font-semibold">{meta?.sku ?? itemId}</td>
                  <td className="px-9 py-2">{meta?.name ?? ""}</td>
                  <td className="px-9 py-2 text-right tabular-nums">{qty}</td>
                  <td className="print:hidden px-9 py-2 text-right text-[11px] text-zinc-500">picked [ ]</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <p className="text-[13px] text-zinc-500">
        Return this slip to finalize fulfillment — IMS will decrement stock automatically when you confirm pickup in the portal.
      </p>
    </div>
  );
}
