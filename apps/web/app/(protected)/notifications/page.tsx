import type { Metadata } from "next";
import { requirePagePermission } from "@/lib/auth";
import { NotificationsPage } from "@modules/notifications/views/notifications/NotificationsPage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Notifications",
};

export default async function NotificationsPageRoute() {
  await requirePagePermission("settings.notifications");
  return <NotificationsPage />;
}
