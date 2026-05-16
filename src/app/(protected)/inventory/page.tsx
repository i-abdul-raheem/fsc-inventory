import type { ReactNode } from "react";
import { prisma } from "@/lib/prisma";
import Notice from "@/components/Notice";
import { ITEM_KIND, SALES_ORDER_STATUS } from "@/lib/domain/status";
import { PERM } from "@/lib/domain/permissions";
import { getPrincipal } from "@/lib/auth/rbac";
import { runAdjustPhysicalStock, runReceiveInbound } from "@/actions/inventory";

export default async function InventoryPage({
  searchParams,
}: {
  searchParams?: Promise<{ err?: string; received?: string; adjusted?: string; ref?: string }>;
}) {
  const qp = await searchParams;
  const principal = await getPrincipal();
  const showReceive = Boolean(principal?.permissions.has(PERM.inventoryReceive));
  const showAdjust = Boolean(principal?.permissions.has(PERM.inventoryAdjust));

  const successParts: string[] = [];
  if (qp?.received) successParts.push("Receipt posted.");
  if (qp?.adjusted) successParts.push("Adjustment saved.");
  const flashOk = successParts.length ? successParts.join(" ") : null;

  const [components, reservedRows] = await Promise.all([
    prisma.item.findMany({
      where: { kind: ITEM_KIND.COMPONENT, active: true },
      orderBy: { sku: "asc" },
      include: {
        stock: true,
      },
    }),
    prisma.reservation.groupBy({
      by: ["itemId"],
      where: {
        salesOrder: {
          status: {
            notIn: [
              SALES_ORDER_STATUS.FULFILLED,
              SALES_ORDER_STATUS.SHIPPED,
              SALES_ORDER_STATUS.CANCELLED,
            ],
          },
        },
      },
      _sum: {
        qty: true,
      },
    }),
  ]);

  const reservedMap = new Map(reservedRows.map((r) => [r.itemId, r._sum.qty ?? 0]));

  const refId = qp?.ref?.trim();
  const defaultItemId =
    refId && components.some((c) => c.id === refId) ? refId : "";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">Inventory</h1>
        <p className="mt-2 max-w-xl text-sm text-slate-600">
          Receive supplier stock or adjust counts. Reservations on open orders reduce “available”.
        </p>
      </div>

      {qp?.err ? <Notice message={qp.err} /> : null}

      {flashOk ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-950">
          {flashOk}
        </div>
      ) : null}

      {(showReceive || showAdjust) && (
      <div
        className={`grid gap-6 ${showReceive && showAdjust ? "lg:grid-cols-2" : ""}`}
      >
        {showReceive ? (
        <Card title="Receipt">
          <form action={runReceiveInbound} className="flex flex-col gap-3">
            <label className="text-sm font-medium text-slate-700">
              SKU
              <select
                className="mt-1 block w-full rounded-lg border border-zinc-900/50 bg-transparent px-3 py-2 text-sm"
                name="itemId"
                required
                defaultValue={defaultItemId}
              >
                <option value="">Select component …</option>
                {components.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.sku} — {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium text-slate-700">
              Quantity
              <input
                required
                name="qty"
                type="number"
                min={1}
                placeholder="Pieces received"
                className="mt-1 block w-full rounded-lg border border-zinc-900/50 px-3 py-2 text-sm"
              />
            </label>
            <Submit label="Receive" tone="accent" />
          </form>
        </Card>
        ) : null}

        {showAdjust ? (
        <Card title="Adjustment">
          <form action={runAdjustPhysicalStock} className="flex flex-col gap-3">
            <label className="text-sm font-medium text-slate-700">
              SKU
              <select
                className="mt-1 block w-full rounded-lg border border-zinc-900/50 bg-transparent px-3 py-2 text-sm"
                name="itemId"
                required
                defaultValue={defaultItemId}
              >
                <option value="">Select …</option>
                {components.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.sku}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium text-slate-700">
              Delta (+ / −)
              <input
                name="delta"
                type="number"
                required
                className="mt-1 block w-full rounded-lg border border-zinc-900/50 px-3 py-2 font-mono text-sm"
                placeholder="+5 or −2"
              />
            </label>
            <Submit label="Apply adjustment" tone="muted" />
          </form>
        </Card>
        ) : null}
      </div>
      )}

      <section className="overflow-x-auto rounded-xl border border-slate-200 bg-white p-6 text-slate-900 shadow-sm">
        <h2 className="text-sm font-medium text-slate-800">Availability by SKU</h2>
        <table className="mt-4 w-full min-w-[30rem] text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs font-semibold text-slate-500">
              <th className="py-3 pr-4">SKU</th>
              <th className="py-3 pr-4">Name</th>
              <th className="py-3 pr-4 tabular-nums">Physical</th>
              <th className="py-3 pr-4 tabular-nums">Allocated</th>
              <th className="py-3 tabular-nums">Avail.</th>
            </tr>
          </thead>
          <tbody>
            {components.map((c) => {
              const onHand = c.stock?.qtyOnHand ?? 0;
              const reserved = reservedMap.get(c.id) ?? 0;
              const avail = Math.max(0, onHand - reserved);
              return (
                <tr key={c.id} className="border-t border-slate-100 hover:bg-slate-50/80">
                  <td className="py-4 pr-4 font-medium tracking-tight text-slate-900">{c.sku}</td>
                  <td className="py-4 pr-4">{c.name}</td>
                  <td className="py-4 pr-4 tabular-nums">{onHand}</td>
                  <td className="py-4 pr-4 tabular-nums">{reserved}</td>
                  <td className="py-4 tabular-nums font-semibold text-slate-900">{avail}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function Card(props: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-[color:var(--surface)] p-6 shadow-sm">
      <h2 className="text-sm font-medium text-slate-800">{props.title}</h2>
      <div className="mt-4">{props.children}</div>
    </section>
  );
}

function Submit(props: {
  label: string;
  tone?: "accent" | "muted";
}) {
  const cls =
    props.tone === "muted"
      ? "mt-4 inline-flex cursor-pointer rounded-lg border border-slate-200 bg-transparent px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
      : "mt-4 inline-flex cursor-pointer rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-teal-800";
  return (
    <button type="submit" className={cls}>
      {props.label}
    </button>
  );
}
