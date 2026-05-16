import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent Turbopack from bundling Prisma into server chunks (breaks delegates like prisma.user).
  serverExternalPackages: ["@prisma/client"],
};

export default nextConfig;
