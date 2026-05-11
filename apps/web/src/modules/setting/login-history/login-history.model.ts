import type {
  LoginHistoryListItem,
  LoginHistoryPageModel,
  LoginHistoryStats,
} from "./login-history.types";

type LoginHistoryPageModelInput = {
  logins: LoginHistoryListItem[];
  stats: LoginHistoryStats;
  query?: string;
};

export function getLoginHistoryPageModel({
  logins,
  query = "",
  stats,
}: LoginHistoryPageModelInput): LoginHistoryPageModel {
  return {
    title: "Login History",
    description: "Review user sign-in sessions, IP addresses, devices, and expiry times.",
    breadcrumb: ["Workspace", "System & Admin", "Audit Logs", "Login History"],
    logins,
    stats,
    query,
  };
}
