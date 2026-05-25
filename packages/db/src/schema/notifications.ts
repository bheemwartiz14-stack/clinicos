import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { users } from "./auth";

export const notificationChannelEnum = pgEnum("notification_channel", [
  "email",
  "sms",
  "whatsapp",
  "system",
]);

export const notificationStatusEnum = pgEnum("notification_status", [
  "queued",
  "sent",
  "failed",
  "cancelled",
]);

export const notificationTemplates = pgTable("notification_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 150 }).notNull(),
  code: varchar("code", { length: 100 }).notNull().unique(),
  channel: notificationChannelEnum("channel").notNull(),
  subject: varchar("subject", { length: 255 }),
  body: text("body").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const notificationLogs = pgTable("notification_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  templateId: uuid("template_id").references(() => notificationTemplates.id, { onDelete: "set null" }),
  channel: notificationChannelEnum("channel").notNull(),
  recipient: varchar("recipient", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 255 }),
  body: text("body"),
  status: notificationStatusEnum("status").default("queued").notNull(),
  error: text("error"),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
