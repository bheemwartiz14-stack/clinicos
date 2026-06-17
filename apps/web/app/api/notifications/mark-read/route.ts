import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { notificationService } from "@modules/notifications/notification.service";
import { markAsReadSchema } from "@modules/notifications/notification.validation";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = markAsReadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request body", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  await notificationService.markAsRead(parsed.data.ids, session.userId);
  return NextResponse.json({ success: true });
}
