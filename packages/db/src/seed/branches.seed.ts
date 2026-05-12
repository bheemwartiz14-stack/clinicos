import { db, schema } from "../index.js";

export async function seedBranches() {
  console.log("🌱 Branches seeding started...");

  await db
    .insert(schema.branches)
    .values([
      {
        name: process.env.CLINIC_BRANCH_NAME || "MediClinic Main Branch",
        code: process.env.CLINIC_BRANCH_CODE || "MAIN",
        type: "clinic",
        supportEmail: process.env.COMPANY_EMAIL || "support@mediclinic.com",
        supportPhone: process.env.COMPANY_PHONE || "+91 98765 43210",
        address: {
          addressLine1: "Main clinic campus",
          city: "Mumbai",
          state: "Maharashtra",
          country: "India",
          postalCode: "400001",
        },
        isMain: true,
        isActive: true,
      },
    ])
    .onConflictDoNothing({
      target: schema.branches.code,
    });

  console.log("✅ Branches inserted");
}
