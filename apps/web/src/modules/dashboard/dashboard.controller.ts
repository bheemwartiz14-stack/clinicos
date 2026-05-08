import { getDashboard } from "./dashboard.service";

export async function dashboardPageController() {
  return getDashboard();
}
