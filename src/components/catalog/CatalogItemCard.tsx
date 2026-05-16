import {
  updateCatalogItemCore,
  updateKitBillOfMaterials,
  setComponentOnHandFromCatalog,
} from "@/actions/catalogItems";
import { updateLowStockAlertBelow } from "@/actions/catalogAlerts";
import { updateStandardCostCents } from "@/actions/catalogCosts";
import type { CatalogComponentLite } from "@/components/catalog/AddCatalogForms";
import { btnPrimary, ctlInput, ctlLabel } from "@/components/catalog/catalogFormStyles";
import { KSA } from "@/lib/region/constants";
import { ITEM_KIND } from "@/lib/domain/status";
import { getPrincipal } from "@/lib/auth/rbac";
import { PERM, type PermissionCode } from "@/lib/domain/permissions";

const BOM_EDIT_ROWS = 14;

export type CatalogItemCardModel = {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  kind: string;
  active: boolean;
  lowStockAlertBelow: number | null;
  standardCostCents: number | null;
  stock: { qtyOnHand: number } | null;
  bomAsKit: {
    id: string;
    qtyPerKit: number;
    component: { id: string; sku: string; name: string };
  }[];
};

export async function CatalogItemCard(props: {
  item: CatalogItemCardModel;
  componentOptions: CatalogComponentLite[];
  orderLineCount: number;
}) {
  const { item, componentOptions, orderLineCount } = props;
  const principal = await getPrincipal();
  const can = (perm: PermissionCode) => Boolean(principal?.permissions.has(perm));
  const skuLocked = orderLineCount > 0;

  const bomSorted = [...item.bomAsKit].sort((a, b) =>
    a.component.sku.localeCompare(b.component.sku),
  );
  type BomRow = (typeof bomSorted)[number];
  const bomRows: (BomRow | null)[] = [...bomSorted];
  while (bomRows.length < BOM_EDIT_ROWS) {
    bomRows.push(null);
  }

  return (
    <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-800">
            <span>{item.kind === ITEM_KIND.KIT ? "Kit" : "Component"}</span>
            {!item.active ? (
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-normal text-slate-600">
                Inactive
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {orderLineCount} order line{orderLineCount === 1 ? "" : "s"} · {skuLocked ? "SKU locked" : "SKU editable"}
          </p>
        </div>
        {item.stock ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-800">
            {item.stock.qtyOnHand.toLocaleString(KSA.displayLocale)} on hand
          </div>
        ) : (
          <div className="text-xs text-slate-500">Kit (no stock row)</div>
        )}
      </div>

      <section className="mt-4">
        <div className="text-sm font-medium text-slate-700">Details</div>
        {can(PERM.catalogItemEditCore) ? (
          <form action={updateCatalogItemCore} className="mt-3 flex flex-wrap items-end gap-4">
            <input type="hidden" name="itemId" value={item.id} />
            <label className={ctlLabel}>
              SKU
              <input
                name="sku"
                required
                disabled={skuLocked}
                title={skuLocked ? "Cannot change SKU after catalogue appears on PO lines." : undefined}
                defaultValue={item.sku}
                className={ctlInput + (skuLocked ? " opacity-70" : "")}
              />
            </label>
            <label className={ctlLabel + " min-w-[14rem] flex-1"}>
              Name
              <input name="name" required defaultValue={item.name} className={ctlInput} />
            </label>
            <label className={ctlLabel + " flex min-w-full flex-[1_1_100%] flex-col sm:min-w-[20rem]"}>
              Description
              <textarea name="description" rows={2} defaultValue={item.description ?? ""} className={ctlInput} />
            </label>
            <label className="flex items-center gap-2 pb-2 text-sm text-slate-600">
              <input type="checkbox" name="active" value="1" defaultChecked={item.active} />
              Active on new orders
            </label>
            <button type="submit" className={btnPrimary}>
              Save details
            </button>
          </form>
        ) : (
          <div className="mt-3 space-y-2 text-sm text-slate-700">
            <div>
              <span className="text-slate-500">SKU</span> · <span className="font-medium">{item.sku}</span>
            </div>
            <div>
              <span className="text-slate-500">Name</span> · <span>{item.name}</span>
            </div>
            {item.description ? (
              <p className="text-slate-600">{item.description}</p>
            ) : null}
            <p className="text-xs text-slate-500">{item.active ? "Active" : "Inactive"}</p>
          </div>
        )}
      </section>

      {item.kind === ITEM_KIND.COMPONENT ? (
        <div className="mt-4 space-y-4 border-t border-slate-100 pt-4">
          {can(PERM.catalogItemStockQty) ? (
            <section>
              <div className="text-sm font-medium text-slate-700">On-hand quantity</div>
              <p className="mt-1 text-xs text-slate-500">
                Sets balance here; use Inventory for receipts and adjustments.
              </p>
              <form action={setComponentOnHandFromCatalog} className="mt-2 flex flex-wrap items-end gap-4">
                <input type="hidden" name="itemId" value={item.id} />
                <label className={ctlLabel}>
                  Qty on hand
                  <input
                    name="qtyOnHand"
                    type="number"
                    min={0}
                    required
                    defaultValue={item.stock?.qtyOnHand ?? 0}
                    className={ctlInput}
                  />
                </label>
                <button type="submit" className={btnPrimary}>
                  Update stock qty
                </button>
              </form>
            </section>
          ) : (
            item.stock !== null ? (
              <p className="text-sm text-slate-700">
                <span className="text-slate-500">On hand</span> ·{" "}
                <span className="tabular-nums font-medium">{item.stock.qtyOnHand.toLocaleString(KSA.displayLocale)}</span>
              </p>
            ) : null
          )}

          {can(PERM.catalogItemAlertThreshold) ? (
            <section>
              <div className="text-sm font-medium text-slate-700">Low-stock alert</div>
              <form action={updateLowStockAlertBelow} className="mt-3 flex flex-wrap items-end gap-4">
                <input type="hidden" name="itemId" value={item.id} />
                <label className={ctlLabel}>
                  Alert whenever qty falls below…
                  <input
                    defaultValue={item.lowStockAlertBelow ?? ""}
                    name="below"
                    type="number"
                    placeholder="leave blank"
                    min={1}
                    className={ctlInput}
                  />
                </label>
                <button type="submit" className={btnPrimary}>
                  Save threshold
                </button>
                <span className="max-w-xl text-xs text-slate-500">
                  Alerts when on-hand is below this level. Leave blank to turn off.
                </span>
              </form>
            </section>
          ) : item.lowStockAlertBelow != null ? (
            <p className="text-sm text-slate-700">
              <span className="text-slate-500">Alert below</span> ·{" "}
              <span className="tabular-nums">{item.lowStockAlertBelow}</span>
            </p>
          ) : null}

          {can(PERM.catalogItemStdCost) ? (
            <section className="rounded-lg border border-slate-200 bg-slate-50/80 p-4">
              <div className="text-sm font-medium text-slate-700">Standard cost</div>
              <form action={updateStandardCostCents} className="mt-3 flex flex-wrap items-end gap-4">
                <input type="hidden" name="itemId" value={item.id} />
                <label className={ctlLabel}>
                  Std cost (halalas, optional)
                  <input
                    defaultValue={item.standardCostCents ?? ""}
                    name="costCents"
                    type="number"
                    placeholder="clear for unknown"
                    min={0}
                    className={ctlInput}
                  />
                </label>
                <button type="submit" className={btnPrimary}>
                  Save standard cost
                </button>
              </form>
            </section>
          ) : item.standardCostCents != null ? (
            <p className="text-sm text-slate-700">
              <span className="text-slate-500">Standard cost</span> ·{" "}
              <span className="tabular-nums">{item.standardCostCents}</span> halalas
            </p>
          ) : null}
        </div>
      ) : null}

      {item.kind === ITEM_KIND.KIT ? (
        <section className="mt-4 border-t border-slate-100 pt-4">
          <div className="text-sm font-medium text-slate-700">Bill of materials</div>
          <p className="mt-1 text-xs text-slate-500">
            {can(PERM.catalogItemKitBom)
              ? "Saving replaces all lines. Open orders pick up the BOM used when allocated."
              : "Current components on this kit."}
          </p>
          {can(PERM.catalogItemKitBom) ? (
            <form action={updateKitBillOfMaterials} className="mt-3">
              <input type="hidden" name="kitItemId" value={item.id} />
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="text-left text-xs font-medium text-slate-500">
                    <th className="pb-2 pr-2">Component</th>
                    <th className="pb-2">Qty / kit</th>
                  </tr>
                </thead>
                <tbody>
                  {bomRows.slice(0, BOM_EDIT_ROWS).map((row, idx) => (
                    <tr key={idx} className="border-t border-slate-100">
                      <td className="py-2 pr-2">
                        <select
                          name={`componentItemId_${idx}`}
                          defaultValue={row?.component.id ?? ""}
                          className={ctlInput + " mt-0"}
                        >
                          <option value="">— empty —</option>
                          {componentOptions.map((c) => (
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
                          defaultValue={row?.qtyPerKit ?? ""}
                          className={ctlInput + " mt-0"}
                          placeholder=""
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button type="submit" className={`${btnPrimary} mt-4`}>
                Save BOM
              </button>
            </form>
          ) : bomSorted.length > 0 ? (
            <table className="mt-3 w-full text-[13px]">
              <thead>
                <tr className="text-left text-xs font-medium text-slate-500">
                  <th className="pb-2 pr-2">Component</th>
                  <th className="pb-2">Qty / kit</th>
                </tr>
              </thead>
              <tbody>
                {bomSorted.map((row) => (
                  <tr key={row.component.id} className="border-t border-slate-100">
                    <td className="py-2 pr-2">{row.component.sku}</td>
                    <td className="py-2 tabular-nums">{row.qtyPerKit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="mt-2 text-sm text-slate-500">No BOM lines.</p>
          )}
        </section>
      ) : null}
    </li>
  );
}
