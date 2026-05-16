import Link from "next/link";

import HideUnless from "@/components/rbac/HideUnless";
import { getPrincipal } from "@/lib/auth/rbac";
import { PERM } from "@/lib/domain/permissions";
import { prisma } from "@/lib/prisma";

export default async function SellersIndexPage({
  searchParams,
}: {
  searchParams?: Promise<{ err?: string }>;
}) {
  const qp = await searchParams;
  const principal = await getPrincipal();
  const canEdit = Boolean(principal?.permissions.has(PERM.tradingSellerEdit));

  const rows = await prisma.seller.findMany({
    orderBy: [{ active: "desc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      tradingName: true,
      city: true,
      country: true,
      phone: true,
      active: true,
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">Sellers</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Suppliers you buy components from (often outside KSA). Use this directory for contacts and VAT details;
            inbound stock is still posted on Inventory.
          </p>
        </div>
        <HideUnless permission={PERM.tradingSellerEdit}>
          <Link
            href="/sellers/new"
            className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-800"
          >
            Add seller
          </Link>
        </HideUnless>
      </div>

      {qp?.err ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">{qp.err}</p>
      ) : null}

      <section className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right"> </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-600">
                  No sellers yet.
                  {canEdit ? (
                    <>
                      {" "}
                      <Link href="/sellers/new" className="font-medium text-teal-800 underline">
                        Add the first
                      </Link>
                      .
                    </>
                  ) : null}
                </td>
              </tr>
            ) : (
              rows.map((s) => (
                <tr key={s.id} className="border-t border-slate-100 hover:bg-slate-50/80">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900">{s.name}</div>
                    {s.tradingName ? (
                      <div className="text-xs text-slate-500">Trading as {s.tradingName}</div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {[s.city, s.country].filter(Boolean).join(", ") || "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{s.phone ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        s.active
                          ? "inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-900"
                          : "inline-flex rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600"
                      }
                    >
                      {s.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/sellers/${s.id}`}
                      className="text-sm font-medium text-teal-800 underline decoration-teal-800/30 hover:text-teal-950"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
