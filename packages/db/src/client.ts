import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export const DEFAULT_DATABASE_URL = "postgres://mediclinic:mediclinic@localhost:5432/mediclinic";

export function createDb(databaseUrl: string) {
  const client = postgres(databaseUrl, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false
  });

  return drizzle(client, { schema });
}

const databaseUrl = process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL;
const globalForDb = globalThis as unknown as {
  client?: postgres.Sql;
};

const client =
  globalForDb.client ??
  postgres(databaseUrl, {
    max: 10,
    prepare: false
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.client = client;
}

export const db = drizzle(client, { schema });
export { schema };
export type Db = typeof db;
