import type { Metadata } from "next";
import { requirePagePermission } from "@/lib/auth";
import { notificationTemplateService } from "@modules/settings/notifications/services/notification-template.service";
import { TemplatesListView } from "@modules/settings/notifications/views/templates-list-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Notification Templates | MediClinic Pro",
};

export default async function TemplatesPage() {
  await requirePagePermission("settings.notifications");
  const templates = await notificationTemplateService.list();
  return <TemplatesListView templates={templates} />;
}
