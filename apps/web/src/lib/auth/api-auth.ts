import { NextResponse } from "next/server";
import { getCurrentUser } from "@/modules/auth/auth.service";
import { hasPermission } from "@/modules/auth/permissions";

export async function requireApiPermission(permission: string) {
  const user = await getCurrentUser();
  if (!user) {
    return {
      user: null,
      error: NextResponse.json({ message: "Unauthorized" }, { status: 401 }),
    };
  }
  if (user.role !== "admin" && !hasPermission(user.permissions, permission)) {
    return {
      user: null,
      error: NextResponse.json({ message: "Forbidden" }, { status: 403 }),
    };
  }

  return {
    user,
    error: null,
  };
}
