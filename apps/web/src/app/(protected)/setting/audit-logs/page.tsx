import { auditLogsPageController } from "@/modules/setting/audit-logs/audit-logs.controller";
import type { AuditLogsPageSearchParams } from "@/modules/setting/audit-logs/audit-logs.types";
import { AuditLogsView } from "@/modules/setting/audit-logs/views/audit-logs.view";

type ActivityLogsPageProps = {
  searchParams: Promise<AuditLogsPageSearchParams>;
};

export default async function ActivityLogsPage({ searchParams }: ActivityLogsPageProps) {
  const pageData = await auditLogsPageController(searchParams);

  return <AuditLogsView {...pageData} />;
}
