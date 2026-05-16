-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "tradingName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "city" TEXT,
    "region" TEXT,
    "addressLine" TEXT,
    "vatNumber" TEXT,
    "notes" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Seller" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "tradingName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "city" TEXT,
    "country" TEXT DEFAULT 'Saudi Arabia',
    "vatNumber" TEXT,
    "notes" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SalesOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerId" TEXT,
    "customerPoRef" TEXT,
    "customerName" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "internalPickSlipRef" TEXT,
    "fulfilledAt" DATETIME,
    "shippedAt" DATETIME,
    "shippedCarrierNote" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SalesOrder_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_SalesOrder" ("createdAt", "customerName", "customerPoRef", "fulfilledAt", "id", "internalPickSlipRef", "shippedAt", "shippedCarrierNote", "status", "updatedAt") SELECT "createdAt", "customerName", "customerPoRef", "fulfilledAt", "id", "internalPickSlipRef", "shippedAt", "shippedCarrierNote", "status", "updatedAt" FROM "SalesOrder";
DROP TABLE "SalesOrder";
ALTER TABLE "new_SalesOrder" RENAME TO "SalesOrder";
CREATE UNIQUE INDEX "SalesOrder_internalPickSlipRef_key" ON "SalesOrder"("internalPickSlipRef");
CREATE INDEX "SalesOrder_customerId_idx" ON "SalesOrder"("customerId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
