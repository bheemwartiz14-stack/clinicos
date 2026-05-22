// packages/db/src/seed/department.seed.ts

import { db } from "../index";
import { departments } from "../schema";
import { eq } from "drizzle-orm";

const departmentData = [
  // Admin / Management
  {
    name: "Administration",
    code: "ADMIN",
    description: "Clinic administration, staff management, roles, permissions, and operations.",
  },

  // Receptionist / Front Desk
  {
    name: "Reception",
    code: "REC",
    description: "Front desk, patient registration, appointments, and queue/token management.",
  },

  // Accountant / Billing
  {
    name: "Accounts & Billing",
    code: "ACC",
    description: "Invoice generation, payment collection, GST billing, and financial records.",
  },

  // Doctor / Clinical Departments
  {
    name: "General Medicine",
    code: "GEN",
    description: "Primary healthcare and general medical consultations.",
  },
  {
    name: "Cardiology",
    code: "CARD",
    description: "Heart and cardiovascular disease treatment department.",
  },
  {
    name: "Orthopedics",
    code: "ORTHO",
    description: "Bone, joint, and musculoskeletal treatment department.",
  },
  {
    name: "Pediatrics",
    code: "PED",
    description: "Medical care for infants, children, and adolescents.",
  },
  {
    name: "Gynecology",
    code: "GYN",
    description: "Women's reproductive health and pregnancy care.",
  },
  {
    name: "Dermatology",
    code: "DERM",
    description: "Skin, hair, and nail treatment department.",
  },
  {
    name: "Neurology",
    code: "NEURO",
    description: "Brain, spinal cord, and nervous system treatments.",
  },
  {
    name: "ENT",
    code: "ENT",
    description: "Ear, Nose, and Throat specialist department.",
  },
  {
    name: "Ophthalmology",
    code: "OPHTH",
    description: "Eye care and vision treatment department.",
  },
  {
    name: "Emergency",
    code: "EMR",
    description: "Emergency and trauma medical services.",
  },
];

export async function seedDepartments() {
  try {
    console.log("🌱 Seeding departments...");

    for (const department of departmentData) {
      const existingDepartment = await db.query.departments.findFirst({
        where: eq(departments.code, department.code),
      });

      if (existingDepartment) {
        console.log(`⚠️ Department already exists: ${department.name}`);
        continue;
      }

      await db.insert(departments).values({
        name: department.name,
        code: department.code,
        description: department.description,
        isActive: true,
      });

      console.log(`✅ Department created: ${department.name}`);
    }

    console.log("🎉 Department seeding completed.");
  } catch (error) {
    console.error("❌ Error seeding departments:", error);
    throw error;
  }
}