import { type Permission, permissions, rolePermissions, roles } from "@mediclinicpro/types";
import bcrypt from "bcryptjs";
import { eq, sql } from "drizzle-orm";
import { db, schema } from "..";

const permissionLabels: Record<Permission, string> = {
  "dashboard.read": "Dashboard access",
  "patients.read": "View patients",
  "patients.write": "Manage patients",
  "appointments.read": "View appointments",
  "appointments.write": "Manage appointments",
  "billing.read": "View billing",
  "billing.write": "Manage billing",
  "inventory.read": "Inventory access",
  "ai_notes.read": "AI notes",
  "settings.manage": "Clinic settings",
  "roles.manage": "Role permissions",
  "prescriptions.write": "Write prescriptions",
};

const adminPassword = await bcrypt.hash("admin12345", 10);
const doctorPassword = await bcrypt.hash("doctor12345", 10);
const receptionistPassword = await bcrypt.hash("desk12345", 10);

await db
  .insert(schema.users)
  .values([
    {
      name: "Clinic Admin",
      email: "admin@clinic.local",
      passwordHash: adminPassword,
      role: "admin",
    },
    {
      name: "Dr. Asha Mehta",
      email: "doctor@clinic.local",
      passwordHash: doctorPassword,
      role: "doctor",
    },
    {
      name: "Reception Desk",
      email: "reception@clinic.local",
      passwordHash: receptionistPassword,
      role: "receptionist",
    },
  ])
  .onConflictDoNothing();

await db
  .insert(schema.rolePermissions)
  .values(
    permissions.map((permission) => ({
      key: permission,
      label: permissionLabels[permission],
      description: `Allows ${permissionLabels[permission].toLowerCase()}.`,
    })),
  )
  .onConflictDoNothing();

const seededPermissions = await db.select().from(schema.rolePermissions);
const permissionIdByKey = new Map(
  seededPermissions.map((permission) => [permission.key as Permission, permission.id]),
);
const rolePermissionValues = roles.flatMap((role) =>
  permissions.map((permission) => {
    const permissionId = permissionIdByKey.get(permission);
    if (!permissionId) {
      throw new Error(`Missing seeded permission: ${permission}`);
    }

    return {
      role,
      permissionId,
      hasPermission: rolePermissions[role].includes(permission),
    };
  }),
);

await db
  .insert(schema.roleHasPermissions)
  .values(rolePermissionValues)
  .onConflictDoUpdate({
    target: [schema.roleHasPermissions.role, schema.roleHasPermissions.permissionId],
    set: {
      hasPermission: sql`excluded.has_permission`,
      updatedAt: new Date(),
    },
  });

const [doctor] = await db
  .select()
  .from(schema.users)
  .where(eq(schema.users.email, "doctor@clinic.local"))
  .limit(1);

const [patient] = await db
  .insert(schema.patients)
  .values({
    firstName: "Priya",
    lastName: "Raman",
    email: "priya@example.com",
    phone: "+919876543210",
    dateOfBirth: "1991-03-12",
    gender: "female",
    bloodGroup: "B+",
    allergies: "Penicillin",
    medicalHistory: "Seasonal asthma. No surgeries.",
  })
  .onConflictDoNothing()
  .returning();

if (doctor && patient) {
  await db.insert(schema.appointments).values({
    patientId: patient.id,
    doctorId: doctor.id,
    startsAt: new Date(Date.now() + 60 * 60 * 1000),
    endsAt: new Date(Date.now() + 90 * 60 * 1000),
    reason: "Follow-up consultation",
  });
}

console.log("Seed completed");
