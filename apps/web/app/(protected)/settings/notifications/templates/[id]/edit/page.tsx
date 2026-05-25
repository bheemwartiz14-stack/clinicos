import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { requirePagePermission } from "@/lib/auth";
import { notificationTemplateService } from "@modules/settings/notifications/services/notification-template.service";
import { TemplateForm } from "@modules/settings/notifications/views/templates-list-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Edit Template | MediClinic Pro",
};

export default async function EditTemplatePage({ params }: { params: Promise<{ id: string }> }) {
  await requirePagePermission("settings.notifications");
  const { id } = await params;
  const template = await notificationTemplateService.get(id);
  if (!template) notFound();
  return <TemplateForm template={template} />;
}
