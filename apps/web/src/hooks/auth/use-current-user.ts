"use client";

import { useQuery } from "@tanstack/react-query";
import type { SessionUser } from "@/modules/auth/auth.types";

export function useCurrentUser() {
  return useQuery({
    queryFn: async () => {
      const response = await fetch("/api/auth/me");

      if (!response.ok) {
        return null;
      }

      const data = (await response.json()) as { user: SessionUser | null };
      return data.user;
    },
    queryKey: ["auth", "current-user"],
    staleTime: 60_000,
  });
}
