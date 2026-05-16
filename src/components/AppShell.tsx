import type { ReactNode } from "react";
import Link from "next/link";

import AppHeaderMenus from "@/components/AppHeaderMenus";
import FeasibleBrandLogo from "@/components/FeasibleBrandLogo";
import type { PermissionCode } from "@/lib/domain/permissions";
import { KSA } from "@/lib/region/constants";

type UserBar = {
  email: string;
  name: string | null;
  role: string;
};

export default function AppShell(props: {
  children: ReactNode;
  user: UserBar;
  alertCount: number;
  isAdmin: boolean;
  grantedPermissions: readonly PermissionCode[];
  showAlertsBell: boolean;
}) {
  const { children, user, alertCount, isAdmin, grantedPermissions, showAlertsBell } = props;

  return (
    <div className="flex min-h-screen flex-col bg-[color:var(--background)]">
      <header
        data-print-hide
        className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/90 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/75"
      >
        <div className="mx-auto flex h-14 w-full max-w-5xl flex-nowrap items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
            <Link
              href="/"
              className="flex min-w-0 shrink items-center gap-2.5 overflow-hidden"
            >
              <FeasibleBrandLogo variant="mark" heightClass="h-8 sm:h-9" className="shrink-0" priority />
              <div className="min-w-0 leading-tight">
                <div className="truncate text-sm font-semibold text-slate-900 sm:text-base">IMS</div>
                <div className="truncate text-[10px] font-normal text-slate-500 sm:text-xs">
                  Inventory · {KSA.marketLabel}
                </div>
              </div>
            </Link>
          </div>

          <AppHeaderMenus
            user={user}
            alertCount={alertCount}
            isAdmin={isAdmin}
            grantedPermissions={grantedPermissions}
            showAlertsBell={showAlertsBell}
          />
        </div>
      </header>
      <div className="flex-1 text-slate-900">
        <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">{children}</div>
      </div>
    </div>
  );
}
