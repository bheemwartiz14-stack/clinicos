"use server";

import { getLoginHistoryPageData } from "./login-history.service";
import type { LoginHistoryPageSearchParams } from "./login-history.types";

export async function loginHistoryPageController(
  searchParams: Promise<LoginHistoryPageSearchParams>,
) {
  return getLoginHistoryPageData(searchParams);
}
