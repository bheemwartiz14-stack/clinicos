import type { Metadata } from "next";
import { requirePagePermission } from "@/lib/auth";
import { payrollService } from "@modules/payroll/services/payroll.service";
import { PaymentHistoryView } from "@modules/payroll/views/payouts-list-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Payment History | MediClinic Pro",
};

export default async function PaymentHistoryPage() {
  await requirePagePermission("payroll.view");
  const payouts = await payrollService.getPaymentHistory();
  return <PaymentHistoryView payouts={payouts} />;
}
