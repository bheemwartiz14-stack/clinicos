"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePagePermission } from "@/lib/auth";
import { notificationTemplateService } from "../services/notification-template.service";
import { notificationLogService } from "../services/notification-log.service";

const templateSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  code: z.string().trim().min(1, "Code is required"),
  channel: z.enum(["email", "sms", "whatsapp", "system"]),
  subject: z.string().trim().optional().or(z.literal("")),
  body: z.string().trim().min(1, "Body is required"),
  isActive: z.coerce.boolean().default(true),
});

export type TemplateActionState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
};

export async function createTemplateAction(_prev: TemplateActionState, formData: FormData): Promise<TemplateActionState> {
  try {
    await requirePagePermission("settings.notifications");
    const parsed = templateSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".");
        fieldErrors[key] = issue.message;
      }
      return { ok: false, message: "Invalid input", errors: fieldErrors };
    }
    await notificationTemplateService.create(parsed.data);
    revalidatePath("/settings/notifications/templates");
    return { ok: true, message: "Template created successfully" };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create template";
    return { ok: false, message };
  }
}

export async function updateTemplateAction(id: string, _prev: TemplateActionState, formData: FormData): Promise<TemplateActionState> {
  try {
    await requirePagePermission("settings.notifications");
    const parsed = templateSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".");
        fieldErrors[key] = issue.message;
      }
      return { ok: false, message: "Invalid input", errors: fieldErrors };
    }
    await notificationTemplateService.update(id, parsed.data);
    revalidatePath("/settings/notifications/templates");
    return { ok: true, message: "Template updated successfully" };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update template";
    return { ok: false, message };
  }
}

export async function listNotificationsAction() {
  await requirePagePermission("notifications.view");
  const { data } = await notificationLogService.list({ pageSize: 20 });
  return data;
}

export async function deleteTemplateAction(formData: FormData): Promise<void> {
  try {
    await requirePagePermission("settings.notifications");
    const id = String(formData.get("id") ?? "");
    if (!id) return;
    await notificationTemplateService.delete(id);
    revalidatePath("/settings/notifications/templates");
  } catch (err) {
    throw err instanceof Error ? err : new Error("Failed to delete template");
  }
}
