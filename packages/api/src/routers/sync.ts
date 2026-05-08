import { schema } from "@mediclinicpro/db";
import { offlineMutationSchema } from "@mediclinicpro/validations";
import { z } from "zod";
import { protectedProcedure, router } from "../trpc";

export const syncRouter = router({
  push: protectedProcedure
    .input(z.object({ mutations: z.array(offlineMutationSchema).min(1).max(100) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(schema.syncActions).values(
        input.mutations.map((mutation) => ({
          entity: mutation.entity,
          action: mutation.operation,
          payload: mutation.payload as Record<string, unknown>,
        })),
      );

      return {
        accepted: input.mutations.map((mutation) => mutation.id),
        conflicts: [],
      };
    }),
});
