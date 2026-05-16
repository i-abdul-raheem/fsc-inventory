import { redirect } from "next/navigation";
import Link from "next/link";

import { loginAction } from "@/actions/auth";
import Notice from "@/components/Notice";
import FeasibleBrandLogo from "@/components/FeasibleBrandLogo";
import { KSA } from "@/lib/region/constants";
import { getSession } from "@/lib/auth/session";

const errMsgs: Record<string, string> = {
  missing: "Enter your email and password.",
  failed: "Incorrect email or password, or this account is inactive.",
  config: "Server is missing AUTH_SECRET — check environment configuration.",
  inactive: "This account is inactive. Contact an administrator.",
};

export default async function LoginPage(props: {
  searchParams?: Promise<{ err?: string; callbackUrl?: string }>;
}) {
  const sp = await props.searchParams;
  const session = await getSession();
  if (session) {
    redirect("/");
  }

  const msg =
    sp?.err && errMsgs[sp.err] ? errMsgs[sp.err] : sp?.err && !errMsgs[sp.err] ? sp.err : null;

  let callbackUrl = typeof sp?.callbackUrl === "string" ? sp.callbackUrl : "/";
  if (!callbackUrl.startsWith("/") || callbackUrl.startsWith("//")) callbackUrl = "/";

  return (
    <div className="w-full max-w-[22rem]">
      <div className="rounded-2xl border border-slate-200/90 bg-[color:var(--surface)] p-8 shadow-md shadow-slate-900/5 ring-1 ring-slate-900/5">
        <div className="flex flex-col items-center text-center">
          <FeasibleBrandLogo variant="mark" heightClass="h-12 w-auto" className="shrink-0" priority />
          <p className="mt-4 text-lg font-semibold tracking-tight text-slate-900">IMS</p>
          <p className="mt-1 text-sm text-slate-500">Sign in · {KSA.marketLabel}</p>
        </div>

        {msg ? (
          <div className="mt-6">
            <Notice message={msg} />
          </div>
        ) : null}

        <form action={loginAction} className="mt-8 space-y-5">
          <input type="hidden" name="callbackUrl" value={callbackUrl.slice(0, 512)} />
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input
              required
              name="email"
              type="email"
              autoComplete="username"
              placeholder="you@company.com"
              className="mt-1.5 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Password</span>
            <input
              required
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              className="mt-1.5 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
            />
          </label>
          <button
            type="submit"
            className="w-full rounded-lg bg-teal-700 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 active:bg-teal-900"
          >
            Sign in
          </button>
        </form>
      </div>
      <p className="mt-6 text-center text-xs text-slate-500">English UI · operations times use Asia/Riyadh where shown</p>
      <p className="mt-4 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-sm">
        <Link href="/how-to-use" className="font-medium text-teal-800 underline decoration-teal-800/35 underline-offset-2 hover:text-teal-950">
          How to use IMS — full documentation
        </Link>
        <span className="text-slate-300" aria-hidden>
          ·
        </span>
        <Link href="/how-to-use/ur" className="font-medium text-teal-800 underline decoration-teal-800/35 underline-offset-2 hover:text-teal-950">
          اردو میں
        </Link>
      </p>
    </div>
  );
}
