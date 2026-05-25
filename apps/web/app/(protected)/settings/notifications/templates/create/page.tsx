import type { Metadata } from "next";
import { requirePagePermission } from "@/lib/auth";
import { TemplateForm } from "@modules/settings/notifications/views/templates-list-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Add Template | MediClinic Pro",
};

export default async function CreateTemplatePage() {
  await requirePagePermission("settings.notifications");
  return <TemplateForm />;
}
