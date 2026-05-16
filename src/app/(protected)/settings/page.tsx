import Link from "next/link";
import { redirect } from "next/navigation";

import Notice from "@/components/Notice";
import { changeOwnPassword, updateOwnProfile } from "@/actions/accountSettings";
import { getPrincipal } from "@/lib/auth/rbac";
import { getSession } from "@/lib/auth/session";
import { PERM } from "@/lib/domain/permissions";
import { prisma } from "@/lib/prisma";

export default async function AccountSettingsPage({
  searchParams,
}: {
  searchParams?: Promise<{
    saved?: string;
    err?: string;
  }>;
}) {
  const sp = await searchParams;

  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { id: true, email: true, name: true, role: true, active: true, createdAt: true },
  });
  if (!user || !user.active) redirect("/login");

  const principal = await getPrincipal();
  const canProfileEdit = Boolean(principal?.permissions.has(PERM.accountProfileEdit));
  const canPassword = Boolean(principal?.permissions.has(PERM.accountPasswordChange));

  const errMap: Record<string, string> = {
    current: "Enter your current password.",
    weak: "New password must be at least 8 characters.",
    match: "New password and confirmation do not match.",
    wrong: "Current password was not correct.",
    reuse: "Choose a password different from your current one.",
    nameLen: "Display name is too long (max 120 characters).",
    inactive: "This account has been deactivated — contact an administrator.",
  };

  const flashOk =
    sp?.saved === "profile"
      ? "Profile updated."
      : sp?.saved === "password"
        ? "Password updated."
        : null;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">Settings</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Your display name and password for this workspace.
          </p>
        </div>
        <Link
          href="/"
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Dashboard
        </Link>
      </div>

      {flashOk ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-950">
          {flashOk}
        </div>
      ) : null}
      {sp?.err ? <Notice message={errMap[sp.err] ?? sp.err} /> : null}

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-medium text-slate-800">Profile</h2>
        <dl className="mt-4 grid gap-4 border-b border-slate-100 pb-6 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium text-slate-500">Email</dt>
            <dd className="mt-1 font-mono text-sm text-slate-900">{user.email}</dd>
            <p className="mt-1 text-xs text-slate-500">
              Email changes need an admin in this build.
            </p>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500">Role</dt>
            <dd className="mt-1 text-sm font-medium capitalize text-slate-900">
              {user.role.toLowerCase().replace("_", " ")}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium text-slate-500">Member since</dt>
            <dd className="mt-1 text-sm text-slate-700">
              {user.createdAt.toLocaleString("en-SA", {
                timeZone: "Asia/Riyadh",
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </dd>
          </div>
        </dl>

        {canProfileEdit ? (
        <form action={updateOwnProfile} className="mt-6 space-y-4">
          <label className="block text-sm font-medium text-slate-700">
            Display name
            <input
              name="name"
              maxLength={120}
              defaultValue={user.name ?? ""}
              placeholder="Shown in upper navigation bar"
              className="mt-2 block w-full max-w-xl rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              autoComplete="name"
            />
          </label>
          <button
            type="submit"
            className="rounded-lg bg-teal-700 px-5 py-2 text-sm font-medium text-white hover:bg-teal-800"
          >
            Save profile
          </button>
        </form>
        ) : (
          <p className="mt-6 text-sm text-slate-600">
            Display name: <span className="font-medium text-slate-900">{user.name ?? "—"}</span>
          </p>
        )}
      </section>

      {canPassword ? (
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-medium text-slate-800">Password</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          At least 8 characters. Confirm your current password to change it.
        </p>
        <form action={changeOwnPassword} className="mt-6 max-w-xl space-y-4">
          <label className="block text-sm font-medium text-slate-700">
            Current password
            <input
              required
              name="currentPassword"
              type="password"
              autoComplete="current-password"
              className="mt-2 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            New password
            <input
              required
              name="newPassword"
              type="password"
              minLength={8}
              autoComplete="new-password"
              className="mt-2 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Confirm new password
            <input
              required
              name="confirmPassword"
              type="password"
              minLength={8}
              autoComplete="new-password"
              className="mt-2 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
          </label>
          <button
            type="submit"
            className="rounded-lg bg-teal-700 px-5 py-2 text-sm font-medium text-white hover:bg-teal-800"
          >
            Update password
          </button>
        </form>
      </section>
      ) : null}
    </div>
  );
}
