export type NotificationChannel = "email" | "sms" | "whatsapp" | "system";

export interface EmailJobData {
  to: string;
  subject: string;
  body: string;
  html?: string;
  templateId?: string;
  userId?: string;
}

export interface NotificationJobData {
  templateId: string;
  channel: NotificationChannel;
  recipient: string;
  subject?: string;
  body?: string;
  variables: Record<string, string>;
  userId?: string;
}

export type JobDataMap = {
  email: EmailJobData;
  notification: NotificationJobData;
};
