import Link from "next/link";

import { getLowStockAlerts } from "@/lib/alerts/lowStock";

export default async function AlertsPage() {
  const rows = await getLowStockAlerts();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">Low-stock</h1>
        <p className="mt-2 max-w-xl text-sm text-slate-600">
          Components below the catalogue alert floor. Adjust thresholds under Catalogue.
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-sm text-slate-600">
          All clear — no SKUs below their alert floor.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-medium text-slate-600">
              <tr>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3 text-right tabular-nums">On-hand</th>
                <th className="px-4 py-3 text-right tabular-nums">Alert below</th>
                <th className="px-4 py-3">&nbsp;</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ item, qtyOnHand }) => (
                <tr key={item.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-semibold">{item.sku}</td>
                  <td className="px-4 py-3 text-xs">{item.name}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{qtyOnHand}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{item.lowStockAlertBelow}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href="/catalog" className="text-sm text-teal-800 underline underline-offset-2">
                      Catalogue
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
