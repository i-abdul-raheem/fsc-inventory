-- AlterTable
ALTER TABLE "Item" ADD COLUMN "standardCostCents" INTEGER;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SalePosting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "salesOrderId" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "recognizedAt" DATETIME,
    "revenueRecognizedCents" INTEGER NOT NULL DEFAULT 0,
    "costOfGoodsRecognizedCents" INTEGER NOT NULL DEFAULT 0,
    "memo" TEXT,
    CONSTRAINT "SalePosting_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "SalesOrder" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SalePosting" ("currency", "id", "memo", "recognizedAt", "salesOrderId") SELECT "currency", "id", "memo", "recognizedAt", "salesOrderId" FROM "SalePosting";
DROP TABLE "SalePosting";
ALTER TABLE "new_SalePosting" RENAME TO "SalePosting";
CREATE UNIQUE INDEX "SalePosting_salesOrderId_key" ON "SalePosting"("salesOrderId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
