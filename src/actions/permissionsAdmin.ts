"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth/session";
import { syncPermissionRows } from "@/lib/auth/syncPermissions";
import { replaceUserPermissionGrants } from "@/lib/auth/permissionDb";
import { ALL_PERMISSION_CODES } from "@/lib/domain/permissions";
import { userIsAdmin } from "@/lib/domain/roles";
import { prisma } from "@/lib/prisma";

async function guardAdmin() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!userIsAdmin(session.role)) redirect("/access-denied");
  return session;
}

/** Replace an operator's granular grants (admins bypass RBAC). */
export async function adminSetUserPermissions(formData: FormData) {
  const session = await guardAdmin();

  const userId = String(formData.get("userId") ?? "").trim();
  if (!userId) redirect("/admin/permissions?err=missing");

  if (userId === session.id) {
    redirect("/admin/permissions?err=self");
  }

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) redirect("/admin/permissions?err=missing");
  if (userIsAdmin(target.role)) {
    redirect("/admin/permissions?err=adminRole");
  }

  await syncPermissionRows(prisma);

  const grantedCodes = ALL_PERMISSION_CODES.filter((code) => formData.get(`perm_${code}`) === "on");

  await replaceUserPermissionGrants(prisma, userId, grantedCodes);

  revalidatePath("/", "layout");
  revalidatePath("/admin/permissions");
  redirect(`/admin/permissions?userId=${encodeURIComponent(userId)}&saved=1`);
}
