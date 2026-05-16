"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { guardAction } from "@/lib/auth/rbac";
import {
  clearSessionCookie,
  getSession,
  setSessionCookie,
  signSessionToken,
} from "@/lib/auth/session";
import type { SessionUser } from "@/lib/auth/types";
import { PERM } from "@/lib/domain/permissions";

async function guardActiveUser() {
  const session = await getSession();
  if (!session) redirect("/login");
  const row = await prisma.user.findUnique({ where: { id: session.id } });
  if (!row || !row.active) {
    await clearSessionCookie();
    redirect("/login?err=inactive");
  }
  return { session, row };
}

/** Update signed-in user's display name and refresh session cookie JWT. */
export async function updateOwnProfile(formData: FormData) {
  const { session, row } = await guardActiveUser();
  await guardAction(PERM.accountProfileEdit);

  const nameRaw = String(formData.get("name") ?? "").trim();
  const name = nameRaw === "" ? null : nameRaw;

  if (name !== null && name.length > 120) {
    redirect("/settings?err=nameLen");
  }

  await prisma.user.update({
    where: { id: session.id },
    data: { name },
  });

  const sessionUser: SessionUser = {
    id: row.id,
    email: row.email,
    role: row.role,
    name,
  };
  const token = await signSessionToken(sessionUser);
  if (!token) {
    redirect("/login?err=config");
  }
  await setSessionCookie(token);

  revalidatePath("/settings");
  revalidatePath("/", "layout");
  redirect("/settings?saved=profile");
}

/** Change password for signed-in user (requires current password). */
export async function changeOwnPassword(formData: FormData) {
  const { session } = await guardActiveUser();
  await guardAction(PERM.accountPasswordChange);

  const current = String(formData.get("currentPassword") ?? "");
  const next = String(formData.get("newPassword") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  if (!current) {
    redirect("/settings?err=current");
  }
  if (next.length < 8) {
    redirect("/settings?err=weak");
  }
  if (next !== confirm) {
    redirect("/settings?err=match");
  }

  const userRow = await prisma.user.findUnique({ where: { id: session.id } });
  if (!userRow) {
    redirect("/login");
  }

  const ok = await bcrypt.compare(current, userRow.passwordHash);
  if (!ok) {
    redirect("/settings?err=wrong");
  }

  if (await bcrypt.compare(next, userRow.passwordHash)) {
    redirect("/settings?err=reuse");
  }

  const passwordHash = await bcrypt.hash(next, 11);
  await prisma.user.update({
    where: { id: session.id },
    data: { passwordHash },
  });

  revalidatePath("/settings");
  redirect("/settings?saved=password");
}
