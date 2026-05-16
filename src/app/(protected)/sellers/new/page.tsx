import Link from "next/link";

import Notice from "@/components/Notice";
import { createSeller } from "@/actions/sellers";
import { requireRoute } from "@/lib/auth/rbac";
import { PERM } from "@/lib/domain/permissions";
import { tradingForm as tf } from "@/lib/ui/tradingPartnerForms";

export default async function NewSellerPage({
  searchParams,
}: {
  searchParams?: Promise<{ err?: string }>;
}) {
  await requireRoute(PERM.tradingSellerEdit);
  const qp = await searchParams;

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
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">New seller</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
          Suppliers of components and materials. Country defaults to Saudi Arabia for local vendors; change it for
          overseas factories.
        </p>
      </header>

      {qp?.err === "name" ? <Notice message="Enter the supplier or factory name." /> : null}

      <form action={createSeller} className={tf.formCard}>
        <div className={tf.formIntro}>
          <p className="text-xs font-medium text-slate-500">Seller record</p>
          <p className="mt-1 text-sm text-slate-700">VAT / tax ID is optional until you have it.</p>
        </div>

        <div className={tf.formBody}>
          <fieldset className="space-y-4">
            <legend className={legend}>Identity</legend>
            <div className="space-y-4">
              <label className="block">
                <span className={label}>Supplier or legal name *</span>
                <input
                  name="name"
                  required
                  autoComplete="organization"
                  className={field}
                  placeholder="e.g. Shenzhen Components Co."
                />
              </label>
              <label className="block">
                <span className={label}>Trading name</span>
                <span className="mt-0.5 block text-xs text-slate-500">Shown on paperwork if different from legal name.</span>
                <input name="tradingName" autoComplete="off" className={field} placeholder="Brand or factory line" />
              </label>
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className={legend}>Location</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block sm:min-w-0">
                <span className={label}>City</span>
                <input name="city" autoComplete="address-level2" className={field} placeholder="Riyadh" />
              </label>
              <label className="block sm:min-w-0">
                <span className={label}>Country</span>
                <input name="country" autoComplete="country-name" className={field} defaultValue="Saudi Arabia" />
              </label>
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className={legend}>Contact</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block sm:min-w-0">
                <span className={label}>Email</span>
                <input name="email" type="email" autoComplete="email" className={field} placeholder="sales@…" />
              </label>
              <label className="block sm:min-w-0">
                <span className={label}>Phone</span>
                <input name="phone" type="tel" autoComplete="tel" className={field} placeholder="+966 …" />
              </label>
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className={legend}>Tax &amp; notes</legend>
            <label className="block">
              <span className={label}>VAT / tax ID</span>
              <span className="mt-0.5 block text-xs text-slate-500">Local TRN or overseas tax reference.</span>
              <input name="vatNumber" autoComplete="off" className={`${field} font-mono text-[13px] tracking-wide`} maxLength={40} />
            </label>
            <label className="block">
              <span className={label}>Internal notes</span>
              <textarea
                name="notes"
                rows={4}
                className={`${field} min-h-[5.5rem] resize-y`}
                placeholder="Lead times, Incoterms, bank details…"
              />
            </label>
          </fieldset>
        </div>

        <div className={tf.formFooter}>
          <Link href="/sellers" className={tf.btnSecondary}>
            Cancel
          </Link>
          <button type="submit" className={tf.btnPrimary}>
            Save seller
          </button>
        </div>
      </form>
    </div>
  );
}
