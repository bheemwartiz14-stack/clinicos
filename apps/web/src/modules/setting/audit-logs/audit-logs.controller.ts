"use server";

import { getAuditLogsPageData } from "./audit-logs.service";
import type { AuditLogsPageSearchParams } from "./audit-logs.types";

export async function auditLogsPageController(searchParams: Promise<AuditLogsPageSearchParams>) {
  return getAuditLogsPageData(searchParams);
}
