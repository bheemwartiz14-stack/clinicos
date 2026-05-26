import type { Metadata } from "next";
import { requirePagePermission } from "@/lib/auth";
import { billingService } from "@modules/billing/services/billing.service";
import { PendingListView } from "@modules/billing/views/pending-list-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pending Payments | MediClinic Pro",
};

export default async function PendingPage() {
  await requirePagePermission("billing.view");
  const invoices = await billingService.listPending();
  return <PendingListView invoices={invoices} />;
}
