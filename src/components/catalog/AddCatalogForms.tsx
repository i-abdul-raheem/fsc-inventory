import {
  createCatalogComponent,
  createCatalogKit,
} from "@/actions/catalogItems";

import { getPrincipal } from "@/lib/auth/rbac";
import { PERM, type PermissionCode } from "@/lib/domain/permissions";
import { btnPrimary, ctlInput, ctlLabel } from "@/components/catalog/catalogFormStyles";

export type CatalogComponentLite = {
  id: string;
  sku: string;
  name: string;
};

const BOM_ROWS = 12;

export async function AddCatalogForms(props: { components: CatalogComponentLite[] }) {
  const { components } = props;
  const principal = await getPrincipal();
  const can = (perm: PermissionCode) => Boolean(principal?.permissions.has(perm));
  const showComponent = can(PERM.catalogComponentCreate);
  const showKit = can(PERM.catalogKitCreate);

  if (!showComponent && !showKit) {
    return null;
  }

  return (
    <div className={`grid gap-6 ${showComponent && showKit ? "lg:grid-cols-2" : ""}`}>
      {showComponent ? (
        <section className="rounded-xl border border-zinc-300 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold tracking-tight">Add component</h2>
          <p className="mt-1 text-[11px] text-zinc-600">
            Stocking SKU with on-hand balance and optional alert / standard halala cost.
          </p>
          <form action={createCatalogComponent} className="mt-4 space-y-3">
            <label className={ctlLabel}>
              SKU *
              <input required name="sku" className={ctlInput} placeholder="e.g. COMP-NEW" autoComplete="off" />
            </label>
            <label className={ctlLabel}>
              Display name *
              <input required name="name" className={ctlInput} placeholder="Component title" />
            </label>
            <label className={ctlLabel}>
              Description
              <textarea name="description" rows={2} className={ctlInput} placeholder="Optional" />
            </label>
            <label className={ctlLabel}>
              Initial on-hand qty
              <input name="initialQtyOnHand" type="number" min={0} defaultValue={0} className={ctlInput} />
            </label>
            <label className={ctlLabel}>
              Low-stock floor (optional)
              <input name="lowStockAlertBelow" type="number" min={1} className={ctlInput} placeholder="blank = off" />
            </label>
            <label className={ctlLabel}>
              Std cost halalas (optional)
              <input name="standardCostCents" type="number" min={0} className={ctlInput} placeholder="blank = unknown" />
            </label>
            <button type="submit" className={btnPrimary}>
              Create component
            </button>
          </form>
        </section>
      ) : null}

      {showKit ? (
        <section className="rounded-xl border border-zinc-300 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold tracking-tight">Add kit</h2>
          {components.length === 0 ? (
            <div className="mt-3 rounded-lg border border-amber-700/60 bg-amber-50 px-3 py-2 text-[11px] text-amber-950">
              Create at least one component before defining a BOM-driven kit.
            </div>
          ) : (
            <>
              <p className="mt-1 text-[11px] text-zinc-600">
                Non-stocking BOM header — components only on lines (no nested kits).
              </p>
              <form action={createCatalogKit} className="mt-4 space-y-3">
                <label className={ctlLabel}>
                  Kit SKU *
                  <input required name="sku" className={ctlInput} placeholder="e.g. KIT-STANDARD" />
                </label>
                <label className={ctlLabel}>
                  Display name *
                  <input required name="name" className={ctlInput} placeholder="Sellable bundle label" />
                </label>
                <label className={ctlLabel}>
                  Description
                  <textarea name="description" rows={2} className={ctlInput} placeholder="Optional" />
                </label>
                <fieldset className="space-y-2">
                  <legend className="text-sm font-medium text-slate-700">
                    Bill of materials ({BOM_ROWS} rows)
                  </legend>
                  <table className="mt-2 w-full text-[13px]">
                    <thead>
                      <tr className="text-left text-xs font-medium text-slate-500">
                        <th className="py-2 pr-2">Component</th>
                        <th className="py-2">Qty / kit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: BOM_ROWS }).map((_, idx) => (
                        <tr key={idx} className="border-t border-slate-100">
                          <td className="py-2 pr-2">
                            <select
                              name={`componentItemId_${idx}`}
                              defaultValue=""
                              className={`${ctlInput} mt-0`}
                            >
                              <option value="">— empty —</option>
                              {components.map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.sku} — {c.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="py-2">
                            <input
                              name={`qtyPerKit_${idx}`}
                              type="number"
                              min={1}
                              className={`${ctlInput} mt-0`}
                              placeholder=""
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </fieldset>
                <button type="submit" className={btnPrimary}>
                  Create kit
                </button>
              </form>
            </>
          )}
        </section>
      ) : null}
    </div>
  );
}
