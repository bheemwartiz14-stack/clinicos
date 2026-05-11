import { logoutController } from "@/modules/auth/auth.controller";

export async function POST() {
  return logoutController();
}
