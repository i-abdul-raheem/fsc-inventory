import "server-only";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/auth/constants";
import type { SessionUser } from "./types";

function secretKey(): Uint8Array | null {
  const s = process.env.AUTH_SECRET;
  if (!s) return null;
  return new TextEncoder().encode(s);
}

export async function signSessionToken(user: SessionUser): Promise<string | null> {
  const secret = secretKey();
  if (!secret) return null;

  return new SignJWT({
    email: user.email,
    role: user.role,
    name: user.name ?? "",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setExpirationTime("7d")
    .sign(secret);
}

export async function setSessionCookie(token: string): Promise<void> {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<SessionUser | null> {
  const secret = secretKey();
  if (!secret) return null;
  const jar = await cookies();
  const raw = jar.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  try {
    const { payload } = await jwtVerify(raw, secret);
    const sub = payload.sub;
    if (!sub) return null;
    return {
      id: sub,
      email: String(payload.email ?? ""),
      name: typeof payload.name === "string" && payload.name.length ? payload.name : null,
      role: String(payload.role ?? "OPERATOR"),
    };
  } catch {
    return null;
  }
}
