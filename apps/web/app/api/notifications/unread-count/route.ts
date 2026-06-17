import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { notificationService } from "@modules/notifications/notification.service";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await notificationService.getUnreadCount(session.userId);
  return NextResponse.json(result);
}
