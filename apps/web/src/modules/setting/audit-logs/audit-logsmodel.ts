import type { AuditLogListItem, AuditLogStats, AuditLogsPageModel } from "./audit-logs.types";

type AuditLogsPageModelInput = {
  logs: AuditLogListItem[];
  stats: AuditLogStats;
  query?: string;
};

export function getAuditLogsPageModel({
  logs,
  query = "",
  stats,
}: AuditLogsPageModelInput): AuditLogsPageModel {
  return {
    title: "Activity Logs",
    description: "Track user actions, module changes, and system activity.",
    breadcrumb: ["Workspace", "Activity Logs"],
    logs,
    stats,
    query,
  };
}
