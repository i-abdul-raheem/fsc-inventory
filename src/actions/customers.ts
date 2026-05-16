"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { guardAction } from "@/lib/auth/rbac";
import { PERM } from "@/lib/domain/permissions";
import { prisma } from "@/lib/prisma";

function revalidateCustomers() {
  revalidatePath("/customers");
  revalidatePath("/orders/new");
}

export async function createCustomer(formData: FormData) {
  await guardAction(PERM.tradingCustomerEdit);
  const name = String(formData.get("name") ?? "").trim();
  if (!name) redirect("/customers/new?err=name");

  const created = await prisma.customer.create({
    data: {
      name,
      tradingName: strOrUndef(formData.get("tradingName")),
      email: strOrUndef(formData.get("email")),
      phone: strOrUndef(formData.get("phone")),
      city: strOrUndef(formData.get("city")),
      region: strOrUndef(formData.get("region")),
      addressLine: strOrUndef(formData.get("addressLine")),
      vatNumber: strOrUndef(formData.get("vatNumber")),
      notes: strOrUndef(formData.get("notes")),
    },
    select: { id: true },
  });

  revalidateCustomers();
  redirect(`/customers/${created.id}?created=1`);
}

export async function updateCustomer(formData: FormData) {
  await guardAction(PERM.tradingCustomerEdit);
  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  if (!id || !name) redirect("/customers?err=badForm");

  await prisma.customer.update({
    where: { id },
    data: {
      name,
      tradingName: strOrUndef(formData.get("tradingName")),
      email: strOrUndef(formData.get("email")),
      phone: strOrUndef(formData.get("phone")),
      city: strOrUndef(formData.get("city")),
      region: strOrUndef(formData.get("region")),
      addressLine: strOrUndef(formData.get("addressLine")),
      vatNumber: strOrUndef(formData.get("vatNumber")),
      notes: strOrUndef(formData.get("notes")),
      active: String(formData.get("active") ?? "") === "on",
    },
  });

  revalidateCustomers();
  revalidatePath(`/customers/${id}`);
  redirect(`/customers/${id}?saved=1`);
}

function strOrUndef(v: FormDataEntryValue | null): string | undefined {
  const s = String(v ?? "").trim();
  return s || undefined;
}
