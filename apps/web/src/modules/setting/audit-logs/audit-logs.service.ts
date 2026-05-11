import { redirect } from "next/navigation";
import { getCurrentUser } from "@/modules/auth/auth.service";
import { countAuditLogs, countAuditLogsSince, findAuditLogs } from "./audit-logs.repository";
import type { AuditLogsPageSearchParams } from "./audit-logs.types";
import { getAuditLogsPageModel } from "./audit-logsmodel";

async function requireActivityLogsPermission() {
  const user = await getCurrentUser();
  if (!user) {
    console.error("Activity logs error: user not logged in");
    redirect("/login");
  }
  //   if (!hasPermission(user.role, "activityLogs.read")) {
  //     console.error("Activity logs error: permission denied", user.role);
  //     redirect("/dashboard");
  //   }
  return user;
}

export async function getAuditLogsPageData(searchParams: Promise<AuditLogsPageSearchParams>) {
  await requireActivityLogsPermission();

  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const [logs, totalLogs, todayLogs, thisWeekLogs] = await Promise.all([
    findAuditLogs({ query }),
    countAuditLogs(query),
    countAuditLogsSince(today),
    countAuditLogsSince(sevenDaysAgo),
  ]);

  return getAuditLogsPageModel({
    logs,
    query,
    stats: {
      totalLogs,
      todayLogs,
      thisWeekLogs,
    },
  });
}
