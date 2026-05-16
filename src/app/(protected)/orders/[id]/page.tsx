import Link from "next/link";
import Notice from "@/components/Notice";
import { formatDateTimeKsa } from "@/lib/format/datetime";
import { formatSarFromHalalas } from "@/lib/format/money";
import { getPrincipal } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma";
import { SALES_ORDER_STATUS } from "@/lib/domain/status";
import { PERM, type PermissionCode } from "@/lib/domain/permissions";
import {
  runCancelSalesOrder,
  runFinalizeFulfillment,
  runIssuePickSlip,
  runMarkShipped,
  runRecheckAllocations,
  runSubmitOrder,
} from "@/actions/orders";

function pretty(status: string) {
  return status.replaceAll("_", " ").toLowerCase();
}

const btnPri =
  "inline-flex rounded-md bg-teal-700 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-800";
const btnGhost =
  "inline-flex rounded-md border border-slate-300 bg-white px-6 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50";

export default async function OrderDetailPage(props: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ err?: string }>;
}) {
  const { id } = await props.params;
  const qp = await props.searchParams;

  let errMsg = qp?.err;
  if (errMsg) {
    try {
      errMsg = decodeURIComponent(errMsg);
    } catch {
      /**/
    }
  }

  const order = await prisma.salesOrder.findUnique({
    where: { id },
    include: {
      customer: { select: { id: true, name: true } },
      lines: {
        include: {
          item: { select: { sku: true, name: true, kind: true } },
        },
      },
      reservations: {
        include: { item: { select: { sku: true, name: true } } },
      },
      procurementNeeds: {
        include: { item: { select: { sku: true } } },
        orderBy: { createdAt: "asc" },
      },
      salePosting: true,
    },
  });

  if (!order) {
    return (
      <p>
        Missing order — return to{" "}
        <Link href="/orders" className="underline">
          list
        </Link>
        .
      </p>
    );
  }

  const printable =
    order.status === SALES_ORDER_STATUS.RESERVED ||
    order.status === SALES_ORDER_STATUS.PICK_READY ||
    order.status === SALES_ORDER_STATUS.FULFILLED ||
    order.status === SALES_ORDER_STATUS.SHIPPED;

  const principal = await getPrincipal();
  const canCustomers = Boolean(principal?.permissions.has(PERM.moduleCustomers));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="space-y-3">
          <Link href="/orders" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            ← Orders
          </Link>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">{order.customerName}</h1>
            <p className="text-sm text-slate-600">PO reference {order.customerPoRef ?? "—"}</p>
            {order.customerId && order.customer && canCustomers ? (
              <p className="mt-2 text-xs text-slate-600">
                Linked directory record:{" "}
                <Link href={`/customers/${order.customerId}`} className="font-medium text-teal-800 underline">
                  {order.customer.name}
                </Link>
              </p>
            ) : null}
            <dl className="mt-4 grid gap-3 text-xs text-slate-600 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <dt className="text-xs font-medium text-slate-500">Stage</dt>
                <dd className="mt-1 inline-flex rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[11px] font-medium capitalize text-slate-800">
                  {pretty(order.status)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-500">Pick slip</dt>
                <dd className="mt-1 font-mono text-sm text-slate-800">
                  {order.internalPickSlipRef ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-500">Fulfilled</dt>
                <dd className="mt-1 text-sm">{order.fulfilledAt ? formatDateTimeKsa(order.fulfilledAt) : "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-500">Shipped</dt>
                <dd className="mt-1 text-sm">
                  {order.shippedAt
                    ? formatDateTimeKsa(order.shippedAt) +
                      (order.shippedCarrierNote ? " · " + order.shippedCarrierNote : "")
                    : "—"}
                </dd>
              </div>
            </dl>
          </div>
        </div>
        {printable ? (
          <Link
            href={"/orders/" + order.id + "/pick-slip"}
            className="inline-flex rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Pick slip preview
          </Link>
        ) : null}
      </div>

      {errMsg ? <Notice message={errMsg} /> : null}

      <WorkflowBar orderId={order.id} status={order.status} />

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-medium text-slate-800">Lines</h2>
        <table className="mt-3 w-full text-left text-sm">
          <thead className="text-xs font-semibold text-slate-600">
            <tr>
              <th className="pb-3 pr-3">SKU</th>
              <th className="pb-3 pr-3">Name</th>
              <th className="pb-3 pr-3">Type</th>
              <th className="pb-3 pr-3 tabular-nums">Qty</th>
              <th className="pb-3 tabular-nums">Unit price</th>
            </tr>
          </thead>
          <tbody>
            {order.lines.map((ln) => (
              <tr key={ln.id} className="border-t border-zinc-100">
                <td className="py-3 pr-3 font-semibold">{ln.item.sku}</td>
                <td className="py-3 pr-3">{ln.item.name}</td>
                <td className="py-3 pr-3">{ln.item.kind}</td>
                <td className="py-3 pr-3 tabular-nums">{ln.quantity}</td>
                <td className="py-3 tabular-nums">{ln.unitPrice ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {order.reservations.length > 0 ? (
        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-medium text-slate-800">Reservations</h2>
          <p className="mt-2 text-xs text-slate-600">Stock held for this order until pick or cancel.</p>
          <table className="mt-3 w-full text-left text-sm">
            <thead className="text-xs font-semibold text-slate-600">
              <tr>
                <th className="pb-3 pr-3">Component</th>
                <th className="pb-3 tabular-nums">Qty</th>
              </tr>
            </thead>
            <tbody>
              {order.reservations.map((r) => (
                <tr key={r.id} className="border-t border-zinc-100">
                  <td className="py-3 pr-3 font-semibold">
                    {r.item.sku}{" "}
                    <span className="font-normal opacity-85">— {r.item.name}</span>
                  </td>
                  <td className="py-3 tabular-nums">{r.qty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}

      {order.procurementNeeds.length > 0 ? (
        <section className="rounded-xl border border-amber-100 bg-amber-50 p-4 text-amber-950">
          <h2 className="text-sm font-medium text-amber-950">Procurement</h2>
          <p className="mt-2 text-xs opacity-95">Receiving stock will retry allocation automatically.</p>
          <table className="mt-3 w-full text-left text-xs">
            <thead className="text-xs font-semibold text-slate-600">
              <tr>
                <th className="pb-3 pr-3">SKU</th>
                <th className="pb-3 pr-3 tabular-nums">Required</th>
                <th className="pb-3 tabular-nums">Shortfall</th>
              </tr>
            </thead>
            <tbody>
              {order.procurementNeeds.map((n) => (
                <tr key={n.id} className="border-t border-amber-300">
                  <td className="py-3 pr-3">{n.item.sku}</td>
                  <td className="py-3 pr-3 tabular-nums">{n.qtyRequired}</td>
                  <td className="py-3 tabular-nums">{n.qtyOutstanding}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}

      {order.salePosting ? (
        <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-950">
          <h2 className="text-sm font-medium text-emerald-950">Sale amounts</h2>
          <p className="mt-2 text-xs opacity-95">
            {order.salePosting.recognizedAt
              ? `Recognized ${formatDateTimeKsa(order.salePosting.recognizedAt)} (Riyadh).`
              : `Shipment pending — ${order.fulfilledAt ? formatDateTimeKsa(order.fulfilledAt) : "not finalized yet"}.`}
          </p>
          <dl className="mt-4 grid gap-4 text-xs sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium text-slate-600">Revenue</dt>
              <dd className="mt-2 tabular-nums text-xl font-semibold">
                {formatSarFromHalalas(order.salePosting.revenueRecognizedCents)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-600">COGS</dt>
              <dd className="mt-2 tabular-nums text-xl font-semibold">
                ({formatSarFromHalalas(order.salePosting.costOfGoodsRecognizedCents)})
              </dd>
            </div>
            <div className="sm:col-span-2 rounded-lg border border-emerald-900/25 bg-emerald-100/50 px-3 py-2">
              <dt className="text-xs font-medium text-slate-600">Gross</dt>
              <dd className="mt-2 tabular-nums text-lg font-semibold">
                {formatSarFromHalalas(
                  order.salePosting.revenueRecognizedCents - order.salePosting.costOfGoodsRecognizedCents,
                )}
              </dd>
            </div>
          </dl>
          {order.salePosting.memo ? (
            <p className="mt-4 text-[11px] opacity-85">{order.salePosting.memo}</p>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}

async function WorkflowBar(props: { orderId: string; status: string }) {
  const { orderId, status } = props;
  const principal = await getPrincipal();
  const can = (perm: PermissionCode) => Boolean(principal?.permissions.has(perm));

  if (status === SALES_ORDER_STATUS.SHIPPED) {
    return (
      <section className="rounded-xl border border-zinc-300 bg-green-50 p-4 text-sm text-green-950">
        Shipped.
      </section>
    );
  }
  if (status === SALES_ORDER_STATUS.CANCELLED) {
    return (
      <section className="rounded-xl border border-slate-200 bg-slate-100 p-4 text-sm text-slate-800">
        Cancelled.
      </section>
    );
  }

  const isDraft = status === SALES_ORDER_STATUS.DRAFT;
  const awaiting = status === SALES_ORDER_STATUS.AWAITING_PROCUREMENT;
  const reserved = status === SALES_ORDER_STATUS.RESERVED;
  const pickReady = status === SALES_ORDER_STATUS.PICK_READY;
  const fulfilled = status === SALES_ORDER_STATUS.FULFILLED;
  const statusAllowsCancel =
    status === SALES_ORDER_STATUS.DRAFT ||
    status === SALES_ORDER_STATUS.AWAITING_PROCUREMENT ||
    status === SALES_ORDER_STATUS.RESERVED ||
    status === SALES_ORDER_STATUS.PICK_READY;

  return (
    <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <h2 className="text-sm font-medium text-slate-800">Next steps</h2>
      <p className="mt-2 text-xs text-slate-600">Use the action that matches the current stage.</p>
      <div className="mt-6 flex flex-wrap gap-7">
        {isDraft && can(PERM.ordersWorkflowSubmit) ? (
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-700">Submit for stock check</p>
            <form action={runSubmitOrder.bind(null, orderId)}>
              <button className={btnPri} type="submit">
                Check stock & allocate
              </button>
            </form>
          </div>
        ) : null}

        {awaiting && can(PERM.ordersWorkflowRetry) ? (
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-700">After receiving</p>
            <form action={runRecheckAllocations.bind(null, orderId)}>
              <button className={btnPri} type="submit">
                Retry allocation
              </button>
            </form>
          </div>
        ) : null}

        {reserved && can(PERM.ordersWorkflowPick) ? (
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-700">Warehouse</p>
            <form action={runIssuePickSlip.bind(null, orderId)}>
              <button className={btnPri} type="submit">
                Issue pick slip
              </button>
            </form>
          </div>
        ) : null}

        {pickReady && can(PERM.ordersWorkflowFulfill) ? (
          <div className="space-y-3">
            <p className="text-xs text-amber-900">Pick complete? This deducts inventory and records the sale draft.</p>
            <form action={runFinalizeFulfillment.bind(null, orderId)}>
              <button className={btnPri} type="submit">
                Confirm fulfillment
              </button>
            </form>
          </div>
        ) : null}

        {fulfilled && can(PERM.ordersWorkflowShip) ? (
          <div className="space-y-6">
            <p className="text-xs font-medium text-emerald-950">Mark shipped when it leaves.</p>
            <form action={runMarkShipped} className="flex max-w-sm flex-col gap-3">
              <input type="hidden" name="orderId" value={orderId} />
              <textarea
                className="min-h-[92px] rounded-md border border-zinc-300 px-3 py-2 text-xs"
                placeholder="Carrier / parcel note optional"
                name="carrierNote"
              />
              <button className={btnPri} type="submit">
                Mark shipped
              </button>
            </form>
          </div>
        ) : null}

        {statusAllowsCancel && can(PERM.ordersWorkflowCancel) ? (
          <form action={runCancelSalesOrder.bind(null, orderId)}>
            <button className={btnGhost + " text-xs text-slate-800"} type="submit">
              Cancel order
            </button>
          </form>
        ) : null}
      </div>
    </section>
  );
}
