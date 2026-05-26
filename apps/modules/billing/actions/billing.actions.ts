"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Route } from "next";
import { z } from "zod";
import { requirePagePermission } from "@/lib/auth";
import { billingService } from "../services/billing.service";

const createInvoiceSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  appointmentId: z.string().optional().or(z.literal("")),
  gstPercent: z.coerce.number().min(0).max(100).default(0),
  discountPercent: z.coerce.number().min(0).max(100).default(0),
});

const itemSchema = z.object({
  itemName: z.string().min(1, "Item name is required"),
  description: z.string().optional().or(z.literal("")),
  quantity: z.coerce.number().int().min(1),
  unitPrice: z.string().min(1, "Unit price is required"),
});

export async function createInvoiceAction(formData: FormData) {
  await requirePagePermission("billing.manage");
  const raw = Object.fromEntries(formData);
  const items: Array<{ itemName: string; description?: string; quantity: number; unitPrice: string }> = [];
  const itemNames = formData.getAll("itemName");
  const descriptions = formData.getAll("description");
  const quantities = formData.getAll("quantity");
  const unitPrices = formData.getAll("unitPrice");

  for (let i = 0; i < itemNames.length; i++) {
    const parsed = itemSchema.safeParse({
      itemName: itemNames[i],
      description: descriptions[i] ?? "",
      quantity: quantities[i] ?? "1",
      unitPrice: unitPrices[i] ?? "0",
    });
    if (parsed.success) items.push(parsed.data);
  }

  const parsed = createInvoiceSchema.safeParse(raw);
  if (!parsed.success || items.length === 0) redirect("/billing/invoices/create?error=invalid" as Route);

  await billingService.createInvoice({
    ...parsed.data,
    appointmentId: parsed.data.appointmentId || null,
    items,
  });

  revalidatePath("/billing/invoices");
  redirect("/billing/invoices" as Route);
}

const paymentSchema = z.object({
  invoiceId: z.string().min(1),
  amount: z.string().min(1, "Amount is required"),
  method: z.enum(["cash", "upi", "card", "bank_transfer"]),
  transactionId: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export async function recordPaymentAction(formData: FormData) {
  await requirePagePermission("billing.manage");
  const parsed = paymentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;

  await billingService.recordPayment({
    ...parsed.data,
    transactionId: parsed.data.transactionId || null,
    notes: parsed.data.notes || null,
  });

  revalidatePath("/billing/invoices");
  revalidatePath("/billing/payments");
}

export async function deleteInvoiceAction(formData: FormData) {
  await requirePagePermission("billing.manage");
  const id = String(formData.get("id") ?? "");
  if (id) await billingService.deleteInvoice(id);
  revalidatePath("/billing/invoices");
}
