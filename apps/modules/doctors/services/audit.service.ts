import { auditLogsService } from "@modules/auditlog/audit-logs.service";
import type { AuditLogRecord, AuditLogFilters } from "@modules/auditlog/audit-logs.types";

export type { AuditLogRecord, AuditLogFilters };

export const auditService = {
  async log(params: {
    userId?: string;
    action: string;
    entity: string;
    entityId?: string;
    oldValues?: Record<string, unknown>;
    newValues?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return auditLogsService.create({
      userId: params.userId ?? null,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId ?? null,
      oldValues: params.oldValues ?? null,
      newValues: params.newValues ?? null,
      ipAddress: params.ipAddress ?? null,
      userAgent: params.userAgent ?? null,
    });
  },

  async list(params?: {
    entity?: string;
    action?: string;
    userId?: string;
    fromDate?: Date;
    toDate?: Date;
    limit?: number;
    offset?: number;
  }) {
    const result = await auditLogsService.list({
      entity: params?.entity,
      action: params?.action,
      userId: params?.userId,
      fromDate: params?.fromDate,
      toDate: params?.toDate,
      page: params?.offset ? Math.floor(params.offset / (params.limit ?? 50)) + 1 : 1,
      limit: params?.limit ?? 50,
    });

    return { logs: result.logs, total: result.total };
  },
};
