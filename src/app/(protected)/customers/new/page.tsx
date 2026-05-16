import Link from "next/link";

import Notice from "@/components/Notice";
import { createCustomer } from "@/actions/customers";
import { requireRoute } from "@/lib/auth/rbac";
import { PERM } from "@/lib/domain/permissions";
import { tradingForm as tf } from "@/lib/ui/tradingPartnerForms";

export default async function NewCustomerPage({
  searchParams,
}: {
  searchParams?: Promise<{ err?: string }>;
}) {
  await requireRoute(PERM.tradingCustomerEdit);
  const qp = await searchParams;

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
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">New customer</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
          Save buyers and sites in Saudi Arabia so you can link them on new POs. Fields are optional except the legal
          name.
        </p>
      </header>

      {qp?.err === "name" ? <Notice message="Enter a customer or site name." /> : null}

      <form action={createCustomer} className={tf.formCard}>
        <div className={tf.formIntro}>
          <p className="text-xs font-medium text-slate-500">Customer record</p>
          <p className="mt-1 text-sm text-slate-700">VAT (15-digit TRN) is optional until you have it.</p>
        </div>

        <div className={tf.formBody}>
          <fieldset className="space-y-4">
            <legend className={legend}>Identity</legend>
            <div className="space-y-4">
              <label className="block">
                <span className={label}>Legal or account name *</span>
                <input
                  name="name"
                  required
                  autoComplete="organization"
                  className={field}
                  placeholder="e.g. ACME Manufacturing LLC"
                />
              </label>
              <label className="block">
                <span className={label}>Trading name</span>
                <span className="mt-0.5 block text-xs text-slate-500">Shown on quotes if different from legal name.</span>
                <input
                  name="tradingName"
                  autoComplete="off"
                  className={field}
                  placeholder="Brand or store name"
                />
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
                <span className={label}>Region / province</span>
                <input name="region" autoComplete="address-level1" className={field} placeholder="Riyadh Province" />
              </label>
            </div>
            <label className="block">
              <span className={label}>Street or building</span>
              <input
                name="addressLine"
                autoComplete="street-address"
                className={field}
                placeholder="District, street, unit…"
              />
            </label>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className={legend}>Contact</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block sm:min-w-0">
                <span className={label}>Email</span>
                <input name="email" type="email" autoComplete="email" className={field} placeholder="accounts@…" />
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
              <span className={label}>VAT registration number</span>
              <span className="mt-0.5 block text-xs text-slate-500">Saudi VAT TRN is 15 digits when registered.</span>
              <input
                name="vatNumber"
                inputMode="numeric"
                autoComplete="off"
                className={`${field} font-mono text-[13px] tracking-wide`}
                placeholder="300000000000003"
                maxLength={20}
              />
            </label>
            <label className="block">
              <span className={label}>Internal notes</span>
              <textarea
                name="notes"
                rows={4}
                className={`${field} min-h-[5.5rem] resize-y`}
                placeholder="Payment terms, delivery gate, buyer contact…"
              />
            </label>
          </fieldset>
        </div>

        <div className={tf.formFooter}>
          <Link href="/customers" className={tf.btnSecondary}>
            Cancel
          </Link>
          <button type="submit" className={tf.btnPrimary}>
            Save customer
          </button>
        </div>
      </form>
    </div>
  );
}
