import Link from "next/link";
import { listItemsLite } from "@/lib/data/catalog";
import { listCustomersForSelect } from "@/lib/data/tradingPartners";
import Notice from "@/components/Notice";
import { createSalesOrder } from "@/actions/orders";
import { getPrincipal } from "@/lib/auth/rbac";
import { PERM } from "@/lib/domain/permissions";

const ROWS = 14;

export default async function NewOrderPage({
  searchParams,
}: {
  searchParams?: Promise<{ err?: string }>;
}) {
  const items = await listItemsLite();
  const qp = await searchParams;
  const principal = await getPrincipal();
  const showCustomerDirectory = Boolean(principal?.permissions.has(PERM.moduleCustomers));
  const customers = showCustomerDirectory ? await listCustomersForSelect() : [];

  const errHints: Record<string, string> = {
    missingCustomer: "Pick a saved customer or enter a customer / site name.",
    badCustomer: "That customer record is missing or inactive. Choose again or type the name manually.",
    noLines: "Add at least one catalog line.",
    badQty: "Quantity must be a positive integer.",
    badPrice:
      "Optional pricing must be a non-negative whole number (SAR halalas per unit — 100 halalas = 1 SAR).",
  };

  let msg = qp?.err ?? null;
  if (msg && errHints[msg]) msg = errHints[msg];

  return (
    <div className="space-y-8">
      <div>
        <Link href="/orders" className="text-sm text-slate-600 hover:text-slate-900">
          ← Back to orders
        </Link>
        <h1 className="mt-3 text-xl font-semibold tracking-tight text-slate-900">New order</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          You trade components from sellers to customers in Saudi Arabia. Add catalogue lines; optional unit
          price is in halalas (100 = 1 SAR). VAT is not calculated on this form.
        </p>
      </div>

      {msg ? <Notice message={msg} /> : null}

      <form
        action={createSalesOrder}
        className="flex flex-col gap-6 rounded-2xl border border-zinc-300 bg-white p-6 shadow-sm"
      >
        {customers.length > 0 ? (
          <label className="block text-sm font-medium text-slate-700">
            Saved customer (optional)
            <select
              name="customerId"
              defaultValue=""
              className="mt-2 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus-visible:border-teal-600 focus-visible:ring-1 focus-visible:ring-teal-600"
            >
              <option value="">— Type name manually below —</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.city ? ` · ${c.city}` : ""}
                  {c.tradingName ? ` (${c.tradingName})` : ""}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-slate-500">
              Links this PO to your{" "}
              <Link href="/customers" className="font-medium text-teal-800 underline">
                customer directory
              </Link>
              . Leave empty for a one-off label.
            </p>
          </label>
        ) : showCustomerDirectory ? (
          <p className="text-sm text-slate-600">
            No saved customers yet —{" "}
            <Link href="/customers/new" className="font-medium text-teal-800 underline">
              add one
            </Link>{" "}
            to attach future POs, or type the name manually below.
          </p>
        ) : null}

        <label className="block text-sm font-medium text-slate-700">
          Customer / site name *
          <input
            name="customerName"
            className="mt-2 block w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm outline-none focus-visible:border-teal-600 focus-visible:ring-1 focus-visible:ring-teal-600"
            placeholder="Who you are selling to (required if no saved customer is selected)"
          />
          <span className="mt-1 block text-xs text-slate-500">
            If you selected a saved customer, this field is ignored and the directory name is used.
          </span>
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Their PO reference (optional)
          <input
            name="customerPoRef"
            className="mt-2 block w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm"
            placeholder="Their PO number or contract ref"
          />
        </label>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-slate-700">Lines</legend>
          <table className="mt-4 w-full min-w-[32rem] text-left text-[13px]">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs font-medium text-slate-500">
                <th className="py-3 pr-2">SKU</th>
                <th className="py-3 pr-2">Qty</th>
                <th className="py-3">Unit price (halalas)</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(ROWS).keys()].map((idx) => (
                <tr key={idx} className="border-t border-slate-100 align-top">
                  <td className="py-4 pr-2">
                    <select
                      className="w-full max-w-xl rounded-lg border border-zinc-300 bg-transparent px-2 py-1 text-sm"
                      name={`itemId_${idx}`}
                      defaultValue=""
                      aria-label={`Line ${idx + 1} SKU`}
                    >
                      <option value="">— Empty row —</option>
                      {items.map((item) => (
                        <option key={item.id} value={item.id}>
                          [{item.kind}] {item.sku}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-4 pr-2">
                    <input
                      min={1}
                      className="w-28 rounded-lg border border-zinc-300 px-2 py-1 font-mono text-sm"
                      name={`qty_${idx}`}
                      type="number"
                      placeholder=""
                    />
                  </td>
                  <td className="py-4">
                    <input
                      min={0}
                      className="w-44 rounded-lg border border-zinc-300 px-2 py-1 font-mono text-sm"
                      name={`unitPrice_${idx}`}
                      type="number"
                      placeholder="halalas"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </fieldset>

        <button
          type="submit"
          className="self-start rounded-lg bg-teal-700 px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-teal-800"
        >
          Save draft
        </button>
      </form>
    </div>
  );
}
