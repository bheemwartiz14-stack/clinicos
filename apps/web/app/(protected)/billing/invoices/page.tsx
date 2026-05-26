import type { Metadata } from "next";
import { requirePagePermission } from "@/lib/auth";
import { billingService } from "@modules/billing/services/billing.service";
import { InvoicesListView } from "@modules/billing/views/invoices-list-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Invoices | MediClinic Pro",
};

export default async function InvoicesPage({ searchParams }: { searchParams?: Promise<{ q?: string; status?: string }> }) {
  await requirePagePermission("billing.view");
  const params = searchParams ? await searchParams : {};
  const invoices = await billingService.listInvoices({ q: params.q, status: params.status });
  return <InvoicesListView invoices={invoices} />;
}
