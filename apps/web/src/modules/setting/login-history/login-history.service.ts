import { redirect } from "next/navigation";
import { getCurrentUser } from "@/modules/auth/auth.service";
import { hasPermission } from "@/modules/auth/permissions";
import { getLoginHistoryPageModel } from "./login-history.model";
import {
  countLoginHistory,
  countLoginHistorySince,
  findLoginHistory,
} from "./login-history.repository";
import type { LoginHistoryPageSearchParams } from "./login-history.types";

async function requireLoginHistoryPermission() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "admin" && !hasPermission(user.permissions, "login-history.view")) {
    redirect("/dashboard");
  }

  return user;
}

export async function getLoginHistoryPageData(
  searchParams: Promise<LoginHistoryPageSearchParams>,
) {
  await requireLoginHistoryPermission();

  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [logins, totalLogins, todayLogins, thisWeekLogins] = await Promise.all([
    findLoginHistory({ query }),
    countLoginHistory(query),
    countLoginHistorySince(today),
    countLoginHistorySince(sevenDaysAgo),
  ]);

  return getLoginHistoryPageModel({
    logins,
    query,
    stats: {
      totalLogins,
      todayLogins,
      thisWeekLogins,
    },
  });
}
