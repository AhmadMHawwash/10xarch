import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { neon } from "@neondatabase/serverless";
import { migrate as neonHttpMigrate } from "drizzle-orm/neon-http/migrator";
import { config as dotenvConfig } from "dotenv"; // Use only programmatic loading
import { drizzle as neonHttpDrizzle } from "drizzle-orm/neon-http"; // Aliased for clarity

const runProdMigrate = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("Missing DATABASE_URL");
  }

  const sql = postgres(process.env.DATABASE_URL, { max: 1 });

  try {
    // Run migrations
    console.log("⏳ Running migrations...");
    const db = drizzle(sql);
    const start = Date.now();
    await migrate(db, { migrationsFolder: "drizzle" });
    const end = Date.now();
    console.log(`✅ Migrations completed in ${end - start}ms`);
  } catch (error) {
    console.error("❌ Migration failed");
    console.error(error);
    process.exit(1);
  } finally {
    await sql.end();
  }

  process.exit(0);
};

const runMigrate2 = async () => {
  if (!process.env.DATABASE_URL) {
    console.error(
      "❌ Error: DATABASE_URL is not set. Please check your .env.local file.",
    );
    process.exit(1);
  }

  console.log("💡 DATABASE_URL used by script:", process.env.DATABASE_URL); // Log the DATABASE_URL
  const sql = neon(process.env.DATABASE_URL); // Add ! to assert DATABASE_URL is not null
  const db = neonHttpDrizzle(sql); // Use aliased drizzle for Neon

  try {
    console.log("⏳ Running Neon migrations...");
    const start = Date.now();
    await neonHttpMigrate(db, { migrationsFolder: "drizzle" }); // Use aliased migrate for Neon
    const end = Date.now();
    console.log(`✅ Neon migrations completed in ${end - start}ms`);
  } catch (error) {
    console.error("❌ Error during Neon migration:", error);
    process.exit(1);
  }
  process.exit(0); // Ensure successful exit
};

// Load the correct env file based on NODE_ENV
if (process.env.NODE_ENV === "production") {
  dotenvConfig({ path: ".env" });
  console.log("🌎 Loaded .env for production");
  runProdMigrate().catch((err) => {
    console.error("❌ Migration failed");
    console.error(err);
    process.exit(1);
  });
} else {
  dotenvConfig({ path: ".env.local" });
  console.log("💻 Loaded .env.local for development");
  runMigrate2().catch((err) => {
    console.error("❌ Neon migration failed (outer catch)");
    console.error(err);
    process.exit(1);
  });
}
