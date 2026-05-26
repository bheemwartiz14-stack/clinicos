"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Route } from "next";
import { z } from "zod";
import { requirePagePermission } from "@/lib/auth";
import { payrollService } from "../services/payroll.service";

const payoutSettingSchema = z.object({
  doctorId: z.string().min(1),
  salaryType: z.enum(["fixed", "commission", "fixed_plus_commission"]),
  fixedSalary: z.string().default("0"),
  commissionPercentage: z.string().default("0"),
});

export async function upsertPayoutSettingAction(formData: FormData) {
  await requirePagePermission("payroll.manage");
  const parsed = payoutSettingSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  await payrollService.upsertPayoutSetting(parsed.data);
  revalidatePath("/payroll/doctors");
}

export async function generatePayoutBatchAction(formData: FormData) {
  await requirePagePermission("payroll.manage");
  const month = parseInt(String(formData.get("month") ?? String(new Date().getMonth() + 1)));
  const year = parseInt(String(formData.get("year") ?? String(new Date().getFullYear())));
  await payrollService.generatePayoutBatch(month, year);
  revalidatePath("/payroll/payouts");
  redirect("/payroll/payouts" as Route);
}

export async function markPayoutPaidAction(formData: FormData) {
  await requirePagePermission("payroll.pay");
  const id = String(formData.get("id") ?? "");
  if (id) await payrollService.markAsPaid(id);
  revalidatePath("/payroll/payouts");
  revalidatePath("/payroll/payment-history");
}
