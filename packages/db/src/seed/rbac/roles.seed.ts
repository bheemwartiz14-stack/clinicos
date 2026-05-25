import { db, roles } from "@mediclinic/db";
import { rolesData } from "@mediclinic/db/data/roles.data";
import { createScopedLogger } from "@mediclinic/logger";

const logger = createScopedLogger("roles-seed");

export async function seedRoles() {
  logger.info("Seeding roles");

  await db
    .insert(roles)
    .values(rolesData)
    .onConflictDoNothing({
      target: roles.code,
    });

  logger.info("Roles seeded");
}
