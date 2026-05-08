"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useState } from "react";
import { TRPCProvider } from "@/lib/trpc/provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 2,
            networkMode: "offlineFirst",
          },
          mutations: {
            networkMode: "offlineFirst",
          },
        },
      }),
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <QueryClientProvider client={queryClient}>
        <TRPCProvider queryClient={queryClient}>{children}</TRPCProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
