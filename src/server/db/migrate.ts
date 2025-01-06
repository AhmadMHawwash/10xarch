import 'dotenv/config';
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const runMigrate = async () => {
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

runMigrate().catch((err) => {
  console.error("❌ Migration failed");
  console.error(err);
  process.exit(1);
});
