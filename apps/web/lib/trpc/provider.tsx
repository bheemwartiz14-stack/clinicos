"use client";

import type { AppRouter } from "@mediclinicpro/api";
import type { QueryClient } from "@tanstack/react-query";
import { httpBatchLink, loggerLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { useState } from "react";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

export function TRPCProvider({
  children,
  queryClient,
}: {
  children: React.ReactNode;
  queryClient: QueryClient;
}) {
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        loggerLink({
          enabled: (opts) => process.env.NODE_ENV === "development" || opts.direction === "down",
        }),
        httpBatchLink({
          url: "/api/trpc",
          transformer: superjson,
        }),
      ],
    }),
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      {children}
    </trpc.Provider>
  );
}
