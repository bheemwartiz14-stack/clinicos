import { type Permission, rolePermissions } from "@mediclinicpro/types";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TRPCContext } from "./context";

const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({ ctx: { ...ctx, user: ctx.user } });
});

export function permissionProcedure(permission: Permission) {
  return protectedProcedure.use(({ ctx, next }) => {
    if (!rolePermissions[ctx.user.role].includes(permission)) {
      throw new TRPCError({ code: "FORBIDDEN", message: `Missing permission: ${permission}` });
    }

    return next({ ctx });
  });
}
