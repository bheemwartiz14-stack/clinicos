import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema/index";

const databaseUrl = 'postgresql://neondb_owner:npg_zf8mlrkPgBR3@ep-red-snow-aqkv88xv-pooler.c-8.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require';
console.log('databaseUrl',databaseUrl);

export const db = databaseUrl
  ? drizzle(databaseUrl, { schema })
  : (undefined as never);

export * from "./schema/index";
