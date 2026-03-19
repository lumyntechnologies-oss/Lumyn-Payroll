import { PrismaClient } from "@/lib/generated/prisma";

import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error(
      "❌ DATABASE_URL is not set. Add it to your .env file to enable database functionality."
    );
  }

  const adapter = new PrismaPg({
    connectionString: connectionString ?? "postgresql://localhost:5432/placeholder",
  });

  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Force rebuild cache clear
export default prisma;
