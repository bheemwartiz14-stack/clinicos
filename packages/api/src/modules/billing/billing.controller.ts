import { invoiceCreateSchema } from "@mediclinicpro/validations";
import { z } from "zod";
import { permissionProcedure, router } from "../../trpc";
import { createInvoice, listInvoices, markInvoicePaid } from "./billing.service";

export const billingRouter = router({
  list: permissionProcedure("billing.read").query(({ ctx }) => listInvoices(ctx.db)),

  create: permissionProcedure("billing.write")
    .input(invoiceCreateSchema)
    .mutation(({ ctx, input }) => createInvoice(ctx.db, input)),

  markPaid: permissionProcedure("billing.write")
    .input(z.object({ id: z.string().uuid() }))
    .mutation(({ ctx, input }) => markInvoicePaid(ctx.db, input.id)),
});
