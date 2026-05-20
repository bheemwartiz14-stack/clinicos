import { createDb, DEFAULT_DATABASE_URL } from "@mediclinic/db";
import { env } from "./env";

export const db = createDb(env.DATABASE_URL ?? DEFAULT_DATABASE_URL);
