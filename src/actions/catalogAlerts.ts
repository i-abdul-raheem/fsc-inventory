"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { guardAction } from "@/lib/auth/rbac";
import { PERM } from "@/lib/domain/permissions";

/** Low-stock floor per SKU (catalogue widget). */
export async function updateLowStockAlertBelow(formData: FormData) {
  await guardAction(PERM.catalogItemAlertThreshold);
  const itemId = String(formData.get("itemId") ?? "").trim();
  const raw = String(formData.get("below") ?? "").trim();
  if (!itemId) redirect("/catalog?err=item");

  const below =
    raw === "" || raw === "none"
      ? null
      : (() => {
          const n = Number.parseInt(raw, 10);
          return Number.isFinite(n) ? n : null;
        })();

  if (below !== null && below < 1) {
    redirect("/catalog?err=thresh");
  }

  await prisma.item.update({
    where: { id: itemId },
    data: { lowStockAlertBelow: below },
  });
  revalidatePath("/catalog");
  revalidatePath("/inventory");
  revalidatePath("/");
  revalidatePath("/alerts");
  redirect("/catalog?saved=1");
}
