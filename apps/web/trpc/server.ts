import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { can, type Permission } from "@mediclinic/rbac";
import type { TRPCContext } from "./context";

const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({ ctx: { session: ctx.session } });
});

export function permissionProcedure(permission: Permission) {
  return protectedProcedure.use(({ ctx, next }) => {
    if (!can(ctx.session.role, permission)) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    return next({ ctx });
  });
}
