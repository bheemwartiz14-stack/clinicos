import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadDotenv } from "dotenv";
import postgres from "postgres";
import { DEFAULT_DATABASE_URL } from ".";

const __dirname = dirname(fileURLToPath(import.meta.url));
loadDotenv({ path: resolve(__dirname, "../../../.env"), override: false, quiet: true });

const databaseUrl = process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL;
const timeoutMs = Number(process.env.DB_WAIT_TIMEOUT_MS ?? 60_000);
const intervalMs = Number(process.env.DB_WAIT_INTERVAL_MS ?? 1_500);
const startedAt = Date.now();

function sleep(ms: number) {
  return new Promise((resolveSleep) => setTimeout(resolveSleep, ms));
}

function isRetryablePostgresStartupError(error: unknown) {
  if (!(error instanceof Error)) return true;
  const code = (error as Error & { code?: string }).code;
  return code === "57P03" || code === "ECONNREFUSED" || code === "ENOTFOUND" || code === "ETIMEDOUT" || code === "EAI_AGAIN";
}

async function waitForDatabase() {
  let attempt = 0;

  while (Date.now() - startedAt < timeoutMs) {
    attempt += 1;
    const sql = postgres(databaseUrl, {
      max: 1,
      connect_timeout: 5,
      idle_timeout: 1,
      prepare: false
    });

    try {
      await sql`select 1`;
      await sql.end({ timeout: 1 });
      console.log(`Database is ready after ${attempt} attempt${attempt === 1 ? "" : "s"}.`);
      return;
    } catch (error) {
      await sql.end({ timeout: 1 }).catch(() => undefined);

      if (!isRetryablePostgresStartupError(error)) {
        throw error;
      }

      const message = error instanceof Error ? error.message : "Database is not ready";
      console.log(`Waiting for database (${attempt}): ${message}`);
      await sleep(intervalMs);
    }
  }

  throw new Error(`Database did not become ready within ${timeoutMs}ms.`);
}

await waitForDatabase();
