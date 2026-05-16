import Link from "next/link";

import HideUnless from "@/components/rbac/HideUnless";
import { getPrincipal } from "@/lib/auth/rbac";
import { PERM } from "@/lib/domain/permissions";
import { prisma } from "@/lib/prisma";

export default async function CustomersIndexPage({
  searchParams,
}: {
  searchParams?: Promise<{ created?: string; err?: string }>;
}) {
  const qp = await searchParams;
  const principal = await getPrincipal();
  const canEdit = Boolean(principal?.permissions.has(PERM.tradingCustomerEdit));

  const rows = await prisma.customer.findMany({
    orderBy: [{ active: "desc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      tradingName: true,
      city: true,
      region: true,
      phone: true,
      active: true,
      _count: { select: { orders: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">Customers</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Buyers and sites you ship to in Saudi Arabia. Link a customer when creating a PO for a clear audit trail;
            you can still type a one-off name without saving a record.
          </p>
        </div>
        <HideUnless permission={PERM.tradingCustomerEdit}>
          <Link
            href="/customers/new"
            className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-800"
          >
            Add customer
          </Link>
        </HideUnless>
      </div>

      {qp?.created ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-950">
          Customer saved.
        </p>
      ) : null}
      {qp?.err ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">{qp.err}</p>
      ) : null}

      <section className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3 text-right tabular-nums">Orders</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right"> </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-600">
                  No customers yet.
                  {canEdit ? (
                    <>
                      {" "}
                      <Link href="/customers/new" className="font-medium text-teal-800 underline">
                        Add the first
                      </Link>
                      .
                    </>
                  ) : null}
                </td>
              </tr>
            ) : (
              rows.map((c) => (
                <tr key={c.id} className="border-t border-slate-100 hover:bg-slate-50/80">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900">{c.name}</div>
                    {c.tradingName ? (
                      <div className="text-xs text-slate-500">Trading as {c.tradingName}</div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {[c.city, c.region].filter(Boolean).join(", ") || "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{c.phone ?? "—"}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-slate-800">{c._count.orders}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        c.active
                          ? "inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-900"
                          : "inline-flex rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600"
                      }
                    >
                      {c.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/customers/${c.id}`}
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
