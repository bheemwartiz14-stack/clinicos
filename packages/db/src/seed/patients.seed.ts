import { createScopedLogger } from "@mediclinic/logger";
import { db } from "../index";
import { patients } from "../schema";

const logger = createScopedLogger("patients-seed");

const PATIENTS = [
  { fullName: "Alice Johnson", phone: "8000000001", email: "alice.johnson@email.com", dateOfBirth: "1985-03-12", gender: "female", bloodGroup: "A+", address: "123 Maple St, Springfield, IL", emergencyContactName: "Bob Johnson", emergencyContactPhone: "8000000101", allergies: "Penicillin", chronicDiseases: "Asthma" },
  { fullName: "Bob Williams", phone: "8000000002", email: "bob.williams@email.com", dateOfBirth: "1972-07-25", gender: "male", bloodGroup: "O+", address: "456 Oak Ave, Portland, OR", emergencyContactName: "Carol Williams", emergencyContactPhone: "8000000102", allergies: "Sulfa", chronicDiseases: "Type 2 Diabetes" },
  { fullName: "Carol Martinez", phone: "8000000003", email: "carol.martinez@email.com", dateOfBirth: "1990-11-03", gender: "female", bloodGroup: "B+", address: "789 Pine Rd, Austin, TX", emergencyContactName: "Dave Martinez", emergencyContactPhone: "8000000103", allergies: "Latex", chronicDiseases: null },
  { fullName: "David Brown", phone: "8000000004", email: "david.brown@email.com", dateOfBirth: "1965-09-18", gender: "male", bloodGroup: "AB+", address: "321 Elm St, Denver, CO", emergencyContactName: "Eve Brown", emergencyContactPhone: "8000000104", allergies: null, chronicDiseases: "Hypertension, Hyperlipidemia" },
  { fullName: "Eve Davis", phone: "8000000005", email: "eve.davis@email.com", dateOfBirth: "2000-01-30", gender: "female", bloodGroup: "O-", address: "654 Birch Ln, Seattle, WA", emergencyContactName: "Frank Davis", emergencyContactPhone: "8000000105", allergies: "Peanuts", chronicDiseases: null },
  { fullName: "Frank Garcia", phone: "8000000006", email: "frank.garcia@email.com", dateOfBirth: "1978-06-14", gender: "male", bloodGroup: "A-", address: "987 Cedar Ct, Miami, FL", emergencyContactName: "Grace Garcia", emergencyContactPhone: "8000000106", allergies: "Ibuprofen", chronicDiseases: "GERD" },
  { fullName: "Grace Lee", phone: "8000000007", email: "grace.lee@email.com", dateOfBirth: "1995-12-22", gender: "female", bloodGroup: "B-", address: "147 Walnut Dr, Chicago, IL", emergencyContactName: "Henry Lee", emergencyContactPhone: "8000000107", allergies: null, chronicDiseases: null },
  { fullName: "Henry Wilson", phone: "8000000008", email: "henry.wilson@email.com", dateOfBirth: "1958-04-05", gender: "male", bloodGroup: "AB-", address: "258 Spruce Way, Boston, MA", emergencyContactName: "Iris Wilson", emergencyContactPhone: "8000000108", allergies: "Codeine", chronicDiseases: "Coronary Artery Disease" },
  { fullName: "Iris Taylor", phone: "8000000009", email: "iris.taylor@email.com", dateOfBirth: "2003-08-19", gender: "female", bloodGroup: "A+", address: "369 Ash Blvd, Phoenix, AZ", emergencyContactName: "Jack Taylor", emergencyContactPhone: "8000000109", allergies: "Shellfish", chronicDiseases: null },
  { fullName: "Jack Anderson", phone: "8000000010", email: "jack.anderson@email.com", dateOfBirth: "1982-02-28", gender: "male", bloodGroup: "O+", address: "486 Poplar St, Nashville, TN", emergencyContactName: "Kate Anderson", emergencyContactPhone: "8000000110", allergies: null, chronicDiseases: "Migraine" },
  { fullName: "Kate Thomas", phone: "8000000011", email: "kate.thomas@email.com", dateOfBirth: "1993-10-07", gender: "female", bloodGroup: "B+", address: "573 Willow Ave, Atlanta, GA", emergencyContactName: "Leo Thomas", emergencyContactPhone: "8000000111", allergies: "Dust", chronicDiseases: null },
  { fullName: "Leo White", phone: "8000000012", email: "leo.white@email.com", dateOfBirth: "1970-05-15", gender: "male", bloodGroup: "A+", address: "684 Fir Ln, Dallas, TX", emergencyContactName: "Mia White", emergencyContactPhone: "8000000112", allergies: "Aspirin", chronicDiseases: "Hypothyroidism" },
  { fullName: "Mia Harris", phone: "8000000013", email: "mia.harris@email.com", dateOfBirth: "1988-09-09", gender: "female", bloodGroup: "AB+", address: "795 Redwood Cir, San Diego, CA", emergencyContactName: "Noah Harris", emergencyContactPhone: "8000000113", allergies: null, chronicDiseases: null },
  { fullName: "Noah Clark", phone: "8000000014", email: "noah.clark@email.com", dateOfBirth: "1960-12-01", gender: "male", bloodGroup: "O+", address: "806 Magnolia Ct, Houston, TX", emergencyContactName: "Olivia Clark", emergencyContactPhone: "8000000114", allergies: "Sulfa", chronicDiseases: "COPD, Osteoarthritis" },
  { fullName: "Olivia Lewis", phone: "8000000015", email: "olivia.lewis@email.com", dateOfBirth: "1998-07-14", gender: "female", bloodGroup: "A-", address: "917 Sycamore St, Charlotte, NC", emergencyContactName: "Paul Lewis", emergencyContactPhone: "8000000115", allergies: "Pollen", chronicDiseases: null },
];

export async function seedPatients() {
  logger.info(`Seeding ${PATIENTS.length} patients`);

  let created = 0;
  for (const p of PATIENTS) {
    const existing = await db.query.patients.findFirst({
      where: (patients, { eq }) => eq(patients.phone, p.phone),
    });
    if (existing) {
      logger.info("Patient already exists, skipping", { phone: p.phone, fullName: p.fullName });
      continue;
    }

    await db.insert(patients).values({
      fullName: p.fullName,
      phone: p.phone,
      email: p.email,
      dateOfBirth: p.dateOfBirth,
      gender: p.gender,
      bloodGroup: p.bloodGroup,
      address: p.address,
      emergencyContactName: p.emergencyContactName,
      emergencyContactPhone: p.emergencyContactPhone,
      allergies: p.allergies,
      chronicDiseases: p.chronicDiseases,
      isActive: true,
    });
    created++;
    logger.info("Patient created", { fullName: p.fullName, phone: p.phone });
  }

  logger.info(`Patient seeding completed (${created} created, ${PATIENTS.length - created} skipped)`);
}
