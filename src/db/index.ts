/**
 * Database client. Server-only: imported by the service layer, never by components.
 * The connection string comes from DATABASE_URL (in .env.local, never committed).
 *
 * Uses Neon's serverless driver, which talks to Postgres over a WebSocket on port 443.
 * Unlike the standard Postgres port (5432), 443 is open on almost every network,
 * including campus and corporate Wi-Fi, and it works the same on Vercel.
 */
import { neonConfig, Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "./schema";

neonConfig.webSocketConstructor = ws;

function createDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set. Add it to .env.local (see README, \"Database\").");
  }
  return drizzle({ client: new Pool({ connectionString: url, max: 5 }), schema });
}

type Db = ReturnType<typeof createDb>;

// Reuse one client across hot reloads in development instead of opening a new pool on every edit.
const globalForDb = globalThis as unknown as { fidelityWalletDb?: Db };

/** The database, created on first use so that importing this module never opens a connection. */
export function getDb(): Db {
  globalForDb.fidelityWalletDb ??= createDb();
  return globalForDb.fidelityWalletDb;
}

export { schema };
