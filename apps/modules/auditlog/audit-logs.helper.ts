import { auditLogsService } from "./audit-logs.service";
import type { CreateAuditLogInput } from "./audit-logs.types";

export const auditLogger = {
  async log(options: CreateAuditLogInput) {
    return auditLogsService.create(options);
  },

  async logCreate(userId: string, entity: string, entityId: string, newValues: Record<string, unknown>, meta?: { ipAddress?: string; userAgent?: string }) {
    return this.log({ userId, action: "CREATE", entity, entityId, newValues, ...meta });
  },

  async logUpdate(userId: string, entity: string, entityId: string, oldValues: Record<string, unknown>, newValues: Record<string, unknown>, meta?: { ipAddress?: string; userAgent?: string }) {
    return this.log({ userId, action: "UPDATE", entity, entityId, oldValues, newValues, ...meta });
  },

  async logDelete(userId: string, entity: string, entityId: string, oldValues: Record<string, unknown>, meta?: { ipAddress?: string; userAgent?: string }) {
    return this.log({ userId, action: "DELETE", entity, entityId, oldValues, ...meta });
  },

  async logLogin(userId: string, meta?: { ipAddress?: string; userAgent?: string }) {
    return this.log({ userId, action: "LOGIN", entity: "AUTH", ...meta });
  },

  async logLogout(userId: string, meta?: { ipAddress?: string; userAgent?: string }) {
    return this.log({ userId, action: "LOGOUT", entity: "AUTH", ...meta });
  },
};
