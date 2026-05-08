import { db, schema } from "../index.js";

const modules = [
  "dashboard",
  "patients",
  "doctors",
  "appointments",
  "billing",
  "reports",
  "settings",
  "roles",
  "permissions",
] as const;

const actions = ["view", "create", "edit", "delete"] as const;

export async function seedRBAC() {
  console.log("🌱 RBAC seeding started...");

  try {
    const rolesData: (typeof schema.roles.$inferInsert)[] = [
      { name: "admin", description: "System Administrator" },
      { name: "doctor", description: "Doctor Role" },
      { name: "receptionist", description: "Receptionist Role" },
      { name: "user", description: "Standard User" },
    ];

    await db.insert(schema.roles).values(rolesData).onConflictDoNothing({
      target: schema.roles.name,
    });

    console.log("✅ Roles inserted");

    const roles = await db.query.roles.findMany();

    const adminRole = roles.find((role) => role.name === "admin");
    const doctorRole = roles.find((role) => role.name === "doctor");
    const receptionistRole = roles.find((role) => role.name === "receptionist");
    const userRole = roles.find((role) => role.name === "user");

    if (!adminRole || !doctorRole || !receptionistRole || !userRole) {
      throw new Error("Required roles not found");
    }

    const permissionData: (typeof schema.permissions.$inferInsert)[] = modules.flatMap((module) =>
      actions.map((action) => ({
        name: `${module}:${action}`,
        description: `${action} ${module}`,
        module,
        action,
      })),
    );

    await db.insert(schema.permissions).values(permissionData).onConflictDoNothing({
      target: schema.permissions.name,
    });

    console.log("✅ Permissions inserted");

    const permissions = await db.query.permissions.findMany();

    const adminMappings: (typeof schema.roleHasPermissions.$inferInsert)[] = permissions.map(
      (permission) => ({
        roleId: adminRole.id,
        permissionId: permission.id,
      }),
    );

    await db.insert(schema.roleHasPermissions).values(adminMappings).onConflictDoNothing();

    console.log("✅ Admin mapped to all permissions");

    const doctorMappings: (typeof schema.roleHasPermissions.$inferInsert)[] = permissions
      .filter((permission) =>
        [
          "dashboard:view",
          "patients:view",
          "patients:create",
          "patients:edit",
          "appointments:view",
          "appointments:create",
          "appointments:edit",
          "reports:view",
        ].includes(permission.name),
      )
      .map((permission) => ({
        roleId: doctorRole.id,
        permissionId: permission.id,
      }));

    await db.insert(schema.roleHasPermissions).values(doctorMappings).onConflictDoNothing();

    console.log("✅ Doctor permissions mapped");

    const receptionistMappings: (typeof schema.roleHasPermissions.$inferInsert)[] = permissions
      .filter((permission) =>
        [
          "dashboard:view",
          "patients:view",
          "patients:create",
          "patients:edit",
          "appointments:view",
          "appointments:create",
          "appointments:edit",
          "billing:view",
          "billing:create",
        ].includes(permission.name),
      )
      .map((permission) => ({
        roleId: receptionistRole.id,
        permissionId: permission.id,
      }));

    await db.insert(schema.roleHasPermissions).values(receptionistMappings).onConflictDoNothing();

    console.log("✅ Receptionist permissions mapped");

    const userMappings: (typeof schema.roleHasPermissions.$inferInsert)[] = permissions
      .filter((permission) => permission.action === "view")
      .map((permission) => ({
        roleId: userRole.id,
        permissionId: permission.id,
      }));

    await db.insert(schema.roleHasPermissions).values(userMappings).onConflictDoNothing();

    console.log("✅ User mapped to view permissions");

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
