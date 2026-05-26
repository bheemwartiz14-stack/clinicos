import type { Metadata } from "next";
import { requirePagePermission } from "@/lib/auth";
import { payrollService } from "@modules/payroll/services/payroll.service";
import { PayoutsListView } from "@modules/payroll/views/payouts-list-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Payouts | MediClinic Pro",
};

export default async function PayoutsPage() {
  await requirePagePermission("payroll.view");
  const payouts = await payrollService.listPayouts();
  return <PayoutsListView payouts={payouts} />;
}
