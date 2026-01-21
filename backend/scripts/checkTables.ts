/**
 * Diagnostic script to check actual PostgreSQL table names
 * Run this connected to your production database to see table names
 */

import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient({
  log: ["query", "error", "warn"],
});

async function checkTables() {
  console.log("Checking PostgreSQL tables...\n");
  
  try {
    // Query to list all tables in public schema
    const tables = await prisma.$queryRaw<{ tablename: string }[]>`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `;

    console.log("Tables found in public schema:");
    console.log("================================");
    tables.forEach((t) => {
      console.log(`  - ${t.tablename}`);
    });
    console.log(`\nTotal: ${tables.length} tables\n`);

    // Check for expected tables (case variations)
    const expectedTables = [
      { model: "Season", variants: ["Season", "season", "seasons"] },
      { model: "Team", variants: ["Team", "team", "teams"] },
      { model: "Player", variants: ["Player", "player", "players"] },
      { model: "Match", variants: ["Match", "match", "matches"] },
      { model: "Delivery", variants: ["Delivery", "delivery", "deliveries"] },
    ];

    console.log("Checking table name mappings:");
    console.log("================================");
    
    const tableNames = tables.map((t) => t.tablename);
    
    for (const expected of expectedTables) {
      const found = expected.variants.find((v) => tableNames.includes(v));
      if (found) {
        console.log(`✅ ${expected.model} → Found as: "${found}"`);
        if (found !== expected.model) {
          console.log(`   ⚠️  MISMATCH! Add to schema: @@map("${found}")`);
        }
      } else {
        console.log(`❌ ${expected.model} → NOT FOUND`);
        console.log(`   Expected one of: ${expected.variants.join(", ")}`);
      }
    }

    console.log("\n================================");
    console.log("\nIf mismatches exist, update prisma/schema.prisma");
    console.log('Add @@map("actual_table_name") to each model');

  } catch (error: any) {
    console.error("\n❌ ERROR checking tables:", error);
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    
    if (error.code === "P1001") {
      console.error("\n⚠️  Cannot connect to database!");
      console.error("Check DATABASE_URL environment variable");
    }
  } finally {
    await prisma.$disconnect();
  }
}

checkTables();
