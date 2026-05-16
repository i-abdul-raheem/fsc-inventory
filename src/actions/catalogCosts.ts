"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { guardAction } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma";
import { PERM } from "@/lib/domain/permissions";

/** Maintain standard cost basis for valuation + COGS (optional; blank clears). */
export async function updateStandardCostCents(formData: FormData) {
  await guardAction(PERM.catalogItemStdCost);
  const itemId = String(formData.get("itemId") ?? "").trim();
  const raw = String(formData.get("costCents") ?? "").trim();
  if (!itemId) redirect("/catalog?err=item");

  const cost =
    raw === "" || raw === "none"
      ? null
      : (() => {
          const n = Number.parseInt(raw, 10);
          return Number.isFinite(n) ? n : null;
        })();

  if (cost !== null && cost < 0) {
    redirect("/catalog?err=cost");
  }

  await prisma.item.update({
    where: { id: itemId },
    data: { standardCostCents: cost },
  });
  revalidatePath("/catalog");
  revalidatePath("/reports");
  revalidatePath("/reports/balance-sheet");
  revalidatePath("/reports/inventory-valuation");
  revalidatePath("/reports/profit-loss");
  redirect("/catalog?saved=cost");
}
