import { desc, eq } from "drizzle-orm";
import { db, notificationTemplates } from "@mediclinic/db";

export type NotificationTemplateRecord = {
  id: string;
  name: string;
  code: string;
  channel: "email" | "sms" | "whatsapp" | "system";
  subject: string | null;
  body: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type NotificationTemplateInput = {
  name: string;
  code: string;
  channel: "email" | "sms" | "whatsapp" | "system";
  subject?: string | null;
  body: string;
  isActive?: boolean;
};

export const notificationTemplateService = {
  async list(): Promise<NotificationTemplateRecord[]> {
    const rows = await db
      .select()
      .from(notificationTemplates)
      .orderBy(desc(notificationTemplates.createdAt));
    return rows;
  },

  async get(id: string): Promise<NotificationTemplateRecord | null> {
    const [row] = await db
      .select()
      .from(notificationTemplates)
      .where(eq(notificationTemplates.id, id))
      .limit(1);
    return row ?? null;
  },

  async getByCode(code: string): Promise<NotificationTemplateRecord | null> {
    const [row] = await db
      .select()
      .from(notificationTemplates)
      .where(eq(notificationTemplates.code, code))
      .limit(1);
    return row ?? null;
  },

  async create(input: NotificationTemplateInput): Promise<NotificationTemplateRecord> {
    const [row] = await db
      .insert(notificationTemplates)
      .values({
        name: input.name,
        code: input.code,
        channel: input.channel,
        subject: input.subject || null,
        body: input.body,
        isActive: input.isActive ?? true,
      })
      .returning();
    return row;
  },

  async update(id: string, input: Partial<NotificationTemplateInput>): Promise<NotificationTemplateRecord | null> {
    const existing = await this.get(id);
    if (!existing) return null;
    const [row] = await db
      .update(notificationTemplates)
      .set({
        name: input.name,
        code: input.code,
        channel: input.channel,
        subject: input.subject !== undefined ? input.subject : existing.subject,
        body: input.body,
        isActive: input.isActive !== undefined ? input.isActive : existing.isActive,
      })
      .where(eq(notificationTemplates.id, id))
      .returning();
    return row ?? null;
  },

  async delete(id: string): Promise<boolean> {
    const existing = await this.get(id);
    if (!existing) return false;
    await db.delete(notificationTemplates).where(eq(notificationTemplates.id, id));
    return true;
  },
};
