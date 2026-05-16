import Link from "next/link";

import { formatDateTimeKsa } from "@/lib/format/datetime";
import { formatSarFromHalalas } from "@/lib/format/money";
import {
  parseLocalCalendarRange,
  summarizeSalesRegister,
} from "@/lib/reports/accountingQueries";
import { toHtmlDateInputValue } from "@/lib/reports/calendarInputs";

export default async function SalesRegisterPage({
  searchParams,
}: {
  searchParams?: Promise<{ from?: string; to?: string }>;
}) {
  const qp = await searchParams;
  const range = parseLocalCalendarRange(qp?.from, qp?.to);
  const reg = await summarizeSalesRegister(range);

  const fromDefault = toHtmlDateInputValue(range.rangeStartLocal);
  const toDefault = toHtmlDateInputValue(range.rangeEndLocalInclusive);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Register · outbound
          </p>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Sales register</h1>
          <p className="text-sm text-zinc-600">
            SAR shipment history with Asia/Riyadh timestamps for rebates, audits, or hand-off toward ZATCA-ready ERP journals.
          </p>
        </div>
        <Link
          href="/reports"
          className="rounded-lg border border-zinc-400 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em]"
        >
          All reports
        </Link>
      </div>

      <form method="get" className="flex flex-wrap items-end gap-3 rounded-xl border border-dashed border-zinc-400 p-4 text-xs">
        <label className="flex flex-col gap-1 font-semibold text-zinc-600">
          From
          <input
            name="from"
            type="date"
            defaultValue={fromDefault}
            className="rounded-lg border border-zinc-300 px-3 py-2 font-medium text-slate-900"
          />
        </label>
        <label className="flex flex-col gap-1 font-semibold text-zinc-600">
          To
          <input
            name="to"
            type="date"
            defaultValue={toDefault}
            className="rounded-lg border border-zinc-300 px-3 py-2 font-medium text-slate-900"
          />
        </label>
        <button
          type="submit"
          className="rounded-lg bg-slate-700 px-4 py-2 font-semibold text-white shadow-sm hover:bg-slate-800"
        >
          Refresh
        </button>
      </form>

      <section className="rounded-xl border border-slate-200 bg-slate-50/90 px-5 py-4 text-slate-900 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs font-medium text-slate-600">Totals (register)</div>
            <div className="mt-2 text-xs text-slate-500">
              {reg.orders.length} shipped order{reg.orders.length === 1 ? "" : "s"}
            </div>
          </div>
          <div className="flex flex-wrap gap-6 tabular-nums text-sm">
            <div>
              <div className="text-[11px] font-medium text-slate-600">Booked revenue</div>
              <div className="text-2xl font-semibold text-slate-900">{formatSarFromHalalas(reg.revenueCents)}</div>
            </div>
            <div>
              <div className="text-[11px] font-medium text-slate-600">Matched COGS</div>
              <div className="text-2xl font-semibold text-amber-800">
                ({formatSarFromHalalas(reg.costOfGoodsCents)})
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Customers</h2>
        {reg.byCustomer.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-600">No shipments landed in chosen window.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {reg.byCustomer.map((row) => (
              <li
                key={row.customerName}
                className="rounded-xl border border-zinc-300 bg-white p-4 text-sm shadow-sm"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <div className="font-semibold text-slate-900">{row.customerName}</div>
                  <div className="tabular-nums text-lg font-semibold">{formatSarFromHalalas(row.revenueCents)}</div>
                </div>
                <ul className="mt-3 space-y-1 text-xs text-zinc-600">
                  {row.orders.map((order) => (
                    <li key={order.id} className="flex justify-between gap-3">
                      <span>
                        {order.shippedAt ? formatDateTimeKsa(order.shippedAt) : ""} · {order.customerPoRef ?? "No external PO"}
                      </span>
                      <span className="tabular-nums font-medium text-slate-900">
                        {formatSarFromHalalas(order.salePosting?.revenueRecognizedCents ?? 0)}
                      </span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
