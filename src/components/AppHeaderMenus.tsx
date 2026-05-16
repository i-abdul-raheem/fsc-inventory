"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { logoutAction } from "@/actions/auth";
import type { PermissionCode } from "@/lib/domain/permissions";
import { PERM } from "@/lib/domain/permissions";

const NAV = [
  { href: "/", label: "Dashboard", permission: PERM.moduleDashboard },
  { href: "/orders", label: "Orders", permission: PERM.moduleOrders },
  { href: "/customers", label: "Customers", permission: PERM.moduleCustomers },
  { href: "/sellers", label: "Sellers", permission: PERM.moduleSellers },
  { href: "/procurement", label: "Procurement", permission: PERM.moduleProcurement },
  { href: "/inventory", label: "Inventory", permission: PERM.moduleInventory },
  { href: "/catalog", label: "Catalogue", permission: PERM.moduleCatalog },
  { href: "/reports", label: "Reports", permission: PERM.moduleReports },
  { href: "/settings", label: "Account", permission: PERM.moduleAccount },
] as const;

const TRIGGER_FRAME =
  "relative flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50 hover:text-slate-800";

const iconRow = "h-5 w-5 shrink-0 stroke-[2px]";

function Svg({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <svg
      aria-hidden
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
    >
      {children}
    </svg>
  );
}

function IconMenuTrigger() {
  return (
    <Svg className="h-[22px] w-[22px] shrink-0 text-current">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </Svg>
  );
}

function IconBookOpen() {
  return (
    <Svg className={`${iconRow} text-teal-700`}>
      <path d="M4.5 5.25h15M4.5 12h15M4.5 18.75h10M19.5 18.75h.75a.75.75 0 0 0 .75-.75v-15a.75.75 0 0 0-.75-.75H4.5a.75.75 0 0 0-.75.75v15c0 .414.336.75.75.75h.75Z" />
    </Svg>
  );
}

function IconBellTrigger() {
  return (
    <Svg className="h-[22px] w-[22px] shrink-0 text-current">
      <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </Svg>
  );
}

function IconUserTrigger() {
  return (
    <Svg className="h-[22px] w-[22px] shrink-0 text-current">
      <path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </Svg>
  );
}

function NavRowIcon({ href }: { href: string }) {
  const c = `${iconRow} text-slate-400`;
  switch (href) {
    case "/":
      return (
        <Svg className={c}>
          <path d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </Svg>
      );
    case "/orders":
      return (
        <Svg className={c}>
          <path d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
        </Svg>
      );
    case "/customers":
      return (
        <Svg className={c}>
          <path d="M2.25 21h19.5M4.5 3h15M4.5 7.5h15M4.5 12h15m-9.75 9H19.5a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v12A2.25 2.25 0 0 0 4.5 21Z" />
        </Svg>
      );
    case "/sellers":
      return (
        <Svg className={c}>
          <path d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
        </Svg>
      );
    case "/procurement":
      return (
        <Svg className={c}>
          <path d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
        </Svg>
      );
    case "/inventory":
      return (
        <Svg className={c}>
          <path d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
        </Svg>
      );
    case "/catalog":
      return (
        <Svg className={c}>
          <path d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.167.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.088 18.088 0 005.227-5.229c.54-.827.368-1.908-.331-2.607L11.16 3.66A2.251 2.251 0 009.569 3z M6 6h.009v.008H6V6z" />
        </Svg>
      );
    case "/reports":
      return (
        <Svg className={c}>
          <path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </Svg>
      );
    case "/settings":
      return (
        <Svg className={c}>
          <path d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
          <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        </Svg>
      );
    default:
      return (
        <Svg className={c}>
          <path d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
        </Svg>
      );
  }
}

function IconUsersAdmin() {
  return (
    <Svg className={`${iconRow} text-teal-700`}>
      <path d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106a12.318 12.318 0 0 1-8.624 6.972c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
    </Svg>
  );
}

function IconAccess() {
  return (
    <Svg className={`${iconRow} text-teal-700`}>
      <path d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
    </Svg>
  );
}
function IconArrowTopRightOnSquare() {
  return (
    <Svg className="h-4 w-4 shrink-0 opacity-95">
      <path d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5M7.5 16.5L21 3M15 3h6v6" />
    </Svg>
  );
}

function IconArrowRightOnRectangle() {
  return (
    <Svg className="h-4 w-4 shrink-0 text-slate-500">
      <path d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
    </Svg>
  );
}

type OpenSection = "menu" | "notifications" | "account" | null;

type UserBar = {
  email: string;
  name: string | null;
  role: string;
};

function hasGrant(granted: readonly PermissionCode[], code: PermissionCode) {
  return granted.includes(code);
}

export default function AppHeaderMenus(props: {
  user: UserBar;
  alertCount: number;
  isAdmin: boolean;
  grantedPermissions: readonly PermissionCode[];
  showAlertsBell: boolean;
}) {
  const { user, alertCount, isAdmin, grantedPermissions, showAlertsBell } = props;
  const [open, setOpen] = useState<OpenSection>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const panelClass =
    "absolute right-0 top-[calc(100%+0.35rem)] z-50 w-[min(calc(100vw-2rem),18rem)] overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg shadow-slate-900/10 ring-1 ring-slate-900/5";

  useEffect(() => {
    setOpen(null);
  }, [pathname]);

  useEffect(() => {
    if (open == null) return;
    function onPointerDown(ev: PointerEvent) {
      const root = containerRef.current;
      if (!root) return;
      const t = ev.target;
      if (t instanceof Node && !root.contains(t)) setOpen(null);
    }
    function onKey(ev: KeyboardEvent) {
      if (ev.key === "Escape") setOpen(null);
    }
    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function pick(section: Exclude<OpenSection, null>) {
    setOpen((s) => (s === section ? null : section));
  }

  function ringOpen(section: Exclude<OpenSection, null>) {
    return open === section ? "ring-2 ring-teal-600/30 border-teal-200 bg-teal-50/80" : "";
  }

  return (
    <div ref={containerRef} className="flex shrink-0 items-center gap-1.5 sm:gap-2">
      <div className="relative">
        <button
          type="button"
          className={`${TRIGGER_FRAME} ${ringOpen("menu")}`}
          aria-expanded={open === "menu"}
          aria-haspopup="true"
          aria-controls="header-menu-panel"
          onClick={() => pick("menu")}
          aria-label="Main navigation menu"
        >
          <IconMenuTrigger />
        </button>
        {open === "menu" ? (
          <div id="header-menu-panel" className={panelClass} role="presentation">
            <nav aria-label="Main">
              <ul className="max-h-[min(24rem,calc(100vh-8rem))] overflow-y-auto bg-white py-1">
                <li>
                  <Link
                    href="/how-to-use"
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-teal-900 hover:bg-teal-50"
                    onClick={() => setOpen(null)}
                  >
                    <IconBookOpen />
                    <span>How to use (docs)</span>
                  </Link>
                </li>
                {NAV.filter(({ permission }) =>
                  hasGrant(grantedPermissions, permission),
                ).map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                      onClick={() => setOpen(null)}
                    >
                      <NavRowIcon href={href} />
                      <span>{label}</span>
                    </Link>
                  </li>
                ))}
                {isAdmin ? (
                  <li className="mt-1 border-t border-slate-200 bg-white pt-1">
                    <Link
                      href="/admin/users"
                      className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-teal-800 hover:bg-teal-50"
                      onClick={() => setOpen(null)}
                    >
                      <IconUsersAdmin />
                      <span>Users</span>
                    </Link>
                    <Link
                      href="/admin/permissions"
                      className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-teal-800 hover:bg-teal-50"
                      onClick={() => setOpen(null)}
                    >
                      <IconAccess />
                      <span>Access</span>
                    </Link>
                  </li>
                ) : null}
              </ul>
            </nav>
          </div>
        ) : null}
      </div>

      {showAlertsBell ? (
        <div className="relative">
          <button
            type="button"
            className={`${TRIGGER_FRAME} ${ringOpen("notifications")}`}
            aria-expanded={open === "notifications"}
            aria-haspopup="true"
            aria-controls="header-notifications-panel"
            onClick={() => pick("notifications")}
            aria-label="Notifications and alerts"
          >
            <IconBellTrigger />
            {alertCount > 0 ? (
              <>
                <span className="sr-only">{alertCount} active stock alerts</span>
                <span
                  className="absolute right-0.5 top-0.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-amber-400 px-0.5 text-[9px] font-bold leading-none text-amber-950 ring-[3px] ring-white"
                  aria-hidden
                >
                  {alertCount > 9 ? "9+" : alertCount}
                </span>
              </>
            ) : null}
          </button>
          {open === "notifications" ? (
            <div id="header-notifications-panel" className={panelClass} role="presentation">
              <div className="flex items-start gap-2 border-b border-amber-200/80 bg-amber-50 px-3 py-2.5 text-amber-900">
                <span className="mt-px shrink-0">
                  <IconBellTrigger />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-950">Notifications</p>
                  <p className="mt-0.5 text-[11px] text-amber-900/85">Low-stock alerts</p>
                </div>
              </div>
              <div className="bg-white px-3 py-3">
                {alertCount > 0 ? (
                  <p className="text-sm leading-snug text-slate-700">
                    <span className="font-semibold tabular-nums text-slate-900">{alertCount}</span>
                    {" catalogue "}
                    {alertCount === 1 ? "line is" : "lines are"}
                    {" at or below the threshold."}
                  </p>
                ) : (
                  <p className="text-sm text-slate-600">No alerts right now.</p>
                )}
                <Link
                  href="/alerts"
                  className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-teal-700 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-800"
                  onClick={() => setOpen(null)}
                >
                  <IconArrowTopRightOnSquare />
                  Open alerts
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="relative">
        <button
          type="button"
          className={`${TRIGGER_FRAME} ${ringOpen("account")}`}
          aria-expanded={open === "account"}
          aria-haspopup="true"
          aria-controls="header-account-panel"
          onClick={() => pick("account")}
          aria-label="Account menu"
        >
          <IconUserTrigger />
          <span className="sr-only">
            {user.name || user.email} — {user.role}
          </span>
        </button>
        {open === "account" ? (
          <div id="header-account-panel" className={panelClass} role="presentation">
            <div className="flex gap-2 border-b border-slate-200 bg-slate-50 px-3 py-3">
              <span className="shrink-0 text-slate-500">
                <IconUserTrigger />
              </span>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-slate-900">{user.name || "Signed in"}</div>
                <div className="truncate text-[11px] text-slate-600">{user.email}</div>
                <div className="mt-1 text-[11px] font-medium capitalize text-slate-500">{user.role}</div>
              </div>
            </div>
            <div className="bg-white px-2 py-1">
              {hasGrant(grantedPermissions, PERM.moduleAccount) ? (
                <Link
                  href="/settings"
                  className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium text-teal-800 hover:bg-teal-50"
                  onClick={() => setOpen(null)}
                >
                  <NavRowIcon href="/settings" />
                  Account settings
                </Link>
              ) : null}
            </div>
            <form action={logoutAction} className="border-t border-slate-200 bg-white px-2 pb-2 pt-2">
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
              >
                <IconArrowRightOnRectangle />
                Sign out
              </button>
            </form>
          </div>
        ) : null}
      </div>
    </div>
  );
}
