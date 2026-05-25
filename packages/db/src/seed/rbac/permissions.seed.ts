import { db, permissions } from "@mediclinic/db";
import { permissionsData } from "@mediclinic/db/data/permissions.data";
import { createScopedLogger } from "@mediclinic/logger";

const logger = createScopedLogger("permissions-seed");

export async function seedPermissions() {
  logger.info("Seeding permissions");

  await db
    .insert(permissions)
    .values(permissionsData)
    .onConflictDoNothing({
      target: permissions.code,
    });

  logger.info("Permissions seeded");
}
