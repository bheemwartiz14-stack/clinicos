import { and, desc, eq, ilike, or } from "drizzle-orm";
import { db, patientDocuments, documentCategories, patients, users } from "@mediclinic/db";

export type DocumentRecord = {
  id: string;
  patientId: string;
  patientName: string;
  appointmentId: string | null;
  categoryId: string | null;
  categoryName: string | null;
  title: string;
  fileUrl: string;
  fileType: string | null;
  fileSize: number | null;
  uploadedByName: string | null;
  createdAt: Date;
};

export type DocumentCategoryRecord = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
};

type DocumentJoinRow = {
  doc: typeof patientDocuments.$inferSelect;
  patient: typeof patients.$inferSelect;
  category: typeof documentCategories.$inferSelect | null;
  uploader: typeof users.$inferSelect | null;
};

function formatRow({ doc, patient, category, uploader }: DocumentJoinRow): DocumentRecord {
  return {
    id: doc.id,
    patientId: doc.patientId,
    patientName: patient.fullName,
    appointmentId: doc.appointmentId,
    categoryId: doc.categoryId,
    categoryName: category?.name ?? null,
    title: doc.title,
    fileUrl: doc.fileUrl,
    fileType: doc.fileType,
    fileSize: doc.fileSize,
    uploadedByName: uploader ? [uploader.firstName, uploader.lastName].filter(Boolean).join(" ") : null,
    createdAt: doc.createdAt,
  };
}

function buildBaseQuery() {
  return db
    .select({
      doc: patientDocuments,
      patient: patients,
      category: documentCategories,
      uploader: users,
    })
    .from(patientDocuments)
    .innerJoin(patients, eq(patientDocuments.patientId, patients.id))
    .leftJoin(documentCategories, eq(patientDocuments.categoryId, documentCategories.id))
    .leftJoin(users, eq(patientDocuments.uploadedById, users.id));
}

export const documentService = {
  async listCategories(): Promise<DocumentCategoryRecord[]> {
    return db.select().from(documentCategories).orderBy(documentCategories.name);
  },

  async list(search?: { q?: string; patientId?: string }): Promise<DocumentRecord[]> {
    const query = buildBaseQuery();
    const filters: ReturnType<typeof eq>[] = [];
    if (search?.patientId) filters.push(eq(patientDocuments.patientId, search.patientId));

    if (search?.q) {
      const like = `%${search.q}%`;
      const textFilter = or(ilike(patientDocuments.title, like), ilike(patients.fullName, like));
      const whereClause = filters.length > 0 ? and(...filters, textFilter) : textFilter;
      const rows = await query.where(whereClause).orderBy(desc(patientDocuments.createdAt));
      return rows.map(formatRow);
    }

    if (filters.length > 0) {
      const rows = await query.where(and(...filters)).orderBy(desc(patientDocuments.createdAt));
      return rows.map(formatRow);
    }

    const rows = await query.orderBy(desc(patientDocuments.createdAt));
    return rows.map(formatRow);
  },

  async getPatientDocuments(patientId: string): Promise<DocumentRecord[]> {
    return this.list({ patientId });
  },

  async create(input: {
    patientId: string;
    appointmentId?: string | null;
    categoryId?: string | null;
    title: string;
    fileUrl: string;
    fileType?: string | null;
    fileSize?: number | null;
    uploadedById?: string | null;
  }) {
    const [doc] = await db
      .insert(patientDocuments)
      .values({
        patientId: input.patientId,
        appointmentId: input.appointmentId ?? null,
        categoryId: input.categoryId ?? null,
        title: input.title,
        fileUrl: input.fileUrl,
        fileType: input.fileType ?? null,
        fileSize: input.fileSize ?? null,
        uploadedById: input.uploadedById ?? null,
      })
      .returning();
    return doc;
  },

  async delete(id: string) {
    await db.delete(patientDocuments).where(eq(patientDocuments.id, id));
  },
};
