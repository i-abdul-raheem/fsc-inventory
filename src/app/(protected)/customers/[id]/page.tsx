import Link from "next/link";

import HideUnless from "@/components/rbac/HideUnless";
import { updateCustomer } from "@/actions/customers";
import { getPrincipal } from "@/lib/auth/rbac";
import { formatDateTimeKsa } from "@/lib/format/datetime";
import { PERM } from "@/lib/domain/permissions";
import { prisma } from "@/lib/prisma";
import { tradingForm as tf } from "@/lib/ui/tradingPartnerForms";

function prettyStatus(status: string) {
  return status.replaceAll("_", " ").toLowerCase();
}

function ActiveBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        active ? "bg-emerald-100 text-emerald-900" : "bg-slate-200 text-slate-700"
      }`}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

export default async function CustomerDetailPage(props: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ saved?: string; created?: string }>;
}) {
  const { id } = await props.params;
  const qp = await props.searchParams;
  const principal = await getPrincipal();
  const canEdit = Boolean(principal?.permissions.has(PERM.tradingCustomerEdit));
  const canOrders = Boolean(principal?.permissions.has(PERM.moduleOrders));

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        take: 25,
        select: {
          id: true,
          customerName: true,
          customerPoRef: true,
          status: true,
          createdAt: true,
        },
      },
    },
  });

  if (!customer) {
    return (
      <div className={tf.shell}>
        <div className={tf.formCard}>
          <div className="px-6 py-10 text-center sm:px-8">
            <p className="text-sm text-slate-600">This customer record could not be found.</p>
            <Link href="/customers" className={`${tf.backLink} mt-5 justify-center`}>
              <span aria-hidden className="text-base leading-none">
                ←
              </span>
              Back to customers
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const field = tf.field;
  const label = tf.label;
  const legend = tf.sectionLegend;

  return (
    <div className={tf.shell}>
      <header className={tf.pageHeader}>
        <Link href="/customers" className={tf.backLink}>
          <span aria-hidden className="text-base leading-none">
            ←
          </span>
          Customers
        </Link>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{customer.name}</h1>
            {customer.tradingName ? (
              <p className="mt-1 text-sm text-slate-600">Trading as {customer.tradingName}</p>
            ) : (
              <p className="mt-1 text-sm text-slate-600">Customer record</p>
            )}
          </div>
          <ActiveBadge active={customer.active} />
        </div>
      </header>

      {qp?.saved ? (
        <p className="rounded-xl border border-emerald-200/90 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-950">
          Changes saved.
        </p>
      ) : null}
      {qp?.created ? (
        <p className="rounded-xl border border-emerald-200/90 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-950">
          Customer created.
        </p>
      ) : null}

      {canEdit ? (
        <form action={updateCustomer} className={tf.formCard}>
          <input type="hidden" name="id" value={customer.id} />
          <div className={tf.formIntro}>
            <p className="text-xs font-medium text-slate-500">Edit customer</p>
            <p className="mt-1 text-sm text-slate-700">
              Update legal details, contacts, or VAT. Inactive customers stay on old POs but are hidden when creating
              new ones.
            </p>
          </div>

          <div className={tf.formBody}>
            <fieldset className="space-y-4">
              <legend className={legend}>Identity</legend>
              <div className="space-y-4">
                <label className="block">
                  <span className={label}>Legal or account name *</span>
                  <input name="name" required defaultValue={customer.name} autoComplete="organization" className={field} />
                </label>
                <label className="block">
                  <span className={label}>Trading name</span>
                  <span className="mt-0.5 block text-xs text-slate-500">Shown on quotes if different from legal name.</span>
                  <input
                    name="tradingName"
                    defaultValue={customer.tradingName ?? ""}
                    autoComplete="off"
                    className={field}
                  />
                </label>
              </div>
            </fieldset>

            <fieldset className="space-y-4">
              <legend className={legend}>Location</legend>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block sm:min-w-0">
                  <span className={label}>City</span>
                  <input name="city" defaultValue={customer.city ?? ""} autoComplete="address-level2" className={field} />
                </label>
                <label className="block sm:min-w-0">
                  <span className={label}>Region / province</span>
                  <input name="region" defaultValue={customer.region ?? ""} autoComplete="address-level1" className={field} />
                </label>
              </div>
              <label className="block">
                <span className={label}>Street or building</span>
                <input
                  name="addressLine"
                  defaultValue={customer.addressLine ?? ""}
                  autoComplete="street-address"
                  className={field}
                />
              </label>
            </fieldset>

            <fieldset className="space-y-4">
              <legend className={legend}>Contact</legend>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block sm:min-w-0">
                  <span className={label}>Email</span>
                  <input name="email" type="email" defaultValue={customer.email ?? ""} autoComplete="email" className={field} />
                </label>
                <label className="block sm:min-w-0">
                  <span className={label}>Phone</span>
                  <input name="phone" type="tel" defaultValue={customer.phone ?? ""} autoComplete="tel" className={field} />
                </label>
              </div>
            </fieldset>

            <fieldset className="space-y-4">
              <legend className={legend}>Tax, notes &amp; status</legend>
              <label className="block">
                <span className={label}>VAT registration number</span>
                <span className="mt-0.5 block text-xs text-slate-500">Saudi VAT TRN is 15 digits when registered.</span>
                <input
                  name="vatNumber"
                  defaultValue={customer.vatNumber ?? ""}
                  inputMode="numeric"
                  autoComplete="off"
                  className={`${field} font-mono text-[13px] tracking-wide`}
                  maxLength={20}
                />
              </label>
              <label className="block">
                <span className={label}>Internal notes</span>
                <textarea name="notes" rows={4} defaultValue={customer.notes ?? ""} className={`${field} min-h-[5.5rem] resize-y`} />
              </label>
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm">
                <input
                  type="checkbox"
                  name="active"
                  defaultChecked={customer.active}
                  className="mt-0.5 size-4 rounded border-slate-300 text-teal-700 focus:ring-teal-600/30"
                />
                <span>
                  <span className={label}>Active</span>
                  <span className="mt-0.5 block text-xs font-normal text-slate-500">When off, this customer is hidden when creating new POs.</span>
                </span>
              </label>
            </fieldset>
          </div>

          <div className={tf.formFooter}>
            <Link href="/customers" className={tf.btnSecondary}>
              Cancel
            </Link>
            <button type="submit" className={tf.btnPrimary}>
              Save changes
            </button>
          </div>
        </form>
      ) : (
        <div className={tf.formCard}>
          <div className={tf.formIntro}>
            <p className="text-xs font-medium text-slate-500">Overview</p>
            <p className="mt-1 text-sm text-slate-700">You can view this record but not edit it.</p>
          </div>
          <div className={`${tf.formBody} space-y-6`}>
            <dl className="grid gap-6 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Location</dt>
                <dd className="mt-1.5 text-sm text-slate-900">
                  {[customer.city, customer.region].filter(Boolean).join(", ") || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Phone</dt>
                <dd className="mt-1.5 text-sm text-slate-900">{customer.phone ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</dt>
                <dd className="mt-1.5 break-all text-sm text-slate-900">{customer.email ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">VAT</dt>
                <dd className="mt-1.5 font-mono text-sm text-slate-900">{customer.vatNumber ?? "—"}</dd>
              </div>
            </dl>
            {customer.addressLine ? (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Address</p>
                <p className="mt-1.5 text-sm text-slate-800">{customer.addressLine}</p>
              </div>
            ) : null}
            {customer.notes ? (
              <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Notes</p>
                <p className="mt-2 whitespace-pre-wrap text-sm text-slate-800">{customer.notes}</p>
              </div>
            ) : null}
          </div>
        </div>
      )}

      <section className={tf.formCard}>
        <div className={tf.formIntro}>
          <h2 className="text-sm font-semibold text-slate-900">Recent POs</h2>
          <p className="mt-1 text-xs text-slate-600">Orders linked to this customer (most recent first).</p>
        </div>
        <div className="border-t border-slate-100">
          {customer.orders.length === 0 ? (
            <p className="px-6 py-8 text-sm text-slate-600 sm:px-8">No linked orders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[28rem] text-left text-sm">
                <thead className="border-b border-slate-100 bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-6 py-3 pr-3 sm:px-8">Customer on PO</th>
                    <th className="py-3 pr-3">Their ref</th>
                    <th className="py-3 pr-3">Stage</th>
                    <th className="px-6 py-3 text-right sm:px-8">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {customer.orders.map((o) => (
                    <tr key={o.id} className="border-t border-slate-100 transition hover:bg-slate-50/60">
                      <td className="px-6 py-3 pr-3 sm:px-8">
                        {canOrders ? (
                          <Link href={`/orders/${o.id}`} className="font-medium text-teal-800 underline-offset-2 hover:underline">
                            {o.customerName}
                          </Link>
                        ) : (
                          <span className="font-medium text-slate-900">{o.customerName}</span>
                        )}
                      </td>
                      <td className="py-3 pr-3 text-slate-700">{o.customerPoRef ?? "—"}</td>
                      <td className="py-3 pr-3">
                        <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium capitalize text-slate-800">
                          {prettyStatus(o.status)}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right text-xs text-slate-600 sm:px-8">{formatDateTimeKsa(o.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <HideUnless permission={PERM.ordersPoCreate}>
            <p className="border-t border-slate-100 px-6 py-4 text-xs text-slate-600 sm:px-8">
              <Link href="/orders/new" className="font-medium text-teal-800 underline-offset-2 hover:underline">
                New PO
              </Link>{" "}
              — pick this customer from the directory to attach the next order.
            </p>
          </HideUnless>
        </div>
      </section>
    </div>
  );
}
