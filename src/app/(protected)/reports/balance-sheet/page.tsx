import Link from "next/link";

import { formatSarFromHalalas } from "@/lib/format/money";
import {
  summarizeBalanceSheetSnapshot,
  summarizeInventoryValuation,
} from "@/lib/reports/accountingQueries";
import { toHtmlDateInputValue } from "@/lib/reports/calendarInputs";

export default async function BalanceSheetPage({
  searchParams,
}: {
  searchParams?: Promise<{ asOf?: string }>;
}) {
  const qp = await searchParams;
  const snapshot = await summarizeBalanceSheetSnapshot(qp?.asOf);
  const inventory = await summarizeInventoryValuation();
  const asOfDefault = toHtmlDateInputValue(snapshot.rangeEndInclusive);
  const tieGapCents = inventory.totalCents - snapshot.surplusCents;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Snapshot · managerial
          </p>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Condensed balance sheet (SAR)</h1>
          <p className="text-sm text-zinc-600">
            Kingdom-facing snapshot compares SAR inventory valued at standard halala rates with the IMS gross-surplus
            analogue. Cash, VAT, payables, bank guarantees, capitalization, depreciation, goodwill, prepaid balances,
            and bridging to audited financials stay outside IMS. Supplier receipts booked only against stock widen the
            illustrative gap by design.
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
          As of local date
          <input
            name="asOf"
            type="date"
            defaultValue={asOfDefault}
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

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-xl border border-zinc-300 bg-white p-5 shadow-sm">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Assets snapshot</h2>
          <dl className="mt-4 space-y-4 text-sm">
            <div>
              <dt className="font-medium text-slate-900">Inventory (components)</dt>
              <dd className="mt-2 text-xs text-zinc-600">
                Derived from on-hand qty multiplied by SAR catalogue standard cost (halalas per unit).
              </dd>
              <dd className="mt-2 tabular-nums text-2xl font-semibold">{formatSarFromHalalas(inventory.totalCents)}</dd>
              {inventory.missingCosts.length > 0 ? (
                <dd className="mt-2 text-[11px] text-amber-800">
                  {inventory.missingCosts.length} SKU{inventory.missingCosts.length === 1 ? "" : "s"} use zero
                  cost because catalogue standard amounts are unset.
                </dd>
              ) : null}
            </div>
          </dl>
        </article>

        <article className="rounded-xl border border-zinc-300 bg-white p-5 shadow-sm">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Equity analogue
          </h2>
          <dl className="mt-4 space-y-4 text-sm">
            <div>
              <dt className="font-medium text-slate-900">
                IMS accumulated gross surplus (lifetime through cut-off)
              </dt>
              <dd className="mt-2 text-xs text-zinc-600">
                {snapshot.postingsCount} shipped posting{snapshot.postingsCount === 1 ? "" : "s"} aggregated.
              </dd>
              <dd className="mt-2 tabular-nums text-2xl font-semibold">
                {formatSarFromHalalas(snapshot.surplusCents)}
              </dd>
            </div>
          </dl>
          <div className="mt-6 rounded-xl border border-amber-400/70 bg-amber-50 px-4 py-3 text-[11px] text-amber-950">
            <div className="font-semibold uppercase tracking-[0.2em]">Illustrative gap</div>
            <div className="mt-2">
              Difference between inventory valuation and IMS surplus totals{" "}
              <span className="tabular-nums font-bold">{formatSarFromHalalas(tieGapCents)}</span>{" "}
              highlights what still lives outside the model (supplier invoices, treasury, capitalization,
              allowances, rework, spoilage journals, payroll, capex schedules, goodwill, etc.).
            </div>
          </div>
        </article>
      </section>

      <p className="text-xs italic text-zinc-500">
        Filters use local calendar dates detail timestamps display in Asia/Riyadh reconcile cut-offs with Finance, ZATCA,
        or your ERP gateway before submission.
      </p>
    </div>
  );
}
