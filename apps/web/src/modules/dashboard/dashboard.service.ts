import { db, schema } from "@mediclinicpro/db";
import { count } from "drizzle-orm";

import { getDashboardPageModel } from "./dashboard.model";

async function getTableCount(table: any) {
  const [result] = await db.select({ value: count() }).from(table);

  return Number(result?.value ?? 0);
}

export async function getDashboard() {
  const [
    totalPatients,
    totalUsers,
    totalRoles,
    totalPermissions,
  ] = await Promise.all([
    getTableCount(schema.patients),
    getTableCount(schema.users),
    getTableCount(schema.roles),
    getTableCount(schema.permissions),
  ]);

  return getDashboardPageModel({
    totalPatients,
    totalUsers,
    totalRoles,
    totalPermissions,
  });
}