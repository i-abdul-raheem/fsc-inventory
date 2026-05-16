import Link from "next/link";

import { updateSeller } from "@/actions/sellers";
import { getPrincipal } from "@/lib/auth/rbac";
import { PERM } from "@/lib/domain/permissions";
import { prisma } from "@/lib/prisma";
import { tradingForm as tf } from "@/lib/ui/tradingPartnerForms";

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

export default async function SellerDetailPage(props: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ saved?: string; created?: string }>;
}) {
  const { id } = await props.params;
  const qp = await props.searchParams;
  const principal = await getPrincipal();
  const canEdit = Boolean(principal?.permissions.has(PERM.tradingSellerEdit));

  const seller = await prisma.seller.findUnique({ where: { id } });

  if (!seller) {
    return (
      <div className={tf.shell}>
        <div className={tf.formCard}>
          <div className="px-6 py-10 text-center sm:px-8">
            <p className="text-sm text-slate-600">This seller record could not be found.</p>
            <Link href="/sellers" className={`${tf.backLink} mt-5 justify-center`}>
              <span aria-hidden className="text-base leading-none">
                ←
              </span>
              Back to sellers
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
        <Link href="/sellers" className={tf.backLink}>
          <span aria-hidden className="text-base leading-none">
            ←
          </span>
          Sellers
        </Link>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{seller.name}</h1>
            {seller.tradingName ? (
              <p className="mt-1 text-sm text-slate-600">Trading as {seller.tradingName}</p>
            ) : (
              <p className="mt-1 text-sm text-slate-600">Seller record</p>
            )}
          </div>
          <ActiveBadge active={seller.active} />
        </div>
      </header>

      {qp?.saved ? (
        <p className="rounded-xl border border-emerald-200/90 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-950">
          Changes saved.
        </p>
      ) : null}
      {qp?.created ? (
        <p className="rounded-xl border border-emerald-200/90 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-950">
          Seller created.
        </p>
      ) : null}

      {canEdit ? (
        <form action={updateSeller} className={tf.formCard}>
          <input type="hidden" name="id" value={seller.id} />
          <div className={tf.formIntro}>
            <p className="text-xs font-medium text-slate-500">Edit seller</p>
            <p className="mt-1 text-sm text-slate-700">
              Update supplier details or mark inactive if you no longer buy from them.
            </p>
          </div>

          <div className={tf.formBody}>
            <fieldset className="space-y-4">
              <legend className={legend}>Identity</legend>
              <div className="space-y-4">
                <label className="block">
                  <span className={label}>Supplier or legal name *</span>
                  <input name="name" required defaultValue={seller.name} autoComplete="organization" className={field} />
                </label>
                <label className="block">
                  <span className={label}>Trading name</span>
                  <span className="mt-0.5 block text-xs text-slate-500">Shown on paperwork if different from legal name.</span>
                  <input name="tradingName" defaultValue={seller.tradingName ?? ""} autoComplete="off" className={field} />
                </label>
              </div>
            </fieldset>

            <fieldset className="space-y-4">
              <legend className={legend}>Location</legend>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block sm:min-w-0">
                  <span className={label}>City</span>
                  <input name="city" defaultValue={seller.city ?? ""} autoComplete="address-level2" className={field} />
                </label>
                <label className="block sm:min-w-0">
                  <span className={label}>Country</span>
                  <input name="country" defaultValue={seller.country ?? "Saudi Arabia"} autoComplete="country-name" className={field} />
                </label>
              </div>
            </fieldset>

            <fieldset className="space-y-4">
              <legend className={legend}>Contact</legend>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block sm:min-w-0">
                  <span className={label}>Email</span>
                  <input name="email" type="email" defaultValue={seller.email ?? ""} autoComplete="email" className={field} />
                </label>
                <label className="block sm:min-w-0">
                  <span className={label}>Phone</span>
                  <input name="phone" type="tel" defaultValue={seller.phone ?? ""} autoComplete="tel" className={field} />
                </label>
              </div>
            </fieldset>

            <fieldset className="space-y-4">
              <legend className={legend}>Tax, notes &amp; status</legend>
              <label className="block">
                <span className={label}>VAT / tax ID</span>
                <span className="mt-0.5 block text-xs text-slate-500">Local TRN or overseas tax reference.</span>
                <input
                  name="vatNumber"
                  defaultValue={seller.vatNumber ?? ""}
                  autoComplete="off"
                  className={`${field} font-mono text-[13px] tracking-wide`}
                  maxLength={40}
                />
              </label>
              <label className="block">
                <span className={label}>Internal notes</span>
                <textarea name="notes" rows={4} defaultValue={seller.notes ?? ""} className={`${field} min-h-[5.5rem] resize-y`} />
              </label>
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm">
                <input
                  type="checkbox"
                  name="active"
                  defaultChecked={seller.active}
                  className="mt-0.5 size-4 rounded border-slate-300 text-teal-700 focus:ring-teal-600/30"
                />
                <span>
                  <span className={label}>Active</span>
                  <span className="mt-0.5 block text-xs font-normal text-slate-500">When off, this seller is hidden when picking suppliers.</span>
                </span>
              </label>
            </fieldset>
          </div>

          <div className={tf.formFooter}>
            <Link href="/sellers" className={tf.btnSecondary}>
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
                <dd className="mt-1.5 text-sm text-slate-900">{[seller.city, seller.country].filter(Boolean).join(", ") || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Phone</dt>
                <dd className="mt-1.5 text-sm text-slate-900">{seller.phone ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</dt>
                <dd className="mt-1.5 break-all text-sm text-slate-900">{seller.email ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">VAT / tax ID</dt>
                <dd className="mt-1.5 font-mono text-sm text-slate-900">{seller.vatNumber ?? "—"}</dd>
              </div>
            </dl>
            {seller.notes ? (
              <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Notes</p>
                <p className="mt-2 whitespace-pre-wrap text-sm text-slate-800">{seller.notes}</p>
              </div>
            ) : null}
          </div>
        </div>
      )}

      <section className={tf.formCard}>
        <div className={tf.formIntro}>
          <h2 className="text-sm font-semibold text-slate-900">Receiving stock</h2>
          <p className="mt-1 text-xs text-slate-600">
            Receipts are logged under inventory. Use supplier references on procurement lines or notes here to tie
            shipments to this seller.
          </p>
        </div>
        <div className="border-t border-slate-100 px-6 py-5 sm:px-8">
          <Link
            href="/inventory"
            className="inline-flex items-center gap-2 text-sm font-medium text-teal-800 underline-offset-2 hover:underline"
          >
            Open inventory
            <span aria-hidden>→</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
