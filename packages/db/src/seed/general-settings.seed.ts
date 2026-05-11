// src/db/seeds/general-settings.seed.ts

import "dotenv/config";
import { db, schema } from "../index.js";

export async function seedGeneralSettings() {
  console.log("🌱 General settings seeding started...");

  try {
    const existingSettings = await db.query.generalSettings.findFirst();

    if (existingSettings) {
      console.log("ℹ️ General settings already exist");
      return;
    }

    await db.insert(schema.generalSettings).values({
      companyName: process.env.COMPANY_NAME || "MediClinic Pro",

      tagline:
        process.env.COMPANY_TAGLINE ||
        "Modern Clinic Management System",

      supportEmail:
        process.env.SUPPORT_EMAIL ||
        "support@mediclinic.com",

      supportPhone:
        process.env.SUPPORT_PHONE ||
        "+91 9999999999",

      address: {
        addressLine1:
          process.env.COMPANY_ADDRESS_LINE_1 ||
          "Main Road, Near City Hospital",

        addressLine2:
          process.env.COMPANY_ADDRESS_LINE_2 ||
          "Medical Complex",

        country:
          process.env.COMPANY_COUNTRY ||
          "India",

        countryCode:
          process.env.COMPANY_COUNTRY_CODE ||
          "IN",

        state:
          process.env.COMPANY_STATE ||
          "Punjab",

        stateCode:
          process.env.COMPANY_STATE_CODE ||
          "PB",

        city:
          process.env.COMPANY_CITY ||
          "Jalandhar",

        postalCode:
          process.env.COMPANY_POSTAL_CODE ||
          "144001",
      },

      socialMediaLinks: {
        facebook:
          process.env.FACEBOOK_URL ||
          "https://facebook.com/mediclinic",

        instagram:
          process.env.INSTAGRAM_URL ||
          "https://instagram.com/mediclinic",

        twitter:
          process.env.TWITTER_URL ||
          "https://twitter.com/mediclinic",

        linkedin:
          process.env.LINKEDIN_URL ||
          "https://linkedin.com/company/mediclinic",

        youtube:
          process.env.YOUTUBE_URL ||
          "https://youtube.com/@mediclinic",

        website:
          process.env.WEBSITE_URL ||
          "https://mediclinic.com",
      },

      mainLogo:
        process.env.MAIN_LOGO ||
        "/uploads/settings/main-logo.png",

      favicon:
        process.env.FAVICON ||
        "/uploads/settings/favicon.ico",
    });

    console.log("✅ General settings created");
  } catch (error) {
    console.error("❌ General settings seed failed:", error);
    throw error;
  }
}

if (import.meta.main) {
  seedGeneralSettings()
    .then(() => {
      console.log("✅ General settings seed finished");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Seed error:", error);
      process.exit(1);
    });
}