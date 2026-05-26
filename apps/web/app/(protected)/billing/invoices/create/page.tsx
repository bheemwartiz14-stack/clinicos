import type { Metadata } from "next";
import { requirePagePermission } from "@/lib/auth";
import { patientService } from "@modules/patients/services/patient.service";
import { InvoiceForm } from "@modules/billing/views/invoice-form-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Create Invoice | MediClinic Pro",
};

export default async function CreateInvoicePage() {
  await requirePagePermission("billing.manage");
  const patients = await patientService.list();
  return <InvoiceForm patients={patients} />;
}
