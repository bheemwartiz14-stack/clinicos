import { loginController } from "@/modules/auth/auth.controller";

export async function POST(request: Request) {
  return loginController(request);
}
