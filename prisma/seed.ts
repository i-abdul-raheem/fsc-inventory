import bcrypt from "bcryptjs";
import { Prisma, PrismaClient } from "@prisma/client";

import { ITEM_KIND } from "../src/lib/domain/status";
import { USER_ROLE } from "../src/lib/domain/roles";
import { syncPermissionRows } from "../src/lib/auth/syncPermissions";

function assertEnv() {
  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = "file:./dev.db";
    console.warn("DATABASE_URL unset; falling back to file:./dev.db for seed");
  }
}

const prisma = new PrismaClient();

async function main() {
  assertEnv();

  await prisma.user.deleteMany();
  await prisma.billOfMaterialLine.deleteMany();
  await prisma.salePosting.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.procurementNeed.deleteMany();
  await prisma.salesOrderLine.deleteMany();
  await prisma.salesOrder.deleteMany();
  // Raw deletes: seed runs via tsx and some environments have a PrismaClient type/cache without
  // newer delegates until `prisma generate` runs; $executeRaw is always on the client.
  await prisma.$executeRaw(Prisma.sql`DELETE FROM "Customer"`);
  await prisma.$executeRaw(Prisma.sql`DELETE FROM "Seller"`);
  await prisma.stockLevel.deleteMany();
  await prisma.item.deleteMany();

  await syncPermissionRows(prisma);

  const seedEmail = process.env.SEED_ADMIN_EMAIL?.toLowerCase().trim() || "admin@example.com";
  const seedPw = process.env.SEED_ADMIN_PASSWORD || "ChangeMe!IMS";

  await prisma.user.create({
    data: {
      email: seedEmail,
      name: "Seed administrator",
      role: USER_ROLE.ADMIN,
      passwordHash: await bcrypt.hash(seedPw, 11),
    },
  });
  console.log(`Seeded admin ${seedEmail} — password from SEED_ADMIN_PASSWORD or ChangeMe!IMS`);

  const cA = await prisma.item.create({
    data: {
      sku: "COMP-A",
      name: "Solenoid actuator",
      kind: ITEM_KIND.COMPONENT,
      description: "Sample component used in seeded kit",
      lowStockAlertBelow: 118,
      standardCostCents: 450,
      stock: { create: { qtyOnHand: 120 } },
    },
  });

  const cB = await prisma.item.create({
    data: {
      sku: "COMP-B",
      name: "Controller board",
      kind: ITEM_KIND.COMPONENT,
      description: "",
      lowStockAlertBelow: 48,
      standardCostCents: 980,
      stock: { create: { qtyOnHand: 45 } },
    },
  });

  await prisma.item.create({
    data: {
      sku: "KIT-CTRL",
      name: "Industrial control starter kit",
      kind: ITEM_KIND.KIT,
      bomAsKit: {
        create: [
          { componentItemId: cA.id, qtyPerKit: 2 },
          { componentItemId: cB.id, qtyPerKit: 1 },
        ],
      },
    },
  });

  await prisma.item.create({
    data: {
      sku: "COMP-SPARE",
      name: "Spare fasteners pack",
      kind: ITEM_KIND.COMPONENT,
      standardCostCents: 35,
      stock: { create: { qtyOnHand: 400 } },
    },
  });

  await prisma.customer.create({
    data: {
      name: "National Manufacturing Co.",
      tradingName: "NMC",
      city: "Riyadh",
      region: "Riyadh Province",
      vatNumber: "300000000000003",
      phone: "+966112345678",
      email: "procurement@example.sa",
      notes: "Sample KSA buyer for demos.",
    },
  });

  await prisma.seller.create({
    data: {
      name: "Asia Pacific Components Ltd",
      tradingName: "APC",
      country: "China",
      city: "Shenzhen",
      email: "sales@apc.example",
      notes: "Sample overseas component supplier.",
    },
  });

  console.log("Seeded catalogue + stock baseline.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exitCode = 1;
  });
