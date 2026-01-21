import { PrismaClient } from "@prisma/client";

// PrismaClient is attached to the Node.js global type in development to
// prevent exhausting your database connection limit during hot-reloads.

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Enhanced logging for production debugging
const logLevels = process.env.NODE_ENV === "production" 
  ? ["error", "warn"] 
  : ["query", "error", "warn"];

console.log(`[Prisma] Initializing with log levels: ${logLevels.join(", ")}`);
console.log(`[Prisma] DATABASE_URL set: ${!!process.env.DATABASE_URL}`);

export const prisma: PrismaClient =
  global.prisma ||
  new PrismaClient({
    log: logLevels as any,
    errorFormat: 'pretty',
  });

// Test connection on startup
prisma.$connect()
  .then(() => {
    console.log("[Prisma] ✅ Database connected successfully");
  })
  .catch((error) => {
    console.error("[Prisma] ❌ Database connection FAILED:", error);
    console.error("[Prisma] Error details:", JSON.stringify(error, null, 2));
  });

// Graceful shutdown
process.on('beforeExit', async () => {
  console.log("[Prisma] Disconnecting...");
  await prisma.$disconnect();
});

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

