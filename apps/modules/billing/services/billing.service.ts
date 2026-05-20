import { createInsuranceClaim, createInvoice, getInvoiceById, recordPayment } from "../repositories/billing.repository";
import {
  insuranceClaimCreateSchema,
  invoiceCreateSchema,
  paymentCreateSchema,
  type InsuranceClaimCreateInput,
  type InvoiceCreateInput,
  type PaymentCreateInput
} from "../validations/billing.validation";

export const billingService = {
  createInvoice(branchId: string, input: InvoiceCreateInput) {
    return createInvoice(branchId, invoiceCreateSchema.parse(input));
  },

  recordPayment(input: PaymentCreateInput) {
    return recordPayment(paymentCreateSchema.parse(input));
  },

  createClaim(branchId: string, input: InsuranceClaimCreateInput) {
    return createInsuranceClaim(branchId, insuranceClaimCreateSchema.parse(input));
  },

  getInvoice(invoiceId: string) {
    return getInvoiceById(invoiceId);
  }
};
