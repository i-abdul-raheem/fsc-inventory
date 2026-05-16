import Link from "next/link";

import FeasibleBrandLogo from "@/components/FeasibleBrandLogo";
import { getSession } from "@/lib/auth/session";
import { KSA } from "@/lib/region/constants";

export default async function HowToUseLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <div className="flex min-h-screen flex-col bg-[color:var(--background)]">
      <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="mx-auto flex h-14 w-full max-w-5xl flex-nowrap items-center justify-between gap-3 px-4 sm:px-6">
          <Link href={session ? "/" : "/login"} className="flex min-w-0 shrink items-center gap-2.5">
            <FeasibleBrandLogo variant="mark" heightClass="h-8 sm:h-9" className="shrink-0" priority />
            <div className="min-w-0 leading-tight">
              <div className="truncate text-sm font-semibold text-slate-900 sm:text-base">IMS</div>
              <div className="truncate text-[10px] text-slate-500 sm:text-xs">How to use · {KSA.marketLabel}</div>
            </div>
          </Link>
          <nav className="flex shrink-0 items-center gap-2 sm:gap-3" aria-label="Public help navigation">
            <div
              className="flex items-stretch overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
              role="group"
              aria-label="Guide language"
            >
              <Link
                href="/how-to-use"
                className="px-2.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 sm:px-3 sm:text-sm"
              >
                English
              </Link>
              <Link
                href="/how-to-use/ur"
                className="border-l border-slate-200 px-2.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 sm:px-3 sm:text-sm"
              >
                اردو
              </Link>
            </div>
            {session ? (
              <Link
                href="/"
                className="rounded-lg bg-teal-700 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-teal-800 sm:text-sm"
              >
                Open app
              </Link>
            ) : (
              <Link
                href="/login"
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-sm hover:bg-slate-50 sm:text-sm"
              >
                Sign in
              </Link>
            )}
          </nav>
        </div>
      </header>
      <div className="flex-1">{children}</div>
    </div>
  );
}
