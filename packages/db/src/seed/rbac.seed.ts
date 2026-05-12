// src/db/seeds/rbac.seed.ts

import { db, schema } from "../index.js";

const modules = [
  "dashboard",
  "patients",
  "doctors",
  "appointments",
  "billing",
  "general-settings",
  "audit-logs",
  "login-history",
  "settings",
  "departments",
  "users",
  "roles",
  "permissions",
  "branches",
] as const;

type ModuleName = (typeof modules)[number];

const moduleActions: Record<ModuleName, string[]> = {
  dashboard: ["view"],

  patients: ["view", "create", "edit", "delete"],
  doctors: ["view", "create", "edit", "delete", "schedule.view", "leave.view"],
  appointments: ["view", "create", "edit", "delete"],
  billing: ["view", "create", "edit", "delete"],

  "general-settings": ["view", "create", "edit", "delete"],
  branches: ["view", "create", "edit", "delete"],

  "audit-logs": ["view"],
  "login-history": ["view"],

  settings: ["manage"],
  departments: ["manage", "view", "create", "edit", "delete", "analytics.view"],
  users: ["manage"],
  roles: ["manage"],
  permissions: ["manage"],
};

export async function seedRBAC() {
  console.log("🌱 RBAC seeding started...");

  try {
    const rolesData: (typeof schema.roles.$inferInsert)[] = [
      {
        name: "admin",
        description: "System Administrator",
      },
      {
        name: "doctor",
        description: "Doctor Role",
      },
      {
        name: "receptionist",
        description: "Receptionist Role",
      },
      {
        name: "patient",
        description: "Patient Role",
      },
    ];

    await db.insert(schema.roles).values(rolesData).onConflictDoNothing({
      target: schema.roles.name,
    });

    console.log("✅ Roles inserted");

    const roles = await db.query.roles.findMany();

    const adminRole = roles.find((role) => role.name === "admin");
    const doctorRole = roles.find((role) => role.name === "doctor");
    const receptionistRole = roles.find(
      (role) => role.name === "receptionist",
    );
    const patientRole = roles.find((role) => role.name === "patient");

    if (!adminRole || !doctorRole || !receptionistRole || !patientRole) {
      throw new Error("Required roles not found");
    }

    const permissionData: (typeof schema.permissions.$inferInsert)[] =
      modules.flatMap((module) =>
        moduleActions[module].map((action) => ({
          name: `${module}.${action}`,
          description: `${action} ${module}`,
          module,
          action,
        })),
      );

    await db
      .insert(schema.permissions)
      .values(permissionData)
      .onConflictDoNothing({
        target: schema.permissions.name,
      });

    console.log("✅ Permissions inserted");

    const permissions = await db.query.permissions.findMany();

    async function mapPermissions(
      roleId: string,
      permissionNames: string[],
      label: string,
    ) {
      const mappings: (typeof schema.roleHasPermissions.$inferInsert)[] =
        permissions
          .filter((permission) => permissionNames.includes(permission.name))
          .map((permission) => ({
            roleId,
            permissionId: permission.id,
          }));

      if (mappings.length > 0) {
        await db
          .insert(schema.roleHasPermissions)
          .values(mappings)
          .onConflictDoNothing();
      }

      console.log(`✅ ${label} permissions mapped`);
    }

    const adminMappings: (typeof schema.roleHasPermissions.$inferInsert)[] =
      permissions.map((permission) => ({
        roleId: adminRole.id,
        permissionId: permission.id,
      }));

    if (adminMappings.length > 0) {
      await db
        .insert(schema.roleHasPermissions)
        .values(adminMappings)
        .onConflictDoNothing();
    }

    console.log("✅ Admin mapped to all permissions");

    await mapPermissions(
      doctorRole.id,
      [
        "dashboard.view",

        "patients.view",
        "patients.create",
        "patients.edit",

        "doctors.view",
        "doctors.schedule.view",
        "doctors.leave.view",

        "appointments.view",
        "appointments.create",
        "appointments.edit",

        "settings.manage",

        "audit-logs.view",
        "login-history.view",
      ],
      "Doctor",
    );

    await mapPermissions(
      receptionistRole.id,
      [
        "dashboard.view",

        "patients.view",
        "patients.create",

        "appointments.view",
        "appointments.create",
        "appointments.edit",

        "billing.view",
        "billing.create",

        "audit-logs.view",
        "login-history.view",
      ],
      "Receptionist",
    );

    await mapPermissions(
      patientRole.id,
      [
        "dashboard.view",

        "patients.view",

        "appointments.view",
        "appointments.create",

        "billing.view",

        "login-history.view",
      ],
      "Patient",
    );

    console.log("🎉 RBAC seeding completed successfully");
  } catch (error) {
    console.error("❌ RBAC seed failed:", error);
    throw error;
  }
}

if (import.meta.main) {
  seedRBAC()
    .then(() => {
      console.log("✅ Seed finished");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Seed error:", error);
      process.exit(1);
    });
}
