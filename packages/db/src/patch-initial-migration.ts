import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const drizzleDir = resolve(__dirname, "../drizzle");

if (!existsSync(drizzleDir)) {
  process.exit(0);
}

const migrationFiles = readdirSync(drizzleDir)
  .filter((file) => /^\d+_.*\.sql$/.test(file))
  .sort();

for (const file of migrationFiles) {
  const migrationPath = resolve(drizzleDir, file);
  const currentSql = readFileSync(migrationPath, "utf8");
  const patchedSql = currentSql.replace(
    /^CREATE TYPE "public"\."([^"]+)" AS ENUM\(([^;]+)\);--> statement-breakpoint$/gm,
    (_, name: string, values: string) =>
      `DO $$ BEGIN\n\tCREATE TYPE "public"."${name}" AS ENUM(${values});\nEXCEPTION\n\tWHEN duplicate_object THEN null;\nEND $$;--> statement-breakpoint`
  );

  if (patchedSql !== currentSql) {
    writeFileSync(migrationPath, patchedSql);
    console.log(`Patched duplicate-safe enum creation in ${file}`);
  }
}
