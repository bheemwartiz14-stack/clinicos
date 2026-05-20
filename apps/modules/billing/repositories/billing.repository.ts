import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { insuranceClaims, invoiceItems, invoices, payments } from "@mediclinic/db";
import type { InsuranceClaimCreateInput, InvoiceCreateInput, PaymentCreateInput } from "../validations/billing.validation";

function asCurrency(value: number) {
  return value.toFixed(2);
}

export async function createInvoice(branchId: string, input: InvoiceCreateInput) {
  return db.transaction(async (tx) => {
    const subtotal = input.items.reduce((sum, item) => sum + item.quantity * item.unitAmount, 0);
    const total = subtotal;
    const balanceDue = Math.max(total - input.insuranceAmount - input.copayAmount, 0);

    const [invoice] = await tx
      .insert(invoices)
      .values({
        branchId,
        patientId: input.patientId,
        appointmentId: input.appointmentId ?? null,
        status: "open",
        invoiceNumber: `INV-${Date.now()}`,
        subtotal: asCurrency(subtotal),
        tax: "0.00",
        copayAmount: asCurrency(input.copayAmount),
        insuranceAmount: asCurrency(input.insuranceAmount),
        total: asCurrency(total),
        amountPaid: "0.00",
        balanceDue: asCurrency(balanceDue),
        dueDate: input.dueDate ?? null
      } as any)
      .returning();

    await tx.insert(invoiceItems).values(
      input.items.map((item) => ({
        invoiceId: invoice.id,
        description: item.description,
        cptCode: item.cptCode ?? null,
        icd10Code: item.icd10Code ?? null,
        quantity: item.quantity,
        unitAmount: asCurrency(item.unitAmount),
        totalAmount: asCurrency(item.quantity * item.unitAmount)
      })) as any
    );

    return invoice;
  });
}

export async function recordPayment(input: PaymentCreateInput) {
  const [payment] = await db
    .insert(payments)
    .values({
      invoiceId: input.invoiceId,
      patientId: input.patientId,
      method: input.method,
      status: "succeeded",
      amount: asCurrency(input.amount),
      currency: "USD",
      referenceNumber: input.referenceNumber ?? null,
      stripePaymentIntentId: input.stripePaymentIntentId ?? null,
      paidAt: new Date()
    } as any)
    .returning();

  return payment;
}

export async function createInsuranceClaim(branchId: string, input: InsuranceClaimCreateInput) {
  const [claim] = await db
    .insert(insuranceClaims)
    .values({
      branchId,
      invoiceId: input.invoiceId,
      patientId: input.patientId,
      insuranceId: input.insuranceId ?? null,
      claimNumber: `CLM-${Date.now()}`,
      status: "ready",
      cptCodes: input.cptCodes,
      icd10Codes: input.icd10Codes,
      billedAmount: asCurrency(input.billedAmount)
    } as any)
    .returning();

  return claim;
}

export async function getInvoiceById(invoiceId: string) {
  const [invoice] = await db.select().from(invoices).where(eq(invoices.id, invoiceId)).limit(1);
  return invoice ?? null;
}
