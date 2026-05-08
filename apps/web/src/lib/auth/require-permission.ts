import { redirect } from "next/navigation";
import { getCurrentUser } from "@/modules/auth/auth.service";

export async function requirePermission(_permission: string) {
  const user = await getCurrentUser();
  console.log(user);
//   if (!user) {
//     redirect("/login");
//   }
//   if (user.role !== "admin") {
//     redirect("/dashboard");
//   }
  return user;
}