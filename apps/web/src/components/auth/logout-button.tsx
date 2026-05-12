"use client";

import { Button } from "@mediclinicpro/ui/components/button";
import { LogOut } from "lucide-react";
import { useState } from "react";

import { logoutAction } from "@/modules/auth/auth.actions";

export function LogoutButton() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    await logoutAction();
  }

  return (
    <Button
      disabled={isLoggingOut}
      onClick={handleLogout}
      size="sm"
      title="Log out"
      type="button"
      variant="ghost"
    >
      <LogOut size={16} />
      {isLoggingOut ? "Logging out..." : "Logout"}
    </Button>
  );
}
