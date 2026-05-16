import Link from "next/link";

import Notice from "@/components/Notice";
import { SaveAccessSubmit } from "@/components/admin/SaveAccessSubmit";
import { adminSetUserPermissions } from "@/actions/permissionsAdmin";
import { prisma } from "@/lib/prisma";
import { fetchUserPermissionCodes } from "@/lib/auth/permissionDb";
import { ALL_PERMISSION_CODES, PERMISSION_UI_GROUPS, type PermissionCode } from "@/lib/domain/permissions";
import { userIsAdmin } from "@/lib/domain/roles";
import { tradingForm as tf } from "@/lib/ui/tradingPartnerForms";

const errHints: Record<string, string> = {
  missing: "Pick an operator account first.",
  self: "You cannot edit your own access here (admins already have full access).",
  adminRole: "Administrators always have full access — granular grants apply to operators only.",
};

function operatorInitial(email: string) {
  const c = email.trim().charAt(0);
  return c ? c.toUpperCase() : "?";
}

const permCard =
  "group flex cursor-pointer gap-3.5 rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-sm outline-none ring-teal-500/0 transition hover:border-teal-300/70 hover:ring-2 hover:ring-teal-500/15 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-teal-500/30 has-[:checked]:border-teal-300/90 has-[:checked]:bg-gradient-to-br has-[:checked]:from-teal-50/90 has-[:checked]:to-white has-[:checked]:shadow-[0_1px_0_rgba(15,118,110,0.06)]";

const permCheckbox =
  "mt-0.5 size-4 shrink-0 cursor-pointer rounded border-slate-300 text-teal-700 focus:ring-2 focus:ring-teal-600/25 focus:ring-offset-0";

export default async function AdminPermissionsPage({
  searchParams,
}: {
  searchParams?: Promise<{ userId?: string; saved?: string; err?: string }>;
}) {
  const qp = await searchParams;

  const users = await prisma.user.findMany({
    orderBy: { email: "asc" },
    select: { id: true, email: true, name: true, role: true, active: true },
  });

  const operators = users.filter((u) => !userIsAdmin(u.role) && u.active);

  const selectedUserId = qp?.userId && operators.some((u) => u.id === qp.userId) ? qp.userId : "";
  const grantCodes = selectedUserId ? await fetchUserPermissionCodes(prisma, selectedUserId) : [];
  const grants = new Set(grantCodes);

  const selectedUser = operators.find((u) => u.id === selectedUserId);
  const selectedEmail = selectedUser?.email ?? null;
  const totalPerms = ALL_PERMISSION_CODES.length;
  const grantedCount = grants.size;

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-10">
      <header className="border-b border-slate-200/80 pb-8">
        <Link href="/admin/users" className={tf.backLink}>
          <span aria-hidden className="text-base leading-none">
            ←
          </span>
          Users
        </Link>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Access control</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
              Choose an operator, then toggle what they can open and do. Administrators always have full access — this
              matrix applies to operators only.
            </p>
          </div>
          <div className="hidden shrink-0 rounded-2xl border border-teal-200/60 bg-gradient-to-br from-teal-50 to-white px-4 py-3 text-right shadow-sm ring-1 ring-teal-900/5 sm:block">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-teal-900/70">Operators</p>
            <p className="mt-0.5 text-2xl font-semibold tabular-nums text-slate-900">{operators.length}</p>
          </div>
        </div>
      </header>

      {qp?.saved ? (
        <div
          role="status"
          aria-live="polite"
          className="flex items-start gap-3 rounded-2xl border border-emerald-200/90 bg-gradient-to-r from-emerald-50/95 to-white px-5 py-4 text-emerald-950 shadow-sm ring-1 ring-emerald-900/5"
        >
          <span
            className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm"
            aria-hidden
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </span>
          <div>
            <p className="font-semibold text-emerald-950">Access saved</p>
            <p className="mt-0.5 text-sm leading-relaxed text-emerald-900/85">
              Their next navigation will use the new menus. They can refresh if a page was already open.
            </p>
          </div>
        </div>
      ) : null}

      {qp?.err ? <Notice message={errHints[qp.err] ?? qp.err} /> : null}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,19rem)_minmax(0,1fr)] lg:items-start">
        <aside className="min-w-0 lg:sticky lg:top-6">
          <section className={tf.formCard}>
            <div className={tf.formIntro}>
              <p className="text-xs font-medium text-slate-500">Choose operator</p>
              <p className="mt-1 text-sm text-slate-700">Active operator accounts only. Admins are not listed.</p>
              <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-teal-800/80 sm:hidden">
                {operators.length} active
              </p>
            </div>
            {operators.length === 0 ? (
              <div className="px-6 py-10 text-center sm:px-8">
                <p className="text-sm text-slate-600">No active operator accounts yet.</p>
                <Link
                  href="/admin/users"
                  className="mt-4 inline-flex text-sm font-medium text-teal-800 underline-offset-2 hover:underline"
                >
                  Invite users
                </Link>
              </div>
            ) : (
              <ul className="max-h-[min(52vh,22rem)] space-y-0.5 overflow-y-auto border-t border-slate-100 p-2 sm:max-h-[min(60vh,26rem)]">
                {operators.map((u) => {
                  const selected = u.id === selectedUserId;
                  return (
                    <li key={u.id}>
                      <Link
                        href={`/admin/permissions?userId=${encodeURIComponent(u.id)}`}
                        scroll={false}
                        className={
                          selected
                            ? "flex items-center gap-3 rounded-xl bg-teal-50 px-3 py-2.5 ring-1 ring-teal-200/90"
                            : "flex items-center gap-3 rounded-xl px-3 py-2.5 text-slate-800 transition hover:bg-slate-50"
                        }
                      >
                        <span
                          className={
                            selected
                              ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-sm font-bold text-white shadow-sm"
                              : "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-600"
                          }
                          aria-hidden
                        >
                          {operatorInitial(u.email)}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className={`block truncate text-sm ${selected ? "font-semibold text-teal-950" : "font-medium text-slate-900"}`}>
                            {u.email}
                          </span>
                          <span className="mt-0.5 block truncate text-xs text-slate-500">{u.name?.trim() || "No display name"}</span>
                        </span>
                        {selected ? (
                          <span className="shrink-0 rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-teal-800 ring-1 ring-teal-200/80">
                            Editing
                          </span>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </aside>

        <main className="min-w-0 space-y-6">
          {selectedUserId && selectedEmail ? (
            <form action={adminSetUserPermissions} className="space-y-6">
              <input type="hidden" name="userId" value={selectedUserId} />

              <div className={tf.formCard}>
                <div className={tf.formIntro}>
                  <p className="text-xs font-medium text-slate-500">Selected account</p>
                  <p className="mt-1 font-mono text-sm font-semibold text-teal-900">{selectedEmail}</p>
                  {selectedUser?.name?.trim() ? (
                    <p className="mt-1 text-sm text-slate-600">{selectedUser.name.trim()}</p>
                  ) : null}
                  <p className="mt-2 text-xs text-slate-600">
                    <span className="font-semibold text-slate-800">{grantedCount}</span> of{" "}
                    <span className="tabular-nums">{totalPerms}</span> permissions currently granted.
                  </p>
                </div>
              </div>

              {PERMISSION_UI_GROUPS.map((group, gi) => (
                <section key={group.title} className={tf.formCard} aria-labelledby={`perm-group-${gi}`}>
                  <div className={tf.formIntro}>
                    <h2 id={`perm-group-${gi}`} className="text-sm font-semibold leading-snug text-slate-900">
                      {group.title}
                    </h2>
                  </div>
                  <div className="border-t border-slate-100 px-4 py-5 sm:px-6">
                    <ul className="grid gap-3 sm:grid-cols-2">
                      {group.items.map((item) => {
                        const checked = grants.has(item.code as PermissionCode);
                        return (
                          <li key={item.code}>
                            <label className={permCard}>
                              <input
                                type="checkbox"
                                name={`perm_${item.code}`}
                                defaultChecked={checked}
                                className={permCheckbox}
                              />
                              <span className="min-w-0 flex-1 pt-0.5 text-sm leading-snug text-slate-800">{item.label}</span>
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </section>
              ))}

              <div className={tf.formCard}>
                <div className="flex flex-col-reverse gap-4 border-t border-slate-100 bg-slate-50/70 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
                  <p className="max-w-md text-xs leading-relaxed text-slate-600">
                    Unchecked items hide routes and block server actions. Operators may need a refresh on open tabs.
                  </p>
                  <SaveAccessSubmit />
                </div>
              </div>
            </form>
          ) : operators.length ? (
            <div className={tf.formCard}>
              <div className="px-6 py-14 text-center sm:px-10">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 ring-1 ring-slate-200/80">
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                    />
                  </svg>
                </div>
                <p className="mt-5 text-sm font-medium text-slate-900">Select an operator</p>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-600">
                  Pick someone from the list on the left to view and edit their permission checklist.
                </p>
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}
