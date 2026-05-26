import type { Metadata } from "next";
import { requirePagePermission } from "@/lib/auth";
import { NotificationsClient } from "./notifications-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Notifications",
};

export default async function NotificationsPage() {
  await requirePagePermission("settings.notifications");
  return <NotificationsClient />;
}
