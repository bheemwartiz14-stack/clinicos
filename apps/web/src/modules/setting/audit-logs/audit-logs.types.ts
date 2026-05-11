export type AuditLogListItem = {
  id: string;
  action: string;
  module: string;
  description: string | null;
  userId: string | null;
  userName: string | null;
  ipAddress: string | null;
  createdAt: Date;
};

export type AuditLogStats = {
  totalLogs: number;
  todayLogs: number;
  thisWeekLogs: number;
};

export type AuditLogsPageSearchParams = {
  q?: string;
};

export type AuditLogsPageModel = {
  title: string;
  description: string;
  breadcrumb: string[];
  logs: AuditLogListItem[];
  stats: AuditLogStats;
  query: string;
};

export type CreateAuditLogInput = {
  action: string;
  module: string;
  description?: string;
  userId?: string;
  userName?: string;
  ipAddress?: string;
  metadata?: unknown;
};