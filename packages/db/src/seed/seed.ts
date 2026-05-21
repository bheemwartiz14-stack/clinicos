import { pbkdf2Sync, randomBytes } from "node:crypto";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadDotenv } from "dotenv";
import { eq, sql } from "drizzle-orm";
import { branches, departments, doctors, users, doctorSchedules, doctorBreaks, doctorVisitSettings, doctorConsultationSettings, patients } from "../schema";
import { createDb, DEFAULT_DATABASE_URL } from "..";

const __dirname = dirname(fileURLToPath(import.meta.url));
loadDotenv({ path: resolve(__dirname, "../../../../.env"), override: false });

const db = createDb(process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL);

function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = pbkdf2Sync(password, salt, 210000, 32, "sha256");
  return `pbkdf2-sha256$210000$${salt.toString("base64url")}$${hash.toString("base64url")}`;
}

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} environment variable is required for seeding.`);
  return value;
}

function passwordFor(role: "admin" | "doctor" | "nurse" | "receptionist" | "accountant") {
  const specificPassword = process.env[`${role.toUpperCase()}_PASSWORD`];
  const fallbackPassword = process.env.ADMIN_PASSWORD;

  if (specificPassword) return specificPassword;
  if (fallbackPassword) {
    console.warn(`${role.toUpperCase()}_PASSWORD not set; using ADMIN_PASSWORD for local seed data.`);
    return fallbackPassword;
  }

  throw new Error("ADMIN_PASSWORD environment variable is required for seeding.");
}

const branchSeed = {
  name: "MediClinic Main Branch",
  npi: "1234567890",
  phone: "+1-212-555-0100",
  email: "ops@mediclinic.example",
  addressLine1: "200 Madison Ave",
  city: "New York",
  state: "NY",
  postalCode: "10016",
  timezone: "America/New_York"
};

async function seed() {
  try {
    console.log("Starting seed process...");
    const [existingBranch] = await db.select().from(branches).where(eq(branches.name, branchSeed.name)).limit(1);
    const [branch] = existingBranch ? [existingBranch] : await db.insert(branches).values(branchSeed).returning();
    console.log(`Branch created/found: ${branch.id}`);

    const [existingDept] = await db.select().from(departments).where(eq(departments.name, "Clinical Operations")).limit(1);
    const [clinicalDepartment] = existingDept
      ? [existingDept]
      : await db.insert(departments).values({ branchId: branch.id, name: "Clinical Operations", description: "Providers, nurses, and appointment workflows" }).returning();
    console.log(`Department created/found: ${clinicalDepartment?.id}`);

    const seedUsers = [
      {
        branchId: branch.id,
        departmentId: clinicalDepartment?.id,
        role: "admin" as const,
        name: "Avery Admin",
        email: requiredEnv("ADMIN_EMAIL"),
        username: "admin",
        passwordHash: hashPassword(passwordFor("admin"))
      },
      {
        branchId: branch.id,
        departmentId: clinicalDepartment?.id,
        role: "doctor" as const,
        name: "Dr. Priya Patel",
        email: requiredEnv("DOCTOR_EMAIL"),
        username: "doctor",
        passwordHash: hashPassword(passwordFor("doctor"))
      },
      {
        branchId: branch.id,
        departmentId: clinicalDepartment?.id,
        role: "nurse" as const,
        name: "Nora Nurse",
        email: requiredEnv("NURSE_EMAIL"),
        username: "nurse",
        passwordHash: hashPassword(passwordFor("nurse"))
      },
      {
        branchId: branch.id,
        role: "receptionist" as const,
        name: "Riley Reception",
        email: requiredEnv("RECEPTIONIST_EMAIL"),
        username: "frontdesk",
        passwordHash: hashPassword(passwordFor("receptionist"))
      },
      {
        branchId: branch.id,
        role: "accountant" as const,
        name: "Alex Accounts",
        email: requiredEnv("ACCOUNTANT_EMAIL"),
        username: "accounting",
        passwordHash: hashPassword(passwordFor("accountant"))
      }
    ];

    await db
      .insert(users)
      .values(seedUsers)
      .onConflictDoUpdate({
        target: users.email,
        set: {
          branchId: sql`excluded.branch_id`,
          departmentId: sql`excluded.department_id`,
          role: sql`excluded.role`,
          name: sql`excluded.name`,
          username: sql`excluded.username`,
          passwordHash: sql`excluded.password_hash`,
          isActive: true,
          updatedAt: new Date()
        }
      });
    console.log("Users insert done");

    const seededUsers = await db.select().from(users).where(eq(users.branchId, branch.id));
    console.log(`Users seeded: ${seededUsers.length}`);

    const doctorUser = seededUsers.find((user) => user.role === "doctor");
    const adminUser = seededUsers.find((user) => user.role === "admin");
    await db.insert(patients).values([
      {
        branchId: branch.id,
        mrn: "PAT-2026-0001",
        patientCode: "PAT-2026-0001",
        firstName: "Maya",
        lastName: "Johnson",
        fullName: "Maya Johnson",
        email: "maya.johnson@example.com",
        phone: "+1-212-555-0201",
        dateOfBirth: "1988-04-12",
        gender: "female",
        bloodGroup: "O+",
        maritalStatus: "married",
        address: { line1: "44 West 21st Street", city: "New York", state: "NY", postalCode: "10010" },
        emergencyContactName: "Evan Johnson",
        emergencyContactPhone: "+1-212-555-0202",
        allergies: "Penicillin",
        chronicDiseases: "Hypertension",
        currentMedications: "Amlodipine",
        notes: "Prefers morning appointments.",
        createdByUserId: adminUser?.id,
        updatedByUserId: adminUser?.id
      },
      {
        branchId: branch.id,
        mrn: "PAT-2026-0002",
        patientCode: "PAT-2026-0002",
        firstName: "Daniel",
        lastName: "Kim",
        fullName: "Daniel Kim",
        email: "daniel.kim@example.com",
        phone: "+1-212-555-0203",
        dateOfBirth: "1979-09-25",
        gender: "male",
        bloodGroup: "A-",
        maritalStatus: "single",
        address: { line1: "18 Park Avenue", city: "New York", state: "NY", postalCode: "10016" },
        emergencyContactName: "Sara Kim",
        emergencyContactPhone: "+1-212-555-0204",
        chronicDiseases: "Type 2 diabetes",
        currentMedications: "Metformin",
        createdByUserId: adminUser?.id,
        updatedByUserId: adminUser?.id
      }
    ]).onConflictDoNothing();
    let doctorId: string | null = null;
    if (doctorUser) {
      const [doctor] = await db
        .insert(doctors)
        .values({
          userId: doctorUser.id,
          branchId: branch.id,
          departmentId: doctorUser.departmentId,
          specialtyId: doctorUser.departmentId,
          displayName: "Dr. Priya Patel",
          firstName: "Priya",
          lastName: "Patel",
          email: doctorUser.email,
          phone: "+1-212-555-0123",
          gender: "female",
          specialization: "Family Medicine",
          qualification: "MD, Board Certified",
          licenseNumber: "NY-CLINIC-2026",
          npi: "1987654321",
          experienceYears: 10,
          consultationFee: "150",
          bio: "Dr. Priya Patel is a compassionate family medicine physician with over 10 years of experience. She specializes in preventive care and chronic disease management.",
          isActive: true,
          isAvailable: true,
          visitDurationMinutes: 20
        })
        .onConflictDoNothing()
        .returning();
      doctorId = doctor?.id ?? null;
      console.log(`Doctor profile created for user: ${doctorUser.id}`);

      if (doctorId) {
        const activeDoctorId = doctorId;
        const defaultSchedules = [
          { dayOfWeek: 0, dayName: "sunday" as const, isAvailable: false, isActive: false, startTime: "09:00", endTime: "17:00", slotDuration: 20, createdBy: doctorUser.id },
          { dayOfWeek: 1, dayName: "monday" as const, isAvailable: true, isActive: true, startTime: "09:00", endTime: "17:00", slotDuration: 20, createdBy: doctorUser.id },
          { dayOfWeek: 2, dayName: "tuesday" as const, isAvailable: true, isActive: true, startTime: "09:00", endTime: "17:00", slotDuration: 20, createdBy: doctorUser.id },
          { dayOfWeek: 3, dayName: "wednesday" as const, isAvailable: true, isActive: true, startTime: "09:00", endTime: "17:00", slotDuration: 20, createdBy: doctorUser.id },
          { dayOfWeek: 4, dayName: "thursday" as const, isAvailable: true, isActive: true, startTime: "09:00", endTime: "17:00", slotDuration: 20, createdBy: doctorUser.id },
          { dayOfWeek: 5, dayName: "friday" as const, isAvailable: true, isActive: true, startTime: "09:00", endTime: "13:00", slotDuration: 20, createdBy: doctorUser.id },
          { dayOfWeek: 6, dayName: "saturday" as const, isAvailable: false, isActive: false, startTime: "09:00", endTime: "17:00", slotDuration: 20, createdBy: doctorUser.id }
        ];
        const existingSchedules = await db.select({ id: doctorSchedules.id }).from(doctorSchedules).where(eq(doctorSchedules.doctorId, activeDoctorId));
        if (existingSchedules.length === 0) {
          await db.insert(doctorSchedules).values(
            defaultSchedules.map(s => ({ doctorId: activeDoctorId, ...s }))
          );
        }

        const existingBreaks = await db.select({ id: doctorBreaks.id }).from(doctorBreaks).where(eq(doctorBreaks.doctorId, activeDoctorId));
        if (existingBreaks.length === 0) {
          const defaultBreaks = [
            { doctorId: activeDoctorId, breakType: "lunch", breakName: "Lunch Break", startTime: "12:00", endTime: "13:00", isEnabled: true },
            { doctorId: activeDoctorId, breakType: "break", breakName: "Afternoon Break", startTime: "15:00", endTime: "15:30", isEnabled: true }
          ];
          await db.insert(doctorBreaks).values(defaultBreaks);
        }

        await db.insert(doctorVisitSettings).values({
          doctorId: activeDoctorId,
          visitDurationMinutes: 20,
          bufferTimeMinutes: 5,
          maxPatientsPerDay: 20,
          autoGenerateSlots: true,
          allowOnlineConsultation: true,
          calendarSyncEnabled: false
        }).onConflictDoNothing();

        await db.insert(doctorConsultationSettings).values({
          doctorId: activeDoctorId,
          consultationFee: "150",
          followUpFee: "75",
          followUpValidityDays: 14,
          defaultSlotDuration: 20,
          allowOnlineConsultation: true,
          onlineConsultationFee: "150",
          notes: "Seeded default consultation settings"
        }).onConflictDoNothing();

        console.log("Doctor schedules, breaks, visit settings, and consultation settings seeded");
      }
    }
    console.log("Seeded MediClinic branch, departments, RBAC users, and provider profile.");
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

await seed();
process.exit(0);
