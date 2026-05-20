import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadDotenv } from "dotenv";
import { z } from "zod";

if (process.env.NODE_ENV !== "production") {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const cwd = /* turbopackIgnore: true */ process.cwd();
  const envCandidates = [
    path.join(cwd, ".env"),
    path.join(cwd, "..", ".env"),
    path.join(cwd, "..", "..", ".env"),
    path.join(/* turbopackIgnore: true */ __dirname, ".env"),
    path.join(/* turbopackIgnore: true */ __dirname, "..", ".env"),
    path.join(/* turbopackIgnore: true */ __dirname, "..", "..", ".env"),
    path.join(/* turbopackIgnore: true */ __dirname, "..", "..", "..", ".env")
  ];

  for (const envFile of envCandidates) {
    if (fs.existsSync(envFile)) {
      loadDotenv({ path: envFile, quiet: true });
    }
  }
}

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_URL: z.string().url().default("http://localhost:3000"),
  DATABASE_URL: z.string().optional(),
  JWT_SECRET: z.string().optional(),
  COOKIE_NAME: z.string().default("mediclinic_session"),
  OPENAI_API_KEY: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_REDIRECT_URI: z.string().url().optional(),
  GOOGLE_CALENDAR_REDIRECT_URI: z.string().url().optional(),
  GOOGLE_MEET_REDIRECT_URI: z.string().url().optional(),
  GOOGLE_CALENDAR_SCOPES: z.string().optional(),
  GOOGLE_MEET_SCOPES: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_FROM_NUMBER: z.string().optional(),
  WHATSAPP_CLOUD_TOKEN: z.string().optional(),
  WHATSAPP_PHONE_NUMBER_ID: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().trim().email().or(z.literal("")).optional().transform((value) => (value === "" ? undefined : value)),

  ADMIN_EMAIL: z.string().trim().email().or(z.literal("")).optional().transform((value) => (value === "" ? undefined : value)),
  ADMIN_PASSWORD: z.string().trim().optional(),
  DOCTOR_EMAIL: z.string().trim().email().or(z.literal("")).optional().transform((value) => (value === "" ? undefined : value)),
  DOCTOR_PASSWORD: z.string().trim().optional(),
  NURSE_EMAIL: z.string().trim().email().or(z.literal("")).optional().transform((value) => (value === "" ? undefined : value)),
  NURSE_PASSWORD: z.string().trim().optional(),
  RECEPTIONIST_EMAIL: z.string().trim().email().or(z.literal("")).optional().transform((value) => (value === "" ? undefined : value)),
  RECEPTIONIST_PASSWORD: z.string().trim().optional(),
  ACCOUNTANT_EMAIL: z.string().trim().email().or(z.literal("")).optional().transform((value) => (value === "" ? undefined : value)),
  ACCOUNTANT_PASSWORD: z.string().trim().optional()
});
export type AppEnv = z.infer<typeof envSchema>;
export const env: AppEnv = envSchema.parse(process.env);
