import { permissionProcedure, router } from "@/trpc/server";
import { appointmentCreateSchema } from "../validations/appointment.validation";
import { appointmentService } from "../services/appointment.service";

export const appointmentRouter = router({
  listUpcoming: permissionProcedure("appointments.view").query(({ ctx }) => appointmentService.listUpcoming(ctx.session.branchId)),
  create: permissionProcedure("appointments.manage").input(appointmentCreateSchema).mutation(({ ctx, input }) => appointmentService.create(ctx.session.branchId, input))
});
