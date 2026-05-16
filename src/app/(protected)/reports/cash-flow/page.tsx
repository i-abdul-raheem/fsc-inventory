import Link from "next/link";

export default function CashFlowPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Future module</p>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Cash flow narratives</h1>
          <p className="text-sm text-zinc-600">
            Procurement keeps an eye on goods movement, not Saudi banking or SADAD settlement. When treasury feeds,
            supplier AP, payroll, capex milestones, and liquidity sweeps synchronize from your Finance / ERP stack,
            cash statements can align with the SAR profitability spine modeled here.
          </p>
        </div>
        <Link
          href="/reports"
          className="rounded-lg border border-zinc-400 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em]"
        >
          All reports
        </Link>
      </div>

      <div className="rounded-xl border border-zinc-300 bg-emerald-50 p-5 text-[11px] text-emerald-950 shadow-sm">
        <p className="font-semibold uppercase tracking-[0.2em]">What you can rely on meanwhile</p>
        <ul className="mt-3 list-disc space-y-2 ps-5">
          <li>Operational cash timing hints still surface through procurement shortages and SLA breaches.</li>
          <li>Profitability statements above remain helpful for EBITDA-style reviews.</li>
        </ul>
      </div>
    </div>
  );
}
