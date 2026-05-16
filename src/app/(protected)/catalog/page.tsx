import Notice from "@/components/Notice";
import { AddCatalogForms } from "@/components/catalog/AddCatalogForms";
import { CatalogItemCard } from "@/components/catalog/CatalogItemCard";
import { prisma } from "@/lib/prisma";
import { ITEM_KIND } from "@/lib/domain/status";

export default async function CatalogPage({
  searchParams,
}: {
  searchParams?: Promise<{ saved?: string; err?: string; created?: string }>;
}) {
  const qp = await searchParams;

  const errMap: Record<string, string> = {
    item: "Pick an item first.",
    missing: "Item no longer exists — refresh catalogue.",
    notComponent: "That action applies to components only.",
    notKit: "That action applies to kits only.",
    required: "Fill in required SKU and name fields.",
    thresh: "Alert threshold must be a positive integer, or cleared.",
    cost: "Standard cost must be a non‑negative integer (halalas), or cleared.",
    qty: "Quantity must be a non‑negative whole number.",
    duplicateSku: "That SKU already exists — choose another code.",
    skuLocked:
      "SKU cannot change while this catalogue record appears on any customer PO lines (historic or open). Edits must keep the legacy code.",
    bomEmpty: "Kits require at least one BOM line with a component quantity.",
    bomQty: "Every filled BOM row needs a qty per kit ≥ 1.",
    bomMissing: "BOM referenced a deleted or unknown component — refresh and try again.",
    bomKit: "Nested kits are blocked — pick components only.",
  };

  const [items, lineAgg, componentOptions] = await Promise.all([
    prisma.item.findMany({
      orderBy: [{ kind: "asc" }, { sku: "asc" }],
      include: {
        stock: true,
        bomAsKit: {
          include: { component: { select: { id: true, sku: true, name: true } } },
        },
      },
    }),
    prisma.salesOrderLine.groupBy({
      by: ["itemId"],
      _count: { _all: true },
    }),
    prisma.item.findMany({
      where: { kind: ITEM_KIND.COMPONENT },
      orderBy: { sku: "asc" },
      select: { id: true, sku: true, name: true },
    }),
  ]);

  const lineCounts = new Map(lineAgg.map((row) => [row.itemId, row._count._all]));

  const flashOk =
    qp?.saved === "1"
      ? "Alert thresholds saved."
      : qp?.saved === "cost"
        ? "Standard costs saved."
        : qp?.saved === "details"
          ? "Details saved."
          : qp?.saved === "stock"
            ? "Stock quantity updated."
            : qp?.saved === "bom"
              ? "Kit BOM saved."
              : qp?.created === "component"
                ? "Component created."
                : qp?.created === "kit"
                  ? "Kit created."
                  : null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">Catalogue</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Components and kits with costs, alerts, and BOMs. SKUs lock after they appear on any customer order.
        </p>
      </div>

      <AddCatalogForms components={componentOptions} />

      {flashOk ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-950">
          {flashOk}
        </div>
      ) : null}
      {qp?.err ? <Notice message={errMap[qp.err] ?? qp.err} /> : null}

      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-600">
          No items yet — add a component or kit above.
        </p>
      ) : (
        <ul className="space-y-5">
          {items.map((item) => (
            <CatalogItemCard
              key={item.id}
              item={item}
              componentOptions={componentOptions}
              orderLineCount={lineCounts.get(item.id) ?? 0}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
