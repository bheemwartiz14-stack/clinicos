import { schema } from "@mediclinicpro/db";
import { prescriptionCreateSchema } from "@mediclinicpro/validations";
import { desc } from "drizzle-orm";
import { permissionProcedure, router } from "../trpc";

export const prescriptionsRouter = router({
  list: permissionProcedure("patients.read").query(({ ctx }) => {
    return ctx.db.query.prescriptions.findMany({
      orderBy: desc(schema.prescriptions.createdAt),
      with: { patient: true, doctor: true },
      limit: 50,
    });
  }),

  create: permissionProcedure("prescriptions.write")
    .input(prescriptionCreateSchema)
    .mutation(({ ctx, input }) => ctx.db.insert(schema.prescriptions).values(input).returning()),
});
