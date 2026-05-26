import { eq, desc } from "drizzle-orm";
import { db, loginHistory } from "@mediclinic/db";

export type LoginHistoryRecord = {
  id: string;
  userId: string | null;
  status: string;
  ipAddress: string | null;
  userAgent: string | null;
  deviceType: string | null;
  browser: string | null;
  os: string | null;
  location: string | null;
  failureReason: string | null;
  createdAt: Date;
};

export const loginHistoryService = {
  async log(params: {
    userId?: string;
    status: "success" | "failed" | "blocked";
    ipAddress?: string;
    userAgent?: string;
    failureReason?: string;
  }) {
    const ua = params.userAgent ?? "";
    const deviceType = /mobile|android|iphone|ipad/i.test(ua) ? "mobile" : /tablet|ipad/i.test(ua) ? "tablet" : "desktop";
    const browserMatch = ua.match(/(Chrome|Firefox|Safari|Edge|Opera)\/([\d.]+)/);
    const browser = browserMatch ? `${browserMatch[1]} ${browserMatch[2]}` : null;
    const osMatch = ua.match(/(Windows NT|Mac OS X|Linux|Android|iOS)\s?([\d_.]+)?/);
    const os = osMatch ? osMatch[1].replace("NT", "Windows").replace("_", ".") : null;

    await db.insert(loginHistory).values({
      userId: params.userId ?? null,
      status: params.status,
      ipAddress: params.ipAddress ?? null,
      userAgent: params.userAgent ?? null,
      deviceType,
      browser,
      os,
      failureReason: params.failureReason ?? null,
    });
  },

  async list(userId: string, limit = 50): Promise<LoginHistoryRecord[]> {
    const rows = await db
      .select()
      .from(loginHistory)
      .where(eq(loginHistory.userId, userId))
      .orderBy(desc(loginHistory.createdAt))
      .limit(limit);

    return rows;
  },

  async listAll(limit = 100): Promise<LoginHistoryRecord[]> {
    const rows = await db
      .select()
      .from(loginHistory)
      .orderBy(desc(loginHistory.createdAt))
      .limit(limit);

    return rows;
  },
};
