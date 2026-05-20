"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(resolvedTheme === "light" ? "dark" : "light");
  };

  return (
    <button
      onClick={toggleTheme}
      className={`grid h-10 w-10 place-items-center rounded-lg border border-border bg-card transition hover:border-primary ${className || ""}`}
      aria-label="Toggle theme"
    >
      {resolvedTheme === "light" ? (
        <Moon className="h-5 w-5 text-foreground" aria-hidden="true" />
      ) : (
        <Sun className="h-5 w-5 text-foreground" aria-hidden="true" />
      )}
    </button>
  );
}