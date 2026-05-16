/** Shared Tailwind class strings for customer & seller forms (keep in sync across pages). */
export const tradingForm = {
  field:
    "mt-1.5 block w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20",
  label: "text-sm font-medium text-slate-800",
  sectionLegend: "text-[11px] font-semibold uppercase tracking-wider text-teal-800/85",
  backLink:
    "inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition hover:text-slate-900",
  shell: "mx-auto max-w-2xl space-y-8 pb-4",
  pageHeader: "border-b border-slate-200/80 pb-8",
  formCard:
    "overflow-hidden rounded-2xl border border-slate-200/90 bg-[color:var(--surface)] shadow-sm ring-1 ring-slate-900/5",
  formIntro: "border-b border-slate-100 bg-gradient-to-br from-white to-slate-50/90 px-6 py-5 sm:px-8",
  formBody: "space-y-10 px-6 py-8 sm:px-8",
  formFooter:
    "flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/60 px-6 py-5 sm:flex-row sm:items-center sm:justify-end sm:px-8",
  btnPrimary:
    "inline-flex justify-center rounded-xl bg-teal-700 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700",
  btnSecondary:
    "inline-flex justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-center text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50",
} as const;
