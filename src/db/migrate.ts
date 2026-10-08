/**
 * Applies the SQL migrations in drizzle/ to the database in DATABASE_URL: `npm run db:migrate`.
 * Uses the app's own client (port 443), so it works on networks that block port 5432.
 * Already-applied migrations are skipped, so it is safe to run again.
 */
import { migrate } from "drizzle-orm/neon-serverless/migrator";
import { getDb } from "./index";

migrate(getDb(), { migrationsFolder: "drizzle" })
  .then(() => {
    console.log("Migrations applied.");
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
