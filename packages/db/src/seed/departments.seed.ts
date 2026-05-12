// src/db/seeds/departments.seed.ts

import { db, schema } from "../index.js";
import { eq } from "drizzle-orm";

export async function seedDepartments() {
  console.log("🌱 Departments seeding started...");
  try {
    const doctorUser = await db.query.users.findFirst({
      where: eq(schema.users.email, process.env.DOCTOR_EMAIL || "doctor@example.com"),
    });
    const departmentsData: (typeof schema.departments.$inferInsert)[] = [
      {
        name: "General Medicine",
        code: "GEN-MED",
        departmentHeadId: doctorUser?.id ?? null,
        description: "General diagnosis, treatment, and primary care services.",
        isActive: true,
      },
      {
        name: "Cardiology",
        code: "CARD",
        departmentHeadId: doctorUser?.id ?? null,
        description: "Heart and cardiovascular disease treatment department.",
        isActive: true,
      },
      {
        name: "Orthopedics",
        code: "ORTHO",
        departmentHeadId: doctorUser?.id ?? null,
        description: "Bone, joint, muscle, and injury treatment department.",
        isActive: true,
      },
      {
        name: "Pediatrics",
        code: "PEDIA",
        departmentHeadId: doctorUser?.id ?? null,
        description: "Child healthcare and pediatric treatment department.",
        isActive: true,
      },
      {
        name: "Dermatology",
        code: "DERMA",
        departmentHeadId: doctorUser?.id ?? null,
        description: "Skin, hair, and nail related treatment department.",
        isActive: true,
      },
      {
        name: "Gynecology",
        code: "GYNE",
        departmentHeadId: doctorUser?.id ?? null,
        description: "Women healthcare and pregnancy related treatment department.",
        isActive: true,
      },
      {
        name: "ENT",
        code: "ENT",
        departmentHeadId: doctorUser?.id ?? null,
        description: "Ear, nose, and throat treatment department.",
        isActive: true,
      },
      {
        name: "Radiology",
        code: "RAD",
        departmentHeadId: doctorUser?.id ?? null,
        description: "X-ray, ultrasound, MRI, CT scan, and imaging services.",
        isActive: true,
      },
      {
        name: "Pathology",
        code: "PATH",
        departmentHeadId: doctorUser?.id ?? null,
        description: "Lab testing, blood tests, and diagnostic reports.",
        isActive: true,
      },
      {
        name: "Emergency",
        code: "EMR",
        departmentHeadId: doctorUser?.id ?? null,
        description: "Emergency and urgent medical care department.",
        isActive: true,
      },
    ];

    await db
      .insert(schema.departments)
      .values(departmentsData)
      .onConflictDoNothing({
        target: schema.departments.name,
      });

    console.log("✅ Departments inserted");
    console.log("🎉 Departments seeding completed successfully");
  } catch (error) {
    console.error("❌ Departments seed failed:", error);
    throw error;
  }
}

if (import.meta.main) {
  seedDepartments()
    .then(() => {
      console.log("✅ Seed finished");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Seed error:", error);
      process.exit(1);
    });
}