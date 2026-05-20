import { permissionProcedure, router } from "@/trpc/server";
import { patientService } from "../services/patient.service";
import { z } from "zod";

export const patientRouter = router({
  list: permissionProcedure("patients.view").query(({ ctx }) => patientService.list({ branchId: ctx.session.branchId })),
  get: permissionProcedure("patients.view").input(z.object({ id: z.string() })).query(async ({ input }) => {
    return patientService.getById(input.id);
  })
});