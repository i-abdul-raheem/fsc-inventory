import Link from "next/link";

import { PERMISSION_UI_GROUPS } from "@/lib/domain/permissions";
import { KSA } from "@/lib/region/constants";

const h2 = "mt-14 scroll-mt-24 text-lg font-semibold tracking-tight text-slate-900 first:mt-0 sm:text-xl";
const h3 = "mt-8 text-base font-semibold text-slate-900";
const p = "mt-3 text-sm leading-relaxed text-slate-700";
const ul = "mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-700";

const accessLabels = PERMISSION_UI_GROUPS.flatMap((g) => g.items);

export function HowToUseDocumentation() {
  return (
    <article className="text-slate-900">
      <p className="mb-6 text-sm" dir="ltr">
        <span className="text-slate-600">Language:</span>{" "}
        <Link href="/how-to-use/ur" className="font-medium text-teal-800 underline decoration-teal-800/30 underline-offset-2 hover:text-teal-950">
          اردو
        </Link>
      </p>

      <header className="border-b border-slate-200 pb-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-800">User guide</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">How to use IMS</h1>
        <p className={p}>
          IMS helps you run inventory and sales for {KSA.marketLabel}: customer orders, stock, buying shortfalls,
          receipts, your product list, and simple money reports. This guide explains what each part of the app is for.
          You can read it without signing in.
        </p>
      </header>

      <nav aria-label="Table of contents" className="mt-10 rounded-xl border border-slate-200 bg-slate-50/80 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">On this page</p>
        <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-teal-900">
          <li>
            <a className="underline decoration-teal-800/30 hover:text-teal-950" href="#overview">
              What IMS does
            </a>
          </li>
          <li>
            <a className="underline decoration-teal-800/30 hover:text-teal-950" href="#signin">
              Signing in and out
            </a>
          </li>
          <li>
            <a className="underline decoration-teal-800/30 hover:text-teal-950" href="#access">
              Who can see which areas
            </a>
          </li>
          <li>
            <a className="underline decoration-teal-800/30 hover:text-teal-950" href="#areas">
              Main areas of the app
            </a>
          </li>
          <li>
            <a className="underline decoration-teal-800/30 hover:text-teal-950" href="#orders">
              Working with orders
            </a>
          </li>
          <li>
            <a className="underline decoration-teal-800/30 hover:text-teal-950" href="#catalog">
              Catalogue, parts, and kits
            </a>
          </li>
          <li>
            <a className="underline decoration-teal-800/30 hover:text-teal-950" href="#procurement">
              Procurement and receiving
            </a>
          </li>
          <li>
            <a className="underline decoration-teal-800/30 hover:text-teal-950" href="#trading">
              Customers and sellers
            </a>
          </li>
          <li>
            <a className="underline decoration-teal-800/30 hover:text-teal-950" href="#reports">
              Reports and money
            </a>
          </li>
          <li>
            <a className="underline decoration-teal-800/30 hover:text-teal-950" href="#help">
              If something is missing or blocked
            </a>
          </li>
        </ol>
      </nav>

      <h2 id="overview" className={h2}>
        What IMS does
      </h2>
      <p className={p}>
        Think of IMS as your workspace for <strong>what you sell</strong>, <strong>what you hold in stock</strong>,{" "}
        <strong>what you still need to buy</strong>, and <strong>how orders move from quote to shipment</strong>. Amounts
        on orders and in reports use Saudi riyals; small amounts are often shown in <strong>halalas</strong> (100 halalas
        equals 1 riyal), similar to cents. Dates and times for operations use <strong>Saudi Arabia (Riyadh)</strong>{" "}
        where the screen says so.
      </p>
      <ul className={ul}>
        <li>
          <strong>Parts (components)</strong> are individual items you buy and count in the warehouse.
        </li>
        <li>
          <strong>Kits</strong> are products you sell that are built from a list of parts (a bill of materials). When you
          check stock for an order, the system works out how many of each underlying part you need.
        </li>
        <li>
          <strong>Orders</strong> are your customer jobs or purchase orders, moving step by step until they are shipped
          (or cancelled).
        </li>
      </ul>

      <h2 id="signin" className={h2}>
        Signing in and out
      </h2>
      <ul className={ul}>
        <li>Open the sign-in page, enter the email and password your administrator gave you, then continue.</li>
        <li>After sign-in you usually land on the <strong>Dashboard</strong>.</li>
        <li>
          To leave the app, open the <strong>account</strong> menu (person icon) in the top bar and choose sign out.
        </li>
        <li>
          This <strong>How to use</strong> page stays available without signing in, so you can share it with new
          colleagues.
        </li>
      </ul>

      <h2 id="access" className={h2}>
        Who can see which areas
      </h2>
      <p className={p}>
        <strong>Administrators</strong> can use everything, including creating other users and deciding what each person
        is allowed to do. <strong>Operators</strong> only see the menu items and buttons their administrator turned on
        for them. If you open something you are not allowed to use, you may see a short “access denied” message—that is
        normal; ask your administrator if you need more access.
      </p>
      <p className={p}>
        Below is the full list of <strong>abilities</strong> an administrator can assign. You will only see the ones that
        apply to you; you do not need to memorise this list.
      </p>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-700">
        {accessLabels.map((item) => (
          <li key={item.code}>{item.label}</li>
        ))}
      </ul>

      <h2 id="areas" className={h2}>
        Main areas of the app
      </h2>
      <p className={p}>
        Use the <strong>menu</strong> (three lines) at the top to move around. The names match what you do day to day.
      </p>

      <h3 className={h3}>Dashboard</h3>
      <p className={p}>
        A starting place with shortcuts, a snapshot of open work, and sometimes low-stock warnings—depending on what
        you are allowed to see.
      </p>

      <h3 className={h3}>Orders</h3>
      <p className={p}>
        Lists customer orders. You can open an order to see lines, status, and the <strong>next steps</strong> your
        role allows (for example submit for stock check, retry after goods arrive, pick slip, ship). You can start a{" "}
        <strong>new order</strong> from here when you have permission. When you create an order, you can pick a saved
        customer or type a one-off name.
      </p>

      <h3 className={h3}>Customers</h3>
      <p className={p}>
        A directory of buyers you sell to in Saudi Arabia—names, contacts, city, VAT notes, and so on. Linking an order
        to a customer helps you find that buyer again later.
      </p>

      <h3 className={h3}>Sellers</h3>
      <p className={p}>
        A directory of suppliers you buy parts from (often overseas). It is for reference and contacts; you still record
        incoming stock under <strong>Inventory</strong>.
      </p>

      <h3 className={h3}>Procurement</h3>
      <p className={p}>
        Shows where you are short of parts for orders that are waiting on supply. You can note supplier references,
        record receipts for a part when you are allowed to, and ask the system to try allocating stock again after
        goods arrive.
      </p>

      <h3 className={h3}>Inventory</h3>
      <p className={p}>
        Where you <strong>receive</strong> stock from suppliers and <strong>adjust</strong> counts after a stocktake.
        You also see how much is physically in the warehouse versus how much is already promised to open orders.
      </p>

      <h3 className={h3}>Catalogue</h3>
      <p className={p}>
        Your list of parts and kits: add items, edit names and codes, set low-stock warnings, costs used in reports, and
        the parts list for each kit.
      </p>

      <h3 className={h3}>Reports</h3>
      <p className={p}>
        Read-only views for profit, stock value, sales history, and similar topics in riyals. Each report screen
        explains what it includes; full tax filing and bank feeds are outside this app.
      </p>

      <h3 className={h3}>Alerts</h3>
      <p className={p}>
        Lists parts that have fallen below the low-stock level you set in the catalogue. A bell in the header may show
        a count when alerts are turned on for you.
      </p>

      <h3 className={h3}>Account</h3>
      <p className={p}>
        Change your display name or password when your administrator allows it. Your email address is shown for
        reference only.
      </p>

      <h3 className={h3}>Users and Access (administrators only)</h3>
      <p className={p}>
        Create or deactivate operator accounts and tick which areas each person may use. If you are not an
        administrator, you will not see these screens.
      </p>

      <h2 id="orders" className={h2}>
        Working with orders
      </h2>
      <p className={p}>An order usually moves through stages like these (labels on screen may vary slightly):</p>
      <ul className={ul}>
        <li>
          <strong>Draft</strong> — you are still editing lines and customer details.
        </li>
        <li>
          <strong>Waiting on parts</strong> — the system could not cover the full kit from current stock; procurement
          lists what is missing.
        </li>
        <li>
          <strong>Stock reserved / ready for warehouse</strong> — enough parts are available; the warehouse can follow
          pick instructions and then confirm that goods left the shelf.
        </li>
        <li>
          <strong>Fulfilled and shipped</strong> — picked quantities are deducted, and the order is marked out the door
          when you record shipment.
        </li>
        <li>
          <strong>Cancelled</strong> — the order will not continue; use this only when your role allows it and the order
          is not already finished.
        </li>
      </ul>
      <p className={p}>
        On each order page, use the <strong>Next steps</strong> section for the action that matches where the order is
        today. After new stock arrives, use the steps your administrator gave you (often on the order or on Procurement)
        so waiting orders can move forward again.
      </p>

      <h2 id="catalog" className={h2}>
        Catalogue, parts, and kits
      </h2>
      <ul className={ul}>
        <li>Every kit needs a clear list of parts and quantities before the system can check stock properly for sales.</li>
        <li>Standard costs on parts feed into reports when an order is fulfilled and shipped.</li>
        <li>
          “Available” stock is what is on hand minus what is already promised to other open orders—so you do not
          double-book the same box twice.
        </li>
      </ul>

      <h2 id="procurement" className={h2}>
        Procurement and receiving
      </h2>
      <ul className={ul}>
        <li>
          Procurement groups shortages by part so buyers can see which customers are waiting on the same component.
        </li>
        <li>
          When goods arrive, post a <strong>receipt</strong> in Inventory (or from Procurement if you have that
          shortcut). The system can then retry covering waiting orders automatically where possible.
        </li>
        <li>You can keep supplier purchase order or delivery notes on the procurement lines for your own traceability.</li>
      </ul>

      <h2 id="trading" className={h2}>
        Customers and sellers
      </h2>
      <ul className={ul}>
        <li>
          <strong>Customers</strong> hold the details of who you sell to; linking an order makes later lookups easier.
        </li>
        <li>
          <strong>Sellers</strong> hold who you buy from; use them as a Rolodex alongside your normal receiving process.
        </li>
      </ul>

      <h2 id="reports" className={h2}>
        Reports and money
      </h2>
      <ul className={ul}>
        <li>Reports round out the picture in riyals using the prices and costs you entered on orders and parts.</li>
        <li>
          They are meant for operational insight, not as a full tax return or bank reconciliation—read the short notes
          on each report for limits.
        </li>
        <li>The cash-flow style view is a placeholder until real bank data is connected in a future version.</li>
      </ul>

      <h2 id="help" className={h2}>
        If something is missing or blocked
      </h2>
      <ul className={ul}>
        <li>If a menu item or button is missing, your account may not have that ability—ask an administrator.</li>
        <li>If a page says you cannot access it, same thing: your administrator can adjust your access.</li>
        <li>For passwords, locked accounts, or training, contact the person who manages IMS in your organisation.</li>
      </ul>

      <p className={`${p} mt-12 border-t border-slate-200 pt-8 text-sm text-slate-600`}>
        Your administrator keeps this app aligned with how your company works. When processes change, they can update
        who may do what so the menus stay simple for everyone else.
      </p>
    </article>
  );
}
