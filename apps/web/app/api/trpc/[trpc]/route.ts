import { appRouter } from "@mediclinicpro/api";
import { createTRPCContext } from "@mediclinicpro/api/context";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

function handler(request: Request) {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: request,
    router: appRouter,
    createContext: () => createTRPCContext(request.headers),
    onError({ path, error }) {
      console.error(`tRPC failed on ${path ?? "<unknown>"}: ${error.message}`);
    },
  });
}

export { handler as GET, handler as POST };
