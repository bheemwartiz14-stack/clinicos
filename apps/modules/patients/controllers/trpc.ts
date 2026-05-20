import { permissionProcedure, router } from "@/trpc/server";
import { patientCreateSchema } from "../validations/patient.validation";
import { patientService } from "../services/patient.service";

export const patientRouter = router({
  list: permissionProcedure("patients.view").query(({ ctx }) => patientService.list(ctx.session.branchId)),
  create: permissionProcedure("patients.create").input(patientCreateSchema).mutation(({ ctx, input }) => patientService.create(ctx.session.branchId, input))
});
