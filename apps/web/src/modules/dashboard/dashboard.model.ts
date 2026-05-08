import type { DashboardPageModel } from "./dashboard.types";

export function getDashboardPageModel(): DashboardPageModel {
  return {
    title: "Clinic Operations",
    breadcrumb: ["Workspace", "Dashboard"],
  };
}
