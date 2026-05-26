import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { requirePagePermission } from "@/lib/auth";
import { billingService } from "@modules/billing/services/billing.service";
import { InvoiceDetailView } from "@modules/billing/views/invoice-detail-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Invoice Detail | MediClinic Pro",
};

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePagePermission("billing.view");
  const { id } = await params;
  const data = await billingService.getInvoice(id);
  if (!data) notFound();
  return <InvoiceDetailView data={data} />;
}
