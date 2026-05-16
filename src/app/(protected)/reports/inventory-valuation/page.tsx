import Link from "next/link";

import { formatSarFromHalalas } from "@/lib/format/money";
import { summarizeInventoryValuation } from "@/lib/reports/accountingQueries";

export default async function InventoryValuationPage() {
  const { lines, totalCents, missingCosts } = await summarizeInventoryValuation();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Operational · Assets
          </p>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Inventory valuation (SAR)</h1>
          <p className="text-sm text-zinc-600">
            Component rows only kits roll up through exploded demand. Clearing a standard halala rate treats that
            SKU&apos;s on-hand balance as non-monetized for this schedule.
          </p>
        </div>
        <Link
          href="/reports"
          className="rounded-lg border border-zinc-400 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em]"
        >
          All reports
        </Link>
      </div>

      {missingCosts.length > 0 ? (
        <div className="rounded-xl border border-amber-500/70 bg-amber-50 px-4 py-3 text-[11px] text-amber-950">
          {missingCosts.length} component SKU
          {missingCosts.length === 1 ? "" : "s"} have positive on-hand qty but unset standard catalogue cost —
          valuations default to SAR 0.00 until the catalogue is updated.
        </div>
      ) : null}

      <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-teal-200/80 bg-gradient-to-r from-teal-50 via-white to-slate-50 px-5 py-4 text-slate-900 shadow-sm">
        <span className="text-sm font-semibold text-slate-700">Extended inventory valuation</span>
        <span className="tabular-nums text-3xl font-semibold">{formatSarFromHalalas(totalCents)}</span>
      </section>

      <section className="overflow-x-auto rounded-xl border border-zinc-300 bg-white shadow-sm">
        <table className="min-w-[34rem] w-full text-sm">
          <thead className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">
            <tr>
              <th className="px-4 py-3 text-left">SKU</th>
              <th className="px-4 py-3 text-left">Component</th>
              <th className="px-4 py-3 tabular-nums text-right">Qty</th>
              <th className="px-4 py-3 tabular-nums text-right">Std unit</th>
              <th className="px-4 py-3 tabular-nums text-right">Extension</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line) => (
              <tr key={line.sku} className="border-t border-zinc-200">
                <td className="px-4 py-2 font-mono text-xs">{line.sku}</td>
                <td className="px-4 py-2">{line.name}</td>
                <td className="px-4 py-2 tabular-nums text-right">{line.qtyOnHand}</td>
                <td className="px-4 py-2 tabular-nums text-right">
                  {line.standardCostCents == null ? (
                    <span className="text-xs italic text-amber-700">Unset</span>
                  ) : (
                    formatSarFromHalalas(line.standardCostCents)
                  )}
                </td>
                <td className="px-4 py-2 tabular-nums font-semibold text-right">
                  {formatSarFromHalalas(line.extendedInventoryCents)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
