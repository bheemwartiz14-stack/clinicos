import type { Metadata } from "next";
import { requirePagePermission } from "@/lib/auth";
import { documentService } from "@modules/documents/services/document.service";
import { AllDocumentsView } from "@modules/documents/views/documents-list-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Patient Documents | MediClinic Pro",
};

export default async function PatientDocumentsPage() {
  await requirePagePermission("documents.view");
  const [documents, categories] = await Promise.all([
    documentService.list(),
    documentService.listCategories(),
  ]);
  return <AllDocumentsView documents={documents} categories={categories} />;
}
