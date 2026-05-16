"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { USER_ROLE, userIsAdmin } from "@/lib/domain/roles";

async function guardAdmin() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!userIsAdmin(session.role)) redirect("/");
  return session;
}

export async function adminCreateUser(formData: FormData) {
  await guardAdmin();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim() || undefined;
  const password = String(formData.get("password") ?? "");
  const roleRaw = String(formData.get("role") ?? USER_ROLE.OPERATOR);
  const role = roleRaw === USER_ROLE.ADMIN ? USER_ROLE.ADMIN : USER_ROLE.OPERATOR;

  if (!email || password.length < 8) {
    redirect("/admin/users?err=min");
  }

  const passwordHash = await bcrypt.hash(password, 11);

  try {
    await prisma.user.create({
      data: { email, name, passwordHash, role },
    });
  } catch {
    redirect("/admin/users?err=duplicate");
  }

  revalidatePath("/admin/users");
  redirect("/admin/users?created=1");
}

export async function adminToggleUserActive(formData: FormData) {
  const session = await guardAdmin();
  const userId = String(formData.get("userId") ?? "").trim();
  if (!userId) redirect("/admin/users");
  if (userId === session.id) redirect("/admin/users?err=self");

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) redirect("/admin/users");

  await prisma.user.update({
    where: { id: userId },
    data: { active: !target.active },
  });
  revalidatePath("/admin/users");
  redirect("/admin/users");
}
