import type { Metadata } from "next";
import { requirePagePermission } from "@/lib/auth";
import { auditService } from "@modules/doctors/services/audit.service";
import { AuditLogsView } from "@modules/doctors/views/audit-logs-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Audit Logs | Clinicos",
};

export default async function AuditLogsPage() {
  await requirePagePermission("audit.view");
  const { logs } = await auditService.list({ limit: 100 });
  return <AuditLogsView logs={logs} />;
}
