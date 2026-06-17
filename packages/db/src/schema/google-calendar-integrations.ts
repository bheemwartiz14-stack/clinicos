import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";
import { users } from "./auth";
export const googleCalendarConnections = pgTable("google_calendar_connections", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull().unique(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  expiryDate: timestamp("expiry_date", { withTimezone: true }),
  scope: text("scope"),
  calendarId: text("calendar_id"),
  isConnected: boolean("is_connected").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
