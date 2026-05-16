/**
 * Canonical permission codes (stored on Permission.code, embedded in JWT-free session checks).
 * Admins implicitly pass all checks; operators need explicit grants.
 */
export const PERM = {
  moduleDashboard: "module.dashboard",
  moduleOrders: "module.orders",
  moduleProcurement: "module.procurement",
  moduleInventory: "module.inventory",
  moduleCatalog: "module.catalog",
  moduleCustomers: "module.customers",
  moduleSellers: "module.sellers",
  moduleReports: "module.reports",
  moduleAlerts: "module.alerts",
  moduleAccount: "module.account",

  ordersPoCreate: "orders.po.create",
  ordersWorkflowSubmit: "orders.workflow.submit_allocation",
  ordersWorkflowRetry: "orders.workflow.procurement_retry",
  ordersWorkflowPick: "orders.workflow.issue_pick_slip",
  ordersWorkflowFulfill: "orders.workflow.fulfill",
  ordersWorkflowShip: "orders.workflow.ship",
  ordersWorkflowCancel: "orders.workflow.cancel",

  catalogComponentCreate: "catalog.components.create",
  catalogKitCreate: "catalog.kits.create",
  catalogItemEditCore: "catalog.item.edit_core",
  catalogItemStockQty: "catalog.item.stock_quantity",
  catalogItemAlertThreshold: "catalog.item.alert_threshold",
  catalogItemStdCost: "catalog.item.standard_cost",
  catalogItemKitBom: "catalog.item.kit_bom",

  inventoryReceive: "inventory.receive",
  inventoryAdjust: "inventory.adjust",

  tradingCustomerEdit: "trading.customers.edit",
  tradingSellerEdit: "trading.sellers.edit",

  accountProfileEdit: "account.profile_edit",
  accountPasswordChange: "account.password_change",
} as const;

export type PermissionCode = (typeof PERM)[keyof typeof PERM];

export const ALL_PERMISSION_CODES = Object.values(PERM) as PermissionCode[];

export type PermissionUiItem = { code: PermissionCode; label: string };

/** Grouped checklist for admins */
export const PERMISSION_UI_GROUPS: readonly { title: string; items: readonly PermissionUiItem[] }[] =
  [
    {
      title: "Pages — show in navigation and allow route access",
      items: [
        { code: PERM.moduleDashboard, label: "Dashboard" },
        { code: PERM.moduleOrders, label: "Orders" },
        { code: PERM.moduleProcurement, label: "Procurement" },
        { code: PERM.moduleInventory, label: "Inventory" },
        { code: PERM.moduleCatalog, label: "Catalogue" },
        { code: PERM.moduleCustomers, label: "Customers (KSA buyers)" },
        { code: PERM.moduleSellers, label: "Sellers (suppliers)" },
        { code: PERM.moduleReports, label: "Reports" },
        { code: PERM.moduleAlerts, label: "Low-stock alerts" },
        { code: PERM.moduleAccount, label: "Account settings" },
      ],
    },
    {
      title: "Orders — draft / workflow",
      items: [
        { code: PERM.ordersPoCreate, label: "Create new draft PO" },
        { code: PERM.ordersWorkflowSubmit, label: "Submit / allocate stock" },
        { code: PERM.ordersWorkflowRetry, label: "Retry allocation after receipts" },
        { code: PERM.ordersWorkflowPick, label: "Issue warehouse pick slip" },
        { code: PERM.ordersWorkflowFulfill, label: "Confirm fulfillment (deduct stock)" },
        { code: PERM.ordersWorkflowShip, label: "Mark shipped" },
        { code: PERM.ordersWorkflowCancel, label: "Cancel open order" },
      ],
    },
    {
      title: "Catalogue — forms and saves",
      items: [
        { code: PERM.catalogComponentCreate, label: "Add component" },
        { code: PERM.catalogKitCreate, label: "Add kit" },
        { code: PERM.catalogItemEditCore, label: "Edit SKU / name / active" },
        { code: PERM.catalogItemStockQty, label: "Set on-hand qty (catalogue)" },
        { code: PERM.catalogItemAlertThreshold, label: "Low-stock threshold" },
        { code: PERM.catalogItemStdCost, label: "Standard cost" },
        { code: PERM.catalogItemKitBom, label: "Kit BOM editor" },
      ],
    },
    {
      title: "Inventory operations",
      items: [
        { code: PERM.inventoryReceive, label: "Inbound receipt" },
        { code: PERM.inventoryAdjust, label: "Physical adjustment" },
      ],
    },
    {
      title: "Trading partners",
      items: [
        { code: PERM.tradingCustomerEdit, label: "Create / edit customers" },
        { code: PERM.tradingSellerEdit, label: "Create / edit sellers" },
      ],
    },
    {
      title: "Account — own profile only",
      items: [
        { code: PERM.accountProfileEdit, label: "Edit display name" },
        { code: PERM.accountPasswordChange, label: "Change password" },
      ],
    },
  ] as const;
