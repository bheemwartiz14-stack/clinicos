import { appointmentCreateSchema } from "@mediclinicpro/validations";
import { z } from "zod";
import { permissionProcedure, router } from "../../trpc";
import { createAppointment, listAppointmentsByRange, updateAppointmentStatus } from "./appointments.service";

export const appointmentsRouter = router({
  byRange: permissionProcedure("appointments.read")
    .input(z.object({ from: z.coerce.date(), to: z.coerce.date() }))
    .query(({ ctx, input }) => listAppointmentsByRange(ctx.db, input)),

  create: permissionProcedure("appointments.write")
    .input(appointmentCreateSchema)
    .mutation(({ ctx, input }) => createAppointment(ctx.db, input)),

  updateStatus: permissionProcedure("appointments.write")
    .input(
      z.object({
        id: z.string().uuid(),
        status: z.enum(["scheduled", "checked_in", "completed", "cancelled"]),
      }),
    )
    .mutation(({ ctx, input }) => updateAppointmentStatus(ctx.db, input)),
});
