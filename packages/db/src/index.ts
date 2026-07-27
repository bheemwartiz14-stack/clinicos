import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import path from "path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import * as schema from "./schema/index";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.resolve(__dirname, "../../../.env") });

export const DEFAULT_DATABASE_URL = "postgres://mediclinic:mediclinic@localhost:5432/mediclinic";

const databaseUrl = process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL;
const globalForDb = globalThis as unknown as {
  pool?: pg.Pool;
};

const pool =
  globalForDb.pool ??
  new pg.Pool({
    connectionString: databaseUrl,
    max: 10,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pool = pool;
}

export const db = drizzle(pool, { schema });

export * from "./schema/index";
