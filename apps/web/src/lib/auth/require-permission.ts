import { redirect } from "next/navigation";
import { getCurrentUser } from "@/modules/auth/auth.service";
import { hasPermission } from "@/modules/auth/permissions";

export async function requirePermission(permission: string) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "admin" && !hasPermission(user.permissions, permission)) {
    redirect("/dashboard");
  }

  return user;
}
