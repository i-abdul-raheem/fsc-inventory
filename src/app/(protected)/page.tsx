import Link from "next/link";

import { formatDateTimeKsa } from "@/lib/format/datetime";
import { getLowStockAlerts } from "@/lib/alerts/lowStock";
import { requireRoute } from "@/lib/auth/rbac";
import { PERM } from "@/lib/domain/permissions";
import { prisma } from "@/lib/prisma";
import { SALES_ORDER_STATUS } from "@/lib/domain/status";
import HideUnless from "@/components/rbac/HideUnless";

const QUICK_LINKS: readonly { href: string; label: string; perm: (typeof PERM)[keyof typeof PERM]; desc: string }[] = [
  { href: "/orders", label: "Orders", perm: PERM.moduleOrders, desc: "PO pipeline" },
  { href: "/procurement", label: "Procurement", perm: PERM.moduleProcurement, desc: "Shortfalls" },
  { href: "/inventory", label: "Inventory", perm: PERM.moduleInventory, desc: "Receipts" },
  { href: "/catalog", label: "Catalogue", perm: PERM.moduleCatalog, desc: "SKUs & BOMs" },
  { href: "/customers", label: "Customers", perm: PERM.moduleCustomers, desc: "KSA buyers" },
  { href: "/sellers", label: "Sellers", perm: PERM.moduleSellers, desc: "Suppliers" },
  { href: "/reports", label: "Reports", perm: PERM.moduleReports, desc: "SAR views" },
  { href: "/alerts", label: "Alerts", perm: PERM.moduleAlerts, desc: "Low stock" },
] as const;

export default async function HomePage() {
  const principal = await requireRoute(PERM.moduleDashboard);
  const canOrders = principal.permissions.has(PERM.moduleOrders);
  const canCatalog = principal.permissions.has(PERM.moduleCatalog);
  const canAlerts = principal.permissions.has(PERM.moduleAlerts);

  const quickLinks = QUICK_LINKS.filter((l) => principal.permissions.has(l.perm));

  const alerts = canAlerts ? await getLowStockAlerts() : [];
  const statusRows = canOrders
    ? await prisma.salesOrder.groupBy({
        by: ["status"],
        _count: { status: true },
      })
    : [];
  const backlog = canOrders
    ? await prisma.salesOrder.findMany({
        where: {
          status: {
            notIn: [SALES_ORDER_STATUS.SHIPPED, SALES_ORDER_STATUS.CANCELLED],
          },
        },
        orderBy: { createdAt: "desc" },
        take: 6,
        select: {
          id: true,
          customerName: true,
          customerPoRef: true,
          status: true,
          createdAt: true,
        },
      })
    : [];

  const statusMap = new Map(statusRows.map((row) => [row.status, row._count.status]));

  const chips = Object.values(SALES_ORDER_STATUS).map((s) => ({
    key: s,
    count: statusMap.get(s) ?? 0,
  }));

  const openPipeline = chips
    .filter(
      (c) =>
        c.key !== SALES_ORDER_STATUS.SHIPPED && c.key !== SALES_ORDER_STATUS.CANCELLED,
    )
    .reduce((sum, c) => sum + c.count, 0);

  return (
    <div className="space-y-10 pb-4">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-br from-white via-white to-teal-50/40 px-6 py-8 shadow-sm ring-1 ring-slate-900/5 sm:px-8 sm:py-10">
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-teal-400/15 blur-3xl"
          aria-hidden
        />
        <div className="relative">
          <p className="text-xs font-medium uppercase tracking-wider text-teal-800/80">Overview</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Dashboard</h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600">
            SAR figures where relevant; detailed timestamps use{" "}
            <span className="font-medium text-slate-700">Asia/Riyadh</span>.
            {canOrders ? (
              <>
                {" "}
                <span className="tabular-nums font-medium text-slate-800">{openPipeline}</span> open orders in the
                pipeline.
              </>
            ) : null}
          </p>

          {quickLinks.length > 0 ? (
            <nav aria-label="Shortcuts" className="mt-6 flex flex-wrap gap-2">
              {quickLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group inline-flex items-center gap-2 rounded-full border border-slate-200/90 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur-sm transition hover:border-teal-300 hover:bg-teal-50/90 hover:text-teal-950"
                >
                  <span>{item.label}</span>
                  <span className="text-xs font-normal text-slate-400 group-hover:text-teal-700/80">{item.desc}</span>
                </Link>
              ))}
            </nav>
          ) : null}
        </div>
      </section>

      {/* Low stock */}
      {canAlerts && alerts.length > 0 ? (
        <section className="overflow-hidden rounded-2xl border border-amber-200/90 bg-gradient-to-br from-amber-50 to-orange-50/40 shadow-sm ring-1 ring-amber-900/5">
          <div className="flex flex-wrap items-start gap-4 border-b border-amber-200/60 bg-amber-100/30 px-5 py-4 sm:px-6">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm"
              aria-hidden
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-semibold text-amber-950">Low stock</h2>
              <p className="mt-0.5 text-sm text-amber-900/85">
                {alerts.length} SKU{alerts.length === 1 ? "" : "s"} at or below threshold
              </p>
            </div>
            <Link
              href="/alerts"
              className="shrink-0 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-700"
            >
              Review
            </Link>
          </div>
          <ul className="grid gap-2 px-5 py-4 sm:grid-cols-2 sm:px-6 sm:py-5">
            {alerts.slice(0, 6).map((a) => (
              <li
                key={a.item.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-amber-100/80 bg-white/60 px-3 py-2.5 text-sm backdrop-blur-sm"
              >
                <span className="font-semibold text-slate-900">{a.item.sku}</span>
                <span className="text-right text-xs text-amber-950/90">
                  <span className="tabular-nums">{a.qtyOnHand}</span>
                  <span className="text-amber-800/80"> / floor </span>
                  <span className="tabular-nums font-medium">{a.item.lowStockAlertBelow}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Order stages */}
      {canOrders ? (
        <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm ring-1 ring-slate-900/5 sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Orders by stage</h2>
              <p className="mt-1 text-sm text-slate-500">Counts across the whole pipeline</p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {chips.map(({ key, count }) => (
              <StatCard key={key} statusKey={key} title={pretty(key)} count={count} />
            ))}
          </div>
          <p className="mt-5 border-t border-slate-100 pt-4 text-sm text-slate-600">
            {canCatalog ? (
              <>
                Configure low-stock floors in{" "}
                <Link href="/catalog" className="font-medium text-teal-700 underline-offset-2 hover:underline">
                  Catalogue
                </Link>
                .
              </>
            ) : (
              "Low-stock thresholds are edited in the catalogue when you have access."
            )}
          </p>
        </section>
      ) : null}

      {/* Recent orders */}
      {canOrders ? (
        <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-900/5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/80 px-5 py-4 sm:px-6">
            <h2 className="text-lg font-semibold text-slate-900">Recent open orders</h2>
            <Link
              href="/orders"
              className="text-sm font-semibold text-teal-800 transition hover:text-teal-950 hover:underline"
            >
              View all →
            </Link>
          </div>
          <ul className="divide-y divide-slate-100 text-sm">
            {backlog.length === 0 ? (
              <li className="px-5 py-12 text-center sm:px-6">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                    />
                  </svg>
                </div>
                <p className="mt-4 text-slate-600">Nothing in the pipeline yet.</p>
                <HideUnless permission={PERM.ordersPoCreate}>
                  <Link
                    href="/orders/new"
                    className="mt-3 inline-flex rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-800"
                  >
                    Create first PO
                  </Link>
                </HideUnless>
              </li>
            ) : (
              backlog.map((order) => (
                <li key={order.id}>
                  <Link
                    href={`/orders/${order.id}`}
                    className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 transition hover:bg-teal-50/50 sm:px-6"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900">{order.customerName}</p>
                      {order.customerPoRef ? (
                        <p className="mt-0.5 truncate text-xs text-slate-500">PO ref {order.customerPoRef}</p>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className={statusPillClass(order.status)}>{pretty(order.status)}</span>
                      <time className="hidden text-xs text-slate-500 sm:block tabular-nums">
                        {formatDateTimeKsa(order.createdAt)}
                      </time>
                      <span className="text-slate-300" aria-hidden>
                        →
                      </span>
                    </div>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function pretty(status: string) {
  return status.replaceAll("_", " ").toLowerCase();
}

function statusAccentClass(statusKey: string): string {
  switch (statusKey) {
    case SALES_ORDER_STATUS.DRAFT:
      return "border-t-4 border-t-teal-500";
    case SALES_ORDER_STATUS.SUBMITTED:
      return "border-t-4 border-t-slate-400";
    case SALES_ORDER_STATUS.AWAITING_PROCUREMENT:
      return "border-t-4 border-t-amber-500";
    case SALES_ORDER_STATUS.RESERVED:
      return "border-t-4 border-t-sky-500";
    case SALES_ORDER_STATUS.PICK_READY:
      return "border-t-4 border-t-indigo-500";
    case SALES_ORDER_STATUS.FULFILLED:
      return "border-t-4 border-t-violet-500";
    case SALES_ORDER_STATUS.SHIPPED:
      return "border-t-4 border-t-emerald-500";
    case SALES_ORDER_STATUS.CANCELLED:
      return "border-t-4 border-t-slate-400";
    default:
      return "border-t-4 border-t-slate-300";
  }
}

function statusPillClass(status: string): string {
  const base =
    "rounded-full px-2.5 py-1 text-xs font-medium capitalize ring-1 ring-inset tabular-nums ";
  switch (status) {
    case SALES_ORDER_STATUS.DRAFT:
      return base + "bg-slate-50 text-slate-700 ring-slate-200/80";
    case SALES_ORDER_STATUS.AWAITING_PROCUREMENT:
      return base + "bg-amber-50 text-amber-950 ring-amber-200/80";
    case SALES_ORDER_STATUS.RESERVED:
    case SALES_ORDER_STATUS.PICK_READY:
      return base + "bg-sky-50 text-sky-950 ring-sky-200/80";
    case SALES_ORDER_STATUS.FULFILLED:
      return base + "bg-violet-50 text-violet-950 ring-violet-200/80";
    case SALES_ORDER_STATUS.SHIPPED:
      return base + "bg-emerald-50 text-emerald-950 ring-emerald-200/80";
    case SALES_ORDER_STATUS.CANCELLED:
      return base + "bg-slate-100 text-slate-600 ring-slate-200/80";
    default:
      return base + "bg-white text-slate-700 ring-slate-200/80";
  }
}

function StatCard({ statusKey, title, count }: { statusKey: string; title: string; count: number }) {
  const accent = statusAccentClass(statusKey);
  return (
    <article
      className={`group relative overflow-hidden rounded-xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/80 px-4 py-3.5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md ${accent}`}
    >
      <div className="text-xs font-medium capitalize text-slate-500">{title}</div>
      <div className="mt-1.5 text-2xl font-semibold tabular-nums tracking-tight text-slate-900">{count}</div>
    </article>
  );
}
