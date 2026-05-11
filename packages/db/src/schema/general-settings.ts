// src/db/schema/general-settings.ts

import {
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const generalSettings = pgTable("general_settings", {
  id: uuid("id").defaultRandom().primaryKey(),

  // ======================================================
  // Company Information
  // ======================================================

  companyName: varchar("company_name", { length: 255 }).notNull(),

  tagline: varchar("tagline", { length: 500 }),

  supportEmail: varchar("support_email", { length: 255 }).notNull(),

  supportPhone: varchar("support_phone", { length: 50 }),

  // ======================================================
  // Address Information
  // ======================================================

  address: jsonb("address").$type<{
    addressLine1?: string;
    addressLine2?: string;

    country?: string;
    countryCode?: string;

    state?: string;
    stateCode?: string;

    city?: string;

    postalCode?: string;

    latitude?: number;
    longitude?: number;
  }>(),

  // ======================================================
  // Social Media Links
  // ======================================================

  socialMediaLinks: jsonb("social_media_links").$type<{
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
    website?: string;
  }>(),

  // ======================================================
  // Branding
  // ======================================================

  mainLogo: text("main_logo"),

  favicon: text("favicon"),

  // ======================================================
  // Timestamps
  // ======================================================

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});