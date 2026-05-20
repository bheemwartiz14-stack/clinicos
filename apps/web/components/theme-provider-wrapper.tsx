"use client";

import { ThemeProvider } from "@/components/theme-provider";

interface ThemeProviderWrapperProps {
  children: React.ReactNode;
}

export function ThemeProviderWrapper({ children }: ThemeProviderWrapperProps) {
  return <ThemeProvider>{children}</ThemeProvider>;
}