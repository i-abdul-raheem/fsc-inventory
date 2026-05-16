-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "kind" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "BillOfMaterialLine" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "kitItemId" TEXT NOT NULL,
    "componentItemId" TEXT NOT NULL,
    "qtyPerKit" INTEGER NOT NULL,
    CONSTRAINT "BillOfMaterialLine_kitItemId_fkey" FOREIGN KEY ("kitItemId") REFERENCES "Item" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BillOfMaterialLine_componentItemId_fkey" FOREIGN KEY ("componentItemId") REFERENCES "Item" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StockLevel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "itemId" TEXT NOT NULL,
    "qtyOnHand" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "StockLevel_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SalesOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerPoRef" TEXT,
    "customerName" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "internalPickSlipRef" TEXT,
    "fulfilledAt" DATETIME,
    "shippedAt" DATETIME,
    "shippedCarrierNote" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SalesOrderLine" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "salesOrderId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" INTEGER,
    CONSTRAINT "SalesOrderLine_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "SalesOrder" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SalesOrderLine_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Reservation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "salesOrderId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,
    CONSTRAINT "Reservation_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "SalesOrder" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Reservation_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProcurementNeed" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "salesOrderId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "qtyRequired" INTEGER NOT NULL,
    "qtyOutstanding" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "supplierReference" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProcurementNeed_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "SalesOrder" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProcurementNeed_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SalePosting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "salesOrderId" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "recognizedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "memo" TEXT,
    CONSTRAINT "SalePosting_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "SalesOrder" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Item_sku_key" ON "Item"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "BillOfMaterialLine_kitItemId_componentItemId_key" ON "BillOfMaterialLine"("kitItemId", "componentItemId");

-- CreateIndex
CREATE UNIQUE INDEX "StockLevel_itemId_key" ON "StockLevel"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "SalesOrder_internalPickSlipRef_key" ON "SalesOrder"("internalPickSlipRef");

-- CreateIndex
CREATE INDEX "SalesOrderLine_salesOrderId_idx" ON "SalesOrderLine"("salesOrderId");

-- CreateIndex
CREATE INDEX "Reservation_itemId_idx" ON "Reservation"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_salesOrderId_itemId_key" ON "Reservation"("salesOrderId", "itemId");

-- CreateIndex
CREATE INDEX "ProcurementNeed_salesOrderId_idx" ON "ProcurementNeed"("salesOrderId");

-- CreateIndex
CREATE INDEX "ProcurementNeed_itemId_idx" ON "ProcurementNeed"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "SalePosting_salesOrderId_key" ON "SalePosting"("salesOrderId");
