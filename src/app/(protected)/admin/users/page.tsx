import Link from "next/link";

import Notice from "@/components/Notice";
import {
  adminCreateUser,
  adminToggleUserActive,
} from "@/actions/users";
import { prisma } from "@/lib/prisma";
import { USER_ROLE } from "@/lib/domain/roles";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams?: Promise<{ err?: string; created?: string }>;
}) {
  const qp = await searchParams;
  const users = await prisma.user.findMany({ orderBy: { email: "asc" } });

  const errMap: Record<string, string> = {
    duplicate: "That email already exists.",
    min: "Provide email + password (min 8 characters).",
    self: "You cannot deactivate your own account.",
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">Users</h1>
        <p className="mt-2 max-w-xl text-sm text-slate-600">
          Invite accounts and toggle access. Grant operators granular permissions under{" "}
          <Link href="/admin/permissions" className="font-medium text-teal-800 hover:underline">
            Access control
          </Link>
          .
        </p>
      </div>

      {qp?.err ? <Notice message={errMap[qp.err] ?? qp.err} /> : null}

      {qp?.created ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-950">
          User created.
        </div>
      ) : null}

      <section className="rounded-xl border border-zinc-300 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-medium text-slate-800">New user</h2>
        <form action={adminCreateUser} className="mt-4 grid max-w-lg gap-3 text-sm">
          <label className="block">
            <span className="text-xs font-medium text-slate-600">Email</span>
            <input required name="email" type="email" className="mt-1 w-full rounded border border-zinc-300 px-2 py-1" />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-slate-600">Display name</span>
            <input name="name" placeholder="Optional" className="mt-1 w-full rounded border border-zinc-300 px-2 py-1" />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-slate-600">Temporary password</span>
            <input required name="password" type="password" minLength={8} className="mt-1 w-full rounded border border-zinc-300 px-2 py-1" />
          </label>
          <label className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-600">Role</span>
            <select name="role" className="rounded border border-zinc-300 bg-transparent px-2 py-1 text-sm">
              <option value={USER_ROLE.OPERATOR}>Operator</option>
              <option value={USER_ROLE.ADMIN}>Administrator</option>
            </select>
          </label>
          <button type="submit" className="w-fit rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800">
            Create user
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-sm font-medium text-slate-800">Everyone</h2>
        <div className="mt-3 overflow-x-auto rounded-xl border border-zinc-300 bg-white text-sm shadow-sm">
          <table className="w-full text-left">
            <thead className="border-b border-slate-100 text-xs font-medium text-slate-600">
              <tr>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-zinc-200">
                  <td className="px-4 py-3 font-mono text-xs">{u.email}</td>
                  <td className="px-4 py-3">{u.name ?? "—"}</td>
                  <td className="px-4 py-3">{u.role}</td>
                  <td className="px-4 py-3">{u.active ? "Active" : "Disabled"}</td>
                  <td className="px-4 py-3 text-right">
                    <form action={adminToggleUserActive}>
                      <input type="hidden" name="userId" value={u.id} />
                      <button
                        type="submit"
                        className="rounded border border-slate-200 px-3 py-1.5 text-xs font-medium hover:bg-slate-50"
                      >
                        {u.active ? "Deactivate" : "Reactivate"}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
