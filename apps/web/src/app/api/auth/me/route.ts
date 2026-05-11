import { currentUserController } from "@/modules/auth/auth.controller";

export async function GET() {
  return currentUserController();
}
