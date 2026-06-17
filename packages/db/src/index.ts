import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema/index";

const databaseUrl = process.env.DATABASE_URL;
console.log('databaseUrl',databaseUrl);

export const db = databaseUrl
  ? drizzle(databaseUrl, { schema })
  : (undefined as never);

export * from "./schema/index";
