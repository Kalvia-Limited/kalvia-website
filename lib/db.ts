import "server-only";
import { Pool } from "pg";
import { databaseConfig } from "./db-config.mjs";
const globalDb = globalThis as typeof globalThis & { contactPool?: Pool };
export function getPool() {
  if (!globalDb.contactPool) {
    globalDb.contactPool = new Pool(databaseConfig(process.env.DATABASE_URL));
    // Do not log database errors: they can include credentials or submitted data.
    globalDb.contactPool.on("error", () => {});
  }
  return globalDb.contactPool;
}
