import { createScopedLogger } from "@mediclinic/logger";
import { seedRoles } from "./rbac/roles.seed";
import { seedPermissions } from "./rbac/permissions.seed";
import { seedRolePermissions } from "./rbac/role-permissions.seed";
import { seedDepartments } from "./department.seed";
import { seedSpecialties } from "./specialty.seed";
import { seedNotificationTemplates } from "./notification-template.seed";
import { seedUsers } from "./users.seed";
const logger = createScopedLogger("db-seed");
async function main() {
  try {
    logger.info("Starting database seed");
    await seedRoles();
    await seedPermissions();
    await seedRolePermissions();
    logger.info("All RBAC seeders completed");
    await seedDepartments();
    logger.info("Department seeders completed");
    await seedSpecialties();
    logger.info("Specialty seeders completed");
    await seedNotificationTemplates();
    logger.info("Notification template seeders completed");
    await seedUsers();
    logger.info("Users and staff profiles seeders completed");
    logger.info("Database seeding completed successfully");
  } catch (error) {
    logger.error("Seeder error", { error });
    process.exit(1);
  }
}

main();
