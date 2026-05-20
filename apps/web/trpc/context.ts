import { getSession } from "@/lib/auth";

export async function createTRPCContext() {
  return {
    session: await getSession()
  };
}

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;
