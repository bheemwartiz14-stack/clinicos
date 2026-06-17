import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { notificationService } from "@modules/notifications/notification.service";
import { notificationsQuerySchema, createNotificationSchema } from "@modules/notifications/notification.validation";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") ?? "20", 10)));
  const filterRaw = searchParams.get("filter") ?? "all";

  const parsed = notificationsQuerySchema.safeParse({
    page: String(page),
    pageSize: String(pageSize),
    filter: filterRaw,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query parameters", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { page: p, pageSize: ps, filter } = parsed.data;
  const result = await notificationService.getNotifications(session.userId, p, ps, filter);

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createNotificationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request body", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const notification = await notificationService.create(parsed.data);
  return NextResponse.json(notification, { status: 201 });
}
