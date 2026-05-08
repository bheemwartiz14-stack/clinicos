import { schema, type Db } from "@mediclinicpro/db";
import type { invoiceCreateSchema } from "@mediclinicpro/validations";
import { desc, eq } from "drizzle-orm";
import type { z } from "zod";

export function listInvoices(db: Db) {
  return db.query.invoices.findMany({
    orderBy: desc(schema.invoices.createdAt),
    with: { patient: true },
    limit: 50,
  });
}

export function createInvoice(db: Db, input: z.infer<typeof invoiceCreateSchema>) {
  const subtotal = input.lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  return db
    .insert(schema.invoices)
    .values({
      patientId: input.patientId,
      appointmentId: input.appointmentId,
      invoiceNumber: `INV-${Date.now()}`,
      items: input.lineItems,
      subtotal: subtotal.toFixed(2),
      total: subtotal.toFixed(2),
    })
    .returning();
}

export function markInvoicePaid(db: Db, id: string) {
  return db
    .update(schema.invoices)
    .set({ status: "paid", paidAt: new Date(), updatedAt: new Date() })
    .where(eq(schema.invoices.id, id))
    .returning();
}
