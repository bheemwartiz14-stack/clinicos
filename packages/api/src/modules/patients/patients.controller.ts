import { patientCreateSchema, patientUpdateSchema } from "@mediclinicpro/validations";
import { z } from "zod";
import { permissionProcedure, router } from "../../trpc";
import { createPatient, deletePatient, getPatientById, listPatients, updatePatient } from "./patients.service";

export const patientsRouter = router({
  list: permissionProcedure("patients.read")
    .input(z.object({ query: z.string().optional(), limit: z.number().int().min(1).max(100).default(25) }))
    .query(({ ctx, input }) => listPatients(ctx.db, input)),

  byId: permissionProcedure("patients.read")
    .input(z.object({ id: z.string().uuid() }))
    .query(({ ctx, input }) => getPatientById(ctx.db, input.id)),

  create: permissionProcedure("patients.write")
    .input(patientCreateSchema)
    .mutation(({ ctx, input }) => createPatient(ctx.db, input)),

  update: permissionProcedure("patients.write")
    .input(patientUpdateSchema)
    .mutation(({ ctx, input }) => updatePatient(ctx.db, input)),

  delete: permissionProcedure("patients.write")
    .input(z.object({ id: z.string().uuid() }))
    .mutation(({ ctx, input }) => deletePatient(ctx.db, input.id)),
});
