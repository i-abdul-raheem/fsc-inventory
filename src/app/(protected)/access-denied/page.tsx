import Link from "next/link";

import { getPrincipal } from "@/lib/auth/rbac";
import { PERM } from "@/lib/domain/permissions";

/** Shown when a signed-in user hits a route or action outside their RBAC grants. */
export default async function AccessDeniedPage() {
  const p = await getPrincipal();
  const canDash = p?.permissions.has(PERM.moduleDashboard);
  const canAccount = p?.permissions.has(PERM.moduleAccount);

  return (
    <main className="mx-auto max-w-md py-24 text-center">
      <h1 className="text-xl font-semibold text-slate-900">Access not assigned</h1>
      <p className="mt-3 text-sm text-slate-600">
        Your account is signed in, but you do not have permission for this area. Ask an administrator to grant the right
        modules and actions under{" "}
        <span className="font-medium text-slate-800">Admin → Access</span>.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm">
        {canDash ? (
          <Link href="/" className="rounded-lg bg-teal-700 px-4 py-2 font-medium text-white hover:bg-teal-800">
            Dashboard
          </Link>
        ) : null}
        {canAccount ? (
          <Link href="/settings" className="rounded-lg border border-slate-200 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50">
            Account
          </Link>
        ) : null}
      </div>
    </main>
  );
}
