import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { requirePagePermission } from "@/lib/auth";
import { patientService } from "@modules/patients/services/patient.service";
import { documentService } from "@modules/documents/services/document.service";
import { PatientDocumentsView } from "@modules/documents/views/documents-list-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Patient Documents | MediClinic Pro",
};

export default async function PatientDocumentsPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePagePermission("documents.view");
  const { id } = await params;
  const patient = await patientService.get(id);
  if (!patient) notFound();
  const [documents, categories] = await Promise.all([
    documentService.getPatientDocuments(id),
    documentService.listCategories(),
  ]);
  return <PatientDocumentsView documents={documents} categories={categories} patientId={id} patientName={patient.fullName} />;
}
