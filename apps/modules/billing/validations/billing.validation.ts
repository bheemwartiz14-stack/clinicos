import { z } from "zod";

const money = z.coerce.number().min(0).max(999999.99);

export const invoiceItemSchema = z.object({
  description: z.string().trim().min(1).max(255),
  cptCode: z.string().trim().max(16).optional().nullable(),
  icd10Code: z.string().trim().max(16).optional().nullable(),
  quantity: z.coerce.number().int().min(1).default(1),
  unitAmount: money
});

export const invoiceCreateSchema = z.object({
  patientId: z.string().uuid(),
  appointmentId: z.string().uuid().optional().nullable(),
  insuranceAmount: money.default(0),
  copayAmount: money.default(0),
  dueDate: z.string().date().optional().nullable(),
  items: z.array(invoiceItemSchema).min(1)
});

export const paymentCreateSchema = z.object({
  invoiceId: z.string().uuid(),
  patientId: z.string().uuid(),
  method: z.enum(["cash", "card", "upi", "stripe", "insurance"]),
  amount: money,
  referenceNumber: z.string().trim().max(120).optional().nullable(),
  stripePaymentIntentId: z.string().trim().max(255).optional().nullable()
});

export const insuranceClaimCreateSchema = z.object({
  invoiceId: z.string().uuid(),
  patientId: z.string().uuid(),
  insuranceId: z.string().uuid().optional().nullable(),
  cptCodes: z.array(z.string().trim().max(16)).default([]),
  icd10Codes: z.array(z.string().trim().max(16)).default([]),
  billedAmount: money
});

export type InvoiceCreateInput = z.infer<typeof invoiceCreateSchema>;
export type PaymentCreateInput = z.infer<typeof paymentCreateSchema>;
export type InsuranceClaimCreateInput = z.infer<typeof insuranceClaimCreateSchema>;
