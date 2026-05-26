import type { Metadata } from "next";
import { requirePagePermission } from "@/lib/auth";
import { billingService } from "@modules/billing/services/billing.service";
import { PaymentsListView } from "@modules/billing/views/payments-list-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Payments | MediClinic Pro",
};

export default async function PaymentsPage({ searchParams }: { searchParams?: Promise<{ q?: string }> }) {
  await requirePagePermission("billing.view");
  const params = searchParams ? await searchParams : {};
  const payments = await billingService.listPayments({ q: params.q });
  return <PaymentsListView payments={payments} />;
}
