import Link from "next/link";

import { formatDateTimeKsa } from "@/lib/format/datetime";
import { formatSarFromHalalas } from "@/lib/format/money";
import {
  parseLocalCalendarRange,
  summarizeProfitLoss,
} from "@/lib/reports/accountingQueries";
import { toHtmlDateInputValue } from "@/lib/reports/calendarInputs";

export default async function ProfitLossPage({
  searchParams,
}: {
  searchParams?: Promise<{ from?: string; to?: string }>;
}) {
  const qp = await searchParams;
  const range = parseLocalCalendarRange(qp?.from, qp?.to);
  const pl = await summarizeProfitLoss(range);

  const fromDefault = toHtmlDateInputValue(range.rangeStartLocal);
  const toDefault = toHtmlDateInputValue(range.rangeEndLocalInclusive);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Statement · Income
          </p>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Profit & loss</h1>
          <p className="text-sm text-zinc-600">
            Managerial SAR P&amp;L. Recognition dates follow shipments (Asia/Riyadh). Missing halala unit pricing on a kit
            line yields zero booked revenue; standard COGS still posts from fulfilled component reservations.
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
          className="rounded-lg bg-teal-700 px-4 py-2 font-semibold uppercase tracking-wide text-white"
        >
          Refresh
        </button>
      </form>

      <section className="overflow-x-auto rounded-xl border border-zinc-300 bg-white shadow-sm">
        <table className="w-full border-collapse text-sm">
          <tbody>
            <tr className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-[0.2em]">
              <th scope="col" className="px-4 py-3 text-left font-semibold">
                Line
              </th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">
                Amount
              </th>
            </tr>
            <tr className="border-b border-zinc-200">
              <td className="px-4 py-3">Revenue (shipped lines with unit pricing)</td>
              <td className="px-4 py-3 text-right tabular-nums font-semibold">
                {formatSarFromHalalas(pl.revenueCents)}
              </td>
            </tr>
            <tr className="border-b border-zinc-200">
              <td className="px-4 py-3 text-zinc-600">Cost of goods sold</td>
              <td className="px-4 py-3 text-right tabular-nums font-semibold text-red-900">
                ({formatSarFromHalalas(pl.costOfGoodsCents)})
              </td>
            </tr>
            <tr className="bg-emerald-50 text-emerald-950">
              <td className="px-4 py-3 font-semibold">Gross profit</td>
              <td className="px-4 py-3 text-right tabular-nums text-lg font-bold">
                {formatSarFromHalalas(pl.grossProfitCents)}
              </td>
            </tr>
          </tbody>
        </table>
        <div className="border-t border-zinc-200 px-4 py-3 text-xs text-zinc-600">
          Operating expenditure, depreciation, payroll, withholding, Kingdom VAT (15%), ZATCA compliance, freight,
          purchases, rounding, FX, and capex schedules are intentionally absent — IMS stays operational-first.
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Posting detail</h2>
        {pl.postings.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-600">
            No postings in window (shipments outside the filters or backlog still awaiting warehouse events).
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-300 bg-white text-sm shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Recognized</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3 tabular-nums">Revenue</th>
                  <th className="px-4 py-3 tabular-nums">COGS</th>
                  <th className="px-4 py-3 tabular-nums">Gross</th>
                  <th className="px-4 py-3">Memo</th>
                </tr>
              </thead>
              <tbody>
                {pl.postings.map((row) => {
                  const gross = row.revenueRecognizedCents - row.costOfGoodsRecognizedCents;
                  return (
                    <tr key={row.id} className="border-t border-zinc-100">
                      <td className="px-4 py-2 text-xs">
                        {row.recognizedAt ? formatDateTimeKsa(row.recognizedAt) : ""}
                      </td>
                      <td className="px-4 py-2">{row.salesOrder.customerName}</td>
                      <td className="px-4 py-2 tabular-nums">
                        {formatSarFromHalalas(row.revenueRecognizedCents)}
                      </td>
                      <td className="px-4 py-2 tabular-nums">
                        ({formatSarFromHalalas(row.costOfGoodsRecognizedCents)})
                      </td>
                      <td className="px-4 py-2 tabular-nums font-semibold">
                        {formatSarFromHalalas(gross)}
                      </td>
                      <td className="px-4 py-2 text-xs text-zinc-600">
                        {row.memo ?? ""}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
