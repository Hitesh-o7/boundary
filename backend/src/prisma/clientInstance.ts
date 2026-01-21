import { PrismaClient } from "@prisma/client";

// PrismaClient is attached to the Node.js global type in development to
// prevent exhausting your database connection limit during hot-reloads.

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma: PrismaClient =
  global.prisma ||
  new PrismaClient({
    log: ["error", "warn"]
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

