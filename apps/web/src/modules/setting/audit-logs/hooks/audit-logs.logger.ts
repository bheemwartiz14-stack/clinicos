import { db, schema } from "@mediclinicpro/db";
import type { CreateAuditLogInput } from "../audit-logs.types";

export async function createAuditLog(input: CreateAuditLogInput) {
  if (!input.userId) {
    console.error("Audit log userId is required");
    return null;
  }

  return db.insert(schema.activityLogs).values({
    action: input.action,
    module: input.module,
    userId: input.userId,
    description: input.description ?? null,
    userName: input.userName ?? null,
    ipAddress: input.ipAddress ?? null,
    metadata: input.metadata ? JSON.stringify(input.metadata) : null,
  });
}

export const createActivityLog = createAuditLog;
