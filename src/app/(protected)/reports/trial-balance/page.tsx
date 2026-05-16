import Link from "next/link";

export default function TrialBalancePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Coming soon</p>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Trial balance workbook</h1>
          <p className="text-sm text-zinc-600">
            IMS posts operational SAR totals through automated sale vouchers ahead of an auditor-ready general ledger.
            Planned next steps: chart-of-accounts, debit/credit pairs, reversing entries, suspense accounts, VAT bridging,
            Phase 2 e-invoice QR metadata, and month-end discipline for Saudi reviews.
          </p>
        </div>
        <Link
          href="/reports"
          className="rounded-lg border border-zinc-400 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em]"
        >
          All reports
        </Link>
      </div>

      <div className="rounded-xl border border-dashed border-zinc-400 bg-white p-5 text-xs text-zinc-600 shadow-sm">
        <p className="font-semibold uppercase tracking-[0.2em] text-zinc-500">Suggested roadmap</p>
        <ol className="mt-3 list-decimal space-y-2 ps-6">
          <li>Formalize nominal codes (cash, inventory, COGS, trade debtors, accrued freight, suspense).</li>
          <li>Mirror every IMS workflow event into balanced journal stubs with audit trails.</li>
          <li>Capture VAT (15%), withholding, and Phase 2 e-invoice QR/metadata hand-offs for ZATCA.</li>
          <li>Offer CSV / GL export keyed to your ERP or ZATCA clearing partner.</li>
        </ol>
      </div>
    </div>
  );
}
