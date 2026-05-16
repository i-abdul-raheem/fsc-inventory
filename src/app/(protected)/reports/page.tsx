import Link from "next/link";

const cards = [
  {
    title: "Profit & loss",
    href: "/reports/profit-loss",
    summary: "Revenue vs standard COGS (on ship). SAR, Riyadh time.",
  },
  {
    title: "Balance sheet",
    href: "/reports/balance-sheet",
    summary: "Inventory at standard vs surplus — illustrative.",
  },
  {
    title: "Inventory valuation",
    href: "/reports/inventory-valuation",
    summary: "On-hand × standard cost (halalas).",
  },
  {
    title: "Sales register",
    href: "/reports/sales-register",
    summary: "Shipped orders by customer.",
  },
  {
    title: "Trial balance",
    href: "/reports/trial-balance",
    summary: "Account-level view.",
  },
  {
    title: "Cash flow",
    href: "/reports/cash-flow",
    summary: "Placeholder until banking feeds exist.",
  },
] as const;

export default function ReportsHubPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">Reports</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          SAR figures (halalas per riyal). Revenue and COGS post on shipment from line prices and standard costs. VAT and
          full GL are outside this IMS.
        </p>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2">
        {cards.map((card) => (
          <li key={card.href}>
            <Link
              href={card.href}
              className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 text-sm shadow-sm transition hover:border-slate-300"
            >
              <span className="text-base font-semibold tracking-tight text-slate-900">
                {card.title}
              </span>
              <span className="mt-3 text-sm leading-snug text-slate-600">
                {card.summary}
              </span>
              <span className="mt-4 text-sm font-medium text-teal-800">
                Open →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
