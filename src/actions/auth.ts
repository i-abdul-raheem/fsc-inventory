"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  clearSessionCookie,
  getSession,
  setSessionCookie,
  signSessionToken,
} from "@/lib/auth/session";
import type { SessionUser } from "@/lib/auth/types";

function sanitizeCallback(raw: string | null | undefined) {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/";
  return raw.slice(0, 256);
}

export async function loginAction(formData: FormData) {
  const emailRaw = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const callbackUrl =
    sanitizeCallback(typeof formData.get("callbackUrl") === "string" ? formData.get("callbackUrl") as string : "") ||
    "/";

  if (!emailRaw || !password) {
    redirect(`/login?err=missing`);
  }

  const userRow = await prisma.user.findUnique({ where: { email: emailRaw } });
  if (!userRow || !userRow.active) {
    redirect(`/login?err=failed`);
  }

  const ok = await bcrypt.compare(password, userRow.passwordHash);
  if (!ok) {
    redirect(`/login?err=failed`);
  }

  const sessionUser: SessionUser = {
    id: userRow.id,
    email: userRow.email,
    name: userRow.name,
    role: userRow.role,
  };

  const token = await signSessionToken(sessionUser);
  if (!token) {
    redirect(`/login?err=config`);
  }
  await setSessionCookie(token);
  redirect(callbackUrl);
}

export async function logoutAction() {
  const session = await getSession();
  if (session) {
    await clearSessionCookie();
  }
  redirect("/login");
}
