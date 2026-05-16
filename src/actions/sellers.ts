"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { guardAction } from "@/lib/auth/rbac";
import { PERM } from "@/lib/domain/permissions";
import { prisma } from "@/lib/prisma";

function revalidateSellers() {
  revalidatePath("/sellers");
}

function strOrUndef(v: FormDataEntryValue | null): string | undefined {
  const s = String(v ?? "").trim();
  return s || undefined;
}

export async function createSeller(formData: FormData) {
  await guardAction(PERM.tradingSellerEdit);
  const name = String(formData.get("name") ?? "").trim();
  if (!name) redirect("/sellers/new?err=name");

  const created = await prisma.seller.create({
    data: {
      name,
      tradingName: strOrUndef(formData.get("tradingName")),
      email: strOrUndef(formData.get("email")),
      phone: strOrUndef(formData.get("phone")),
      city: strOrUndef(formData.get("city")),
      country: strOrUndef(formData.get("country")) ?? "Saudi Arabia",
      vatNumber: strOrUndef(formData.get("vatNumber")),
      notes: strOrUndef(formData.get("notes")),
    },
    select: { id: true },
  });

  revalidateSellers();
  redirect(`/sellers/${created.id}?created=1`);
}

export async function updateSeller(formData: FormData) {
  await guardAction(PERM.tradingSellerEdit);
  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  if (!id || !name) redirect("/sellers?err=badForm");

  await prisma.seller.update({
    where: { id },
    data: {
      name,
      tradingName: strOrUndef(formData.get("tradingName")),
      email: strOrUndef(formData.get("email")),
      phone: strOrUndef(formData.get("phone")),
      city: strOrUndef(formData.get("city")),
      country: strOrUndef(formData.get("country")) ?? "Saudi Arabia",
      vatNumber: strOrUndef(formData.get("vatNumber")),
      notes: strOrUndef(formData.get("notes")),
      active: String(formData.get("active") ?? "") === "on",
    },
  });

  revalidateSellers();
  revalidatePath(`/sellers/${id}`);
  redirect(`/sellers/${id}?saved=1`);
}
