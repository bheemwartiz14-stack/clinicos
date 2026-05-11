import { unstable_cache } from "next/cache";
import { db, schema } from "@mediclinicpro/db";
import { desc, eq } from "drizzle-orm";
import type { GeneralSettings, UpdateGeneralSettingsInput } from "./genral-setting.types";

export const GENERAL_SETTINGS_CACHE_TAG = "general-settings";

function mapGeneralSettings(row: typeof schema.generalSettings.$inferSelect): GeneralSettings {
  return {
    id: row.id,
    companyName: row.companyName,
    tagline: row.tagline,
    supportEmail: row.supportEmail,
    supportPhone: row.supportPhone,
    address: row.address ?? null,
    socialMediaLinks: row.socialMediaLinks ?? null,
    mainLogo: row.mainLogo,
    favicon: row.favicon,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function normalizeAddress(input: UpdateGeneralSettingsInput) {
  const address = input.address;
  return Object.values(address).some(Boolean) ? address : null;
}

function normalizeSettingsInput(input: UpdateGeneralSettingsInput) {
  return {
    companyName: input.companyName,
    tagline: input.tagline ?? null,
    supportEmail: input.supportEmail,
    supportPhone: input.supportPhone ?? null,
    address: normalizeAddress(input),
    socialMediaLinks: input.socialMediaLinks,
    mainLogo: input.mainLogo ?? null,
    favicon: input.favicon ?? null,
  };
}

async function findGeneralSettingsFromDb() {
  const [settings] = await db
    .select()
    .from(schema.generalSettings)
    .orderBy(desc(schema.generalSettings.updatedAt))
    .limit(1);

  return settings ? mapGeneralSettings(settings) : null;
}

export const findGeneralSettings = unstable_cache(
  findGeneralSettingsFromDb,
  ["general-settings"],
  {
    tags: [GENERAL_SETTINGS_CACHE_TAG],
    revalidate: 3600,
  },
);

export async function upsertGeneralSettings(input: UpdateGeneralSettingsInput) {
  const currentSettings = await findGeneralSettingsFromDb();
  const values = normalizeSettingsInput(input);

  if (currentSettings) {
    const [settings] = await db
      .update(schema.generalSettings)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(schema.generalSettings.id, currentSettings.id))
      .returning();

    return settings ? mapGeneralSettings(settings) : null;
  }

  const [settings] = await db.insert(schema.generalSettings).values(values).returning();
  return settings ? mapGeneralSettings(settings) : null;
}