import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function createClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

/** Delegates that must exist for this app revision (avoids stale global client after `prisma generate`). */
const REQUIRED_DELEGATES = [
  "userPermission",
  "permission",
  "customer",
  "seller",
  "salesOrder",
  "item",
] as const;

function isMissingDelegate(client: unknown, key: string): boolean {
  const delegate = (client as Record<string, { findMany?: unknown } | undefined>)[key];
  return delegate == null || typeof delegate.findMany !== "function";
}

function isStalePrismaClient(client: PrismaClient | undefined): boolean {
  if (!client) return true;
  for (const key of REQUIRED_DELEGATES) {
    if (isMissingDelegate(client, key)) return true;
  }
  return false;
}

function getPrismaSingleton(): PrismaClient {
  let client = globalForPrisma.prisma;
  if (!isStalePrismaClient(client)) {
    return client!;
  }

  if (client) {
    void client.$disconnect().catch(() => {});
  }

  client = createClient();
  globalForPrisma.prisma = client;

  if (isStalePrismaClient(client)) {
    globalForPrisma.prisma = undefined;
    throw new Error(
      'Prisma Client is missing models (e.g. "customer"). Run `npx prisma generate`, then restart `next dev`.',
    );
  }

  return client;
}

/**
 * Lazy proxy so every top-level access re-checks the singleton. Turbopack/HMR can keep a global `PrismaClient`
 * instance from before `prisma generate`; without this, `prisma.customer` stays undefined until process restart.
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrismaSingleton();
    const value = Reflect.get(client, prop, client);
    if (typeof value === "function") {
      return (value as (...args: unknown[]) => unknown).bind(client);
    }
    return value;
  },
});
