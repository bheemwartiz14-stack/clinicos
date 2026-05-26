"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Route } from "next";
import { z } from "zod";
import { requirePagePermission, getSession } from "@/lib/auth";
import { documentService } from "../services/document.service";

const createDocumentSchema = z.object({
  patientId: z.string().min(1),
  categoryId: z.string().optional().or(z.literal("")),
  title: z.string().min(1, "Title is required"),
  fileUrl: z.string().min(1, "File URL is required"),
  fileType: z.string().optional().or(z.literal("")),
  fileSize: z.coerce.number().int().optional(),
});

export async function uploadDocumentAction(formData: FormData) {
  await requirePagePermission("documents.create");
  const session = await getSession().catch(() => null);
  const parsed = createDocumentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;

  await documentService.create({
    ...parsed.data,
    categoryId: parsed.data.categoryId || null,
    fileType: parsed.data.fileType || null,
    fileSize: parsed.data.fileSize || null,
    uploadedById: session?.userId ?? null,
  });

  revalidatePath(`/patients/${parsed.data.patientId}/documents`);
  revalidatePath("/patient-documents");
}

export async function deleteDocumentAction(formData: FormData) {
  await requirePagePermission("documents.delete");
  const id = String(formData.get("id") ?? "");
  if (id) await documentService.delete(id);
  revalidatePath("/patient-documents");
}
