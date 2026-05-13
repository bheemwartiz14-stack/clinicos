import { z } from "zod";
import { createAppointmentFromForm } from "@/modules/appointments/appointments.service";
import { publicProcedure, router } from "./trpc";

const offlineMutationSchema = z.object({
  baseVersion: z.number().optional(),
  createdAt: z.string(),
  entity: z.enum(["patient", "appointment", "invoice", "prescription"]),
  id: z.string(),
  operation: z.enum(["create", "update", "delete"]),
  payload: z.record(z.unknown()),
});

function formDataFromPayload(payload: Record<string, unknown>) {
  const formData = new FormData();

  for (const [key, value] of Object.entries(payload)) {
    if (typeof value === "string") {
      formData.set(key, value);
    }
  }

  return formData;
}

export const appRouter = router({
  sync: router({
    push: publicProcedure
      .input(z.object({ mutations: z.array(offlineMutationSchema).max(100) }))
      .mutation(async ({ input }) => {
        const accepted: string[] = [];
        const conflicts: Array<{ mutationId: string; serverValue: unknown; localValue: unknown }> =
          [];

        for (const mutation of input.mutations) {
          if (mutation.entity !== "appointment") {
            conflicts.push({
              localValue: mutation.payload,
              mutationId: mutation.id,
              serverValue: "Unsupported offline entity.",
            });
            continue;
          }

          const result = await createAppointmentFromForm(formDataFromPayload(mutation.payload));

          if (result.ok) {
            accepted.push(mutation.id);
          } else {
            conflicts.push({
              localValue: mutation.payload,
              mutationId: mutation.id,
              serverValue: result.message,
            });
          }
        }

        return { accepted, conflicts };
      }),
  }),
});

export type AppRouter = typeof appRouter;
