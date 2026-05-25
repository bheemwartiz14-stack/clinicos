import { createScopedLogger } from "@mediclinic/logger";
import { db } from "../index";
import { doctorSpecialties, departments } from "../schema";
import { eq } from "drizzle-orm";

const logger = createScopedLogger("specialty-seed");

async function getDepartmentId(code: string) {
  const [dept] = await db.select({ id: departments.id }).from(departments).where(eq(departments.code, code)).limit(1);
  return dept?.id ?? null;
}

const specialtyData: Array<{
  name: string;
  code: string;
  description: string;
  departmentCode: string;
}> = [
  { name: "General Medicine", code: "general", description: "Primary healthcare and general medical consultations.", departmentCode: "GEN" },
  { name: "Internal Medicine", code: "internal", description: "Diagnosis and non-surgical treatment of adult diseases.", departmentCode: "GEN" },
  { name: "Preventive Medicine", code: "preventive", description: "Preventive healthcare and wellness checkups.", departmentCode: "GEN" },

  { name: "Cardiology", code: "cardiology", description: "Heart and cardiovascular system diagnosis and treatment.", departmentCode: "CARD" },
  { name: "Interventional Cardiology", code: "interv-cardio", description: "Catheter-based treatment of heart diseases.", departmentCode: "CARD" },
  { name: "Cardiac Electrophysiology", code: "cardio-ep", description: "Heart rhythm disorders diagnosis and treatment.", departmentCode: "CARD" },

  { name: "Orthopedics", code: "orthopedics", description: "Bone, joint, and musculoskeletal surgery and treatment.", departmentCode: "ORTHO" },
  { name: "Sports Medicine", code: "sports-med", description: "Sports-related injury treatment and prevention.", departmentCode: "ORTHO" },
  { name: "Spine Surgery", code: "spine", description: "Surgical treatment of spinal disorders.", departmentCode: "ORTHO" },

  { name: "Pediatrics", code: "pediatrics", description: "Medical care for infants, children, and adolescents.", departmentCode: "PED" },
  { name: "Pediatric Cardiology", code: "ped-cardio", description: "Heart care for children.", departmentCode: "PED" },
  { name: "Neonatology", code: "neonatology", description: "Care of newborn infants.", departmentCode: "PED" },

  { name: "Gynecology", code: "gynecology", description: "Women's reproductive health and pregnancy care.", departmentCode: "GYN" },
  { name: "Obstetrics", code: "obstetrics", description: "Pregnancy, childbirth, and postpartum care.", departmentCode: "GYN" },
  { name: "Reproductive Medicine", code: "reproductive", description: "Fertility and reproductive health treatments.", departmentCode: "GYN" },

  { name: "Dermatology", code: "dermatology", description: "Skin, hair, and nail disorders diagnosis and treatment.", departmentCode: "DERM" },
  { name: "Cosmetic Dermatology", code: "cosmetic-derm", description: "Cosmetic skin treatments and procedures.", departmentCode: "DERM" },
  { name: "Pediatric Dermatology", code: "ped-derm", description: "Skin care for children.", departmentCode: "DERM" },

  { name: "Neurology", code: "neurology", description: "Brain, spinal cord, and nervous system disorders.", departmentCode: "NEURO" },
  { name: "Neurosurgery", code: "neurosurgery", description: "Surgical treatment of nervous system disorders.", departmentCode: "NEURO" },
  { name: "Neurophysiology", code: "neurophys", description: "Electrophysiological testing of the nervous system.", departmentCode: "NEURO" },

  { name: "ENT", code: "ent", description: "Ear, Nose, and Throat specialist care.", departmentCode: "ENT" },
  { name: "Otology", code: "otology", description: "Ear disorders and hearing loss treatment.", departmentCode: "ENT" },
  { name: "Rhinology", code: "rhinology", description: "Nasal and sinus disorders treatment.", departmentCode: "ENT" },

  { name: "Ophthalmology", code: "ophthalmology", description: "Eye care and vision treatment.", departmentCode: "OPHTH" },
  { name: "Pediatric Ophthalmology", code: "ped-ophth", description: "Eye care for children.", departmentCode: "OPHTH" },

  { name: "Emergency Medicine", code: "emergency", description: "Emergency and trauma medical services.", departmentCode: "EMR" },
  { name: "Critical Care", code: "critical-care", description: "Intensive care and life support management.", departmentCode: "EMR" },

  { name: "General Surgery", code: "general-surgery", description: "Surgical treatment of various conditions.", departmentCode: "GEN" },
  { name: "Anesthesiology", code: "anesthesia", description: "Pain management and anesthesia for procedures.", departmentCode: "GEN" },
  { name: "Radiology", code: "radiology", description: "Medical imaging diagnosis and interventional procedures.", departmentCode: "GEN" },
  { name: "Pathology", code: "pathology", description: "Laboratory analysis and disease diagnosis.", departmentCode: "GEN" },
];

export async function seedSpecialties() {
  try {
    logger.info("Seeding doctor specialties");

    for (const specialty of specialtyData) {
      const existingSpecialty = await db.query.doctorSpecialties.findFirst({
        where: eq(doctorSpecialties.code, specialty.code),
      });
      const departmentId = await getDepartmentId(specialty.departmentCode);

      if (existingSpecialty) {
        if (!existingSpecialty.departmentId && departmentId) {
          await db
            .update(doctorSpecialties)
            .set({ departmentId })
            .where(eq(doctorSpecialties.id, existingSpecialty.id));
        }

        logger.info("Specialty already exists", { specialtyName: specialty.name, specialtyCode: specialty.code });
        continue;
      }

      await db.insert(doctorSpecialties).values({
        name: specialty.name,
        code: specialty.code,
        description: specialty.description,
        departmentId,
        isActive: true,
      });

      logger.info("Specialty created", { specialtyName: specialty.name, specialtyCode: specialty.code });
    }

    logger.info("Specialty seeding completed");
  } catch (error) {
    logger.error("Error seeding specialties", { error });
    throw error;
  }
}
