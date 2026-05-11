"use client";

import { hasPermission } from "@/modules/auth/permissions";
import { useCurrentUser } from "./use-current-user";

export function usePermission(permission: string) {
  const currentUser = useCurrentUser();

  return {
    ...currentUser,
    allowed:
      currentUser.data?.role === "admin" ||
      hasPermission(currentUser.data?.permissions ?? [], permission),
  };
}
