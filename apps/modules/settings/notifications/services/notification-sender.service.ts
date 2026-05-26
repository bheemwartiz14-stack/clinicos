import { db, notificationLogs } from "@mediclinic/db";
import { sendEmail } from "./email.service";
import { notificationTemplateService } from "./notification-template.service";
import { systemNotificationService } from "./system-notification.service";

export type SendNotificationInput = {
  templateCode: string;
  recipient: string;
  variables?: Record<string, string>;
  userId?: string;
};

function renderTemplate(template: string, variables: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] ?? `{{${key}}}`);
}

async function logNotification(params: {
  templateId?: string;
  channel: "email" | "sms" | "whatsapp" | "system";
  recipient: string;
  subject?: string;
  body?: string;
  status: "queued" | "sent" | "failed";
  error?: string;
  userId?: string;
}) {
  await db.insert(notificationLogs).values({
    templateId: params.templateId || null,
    channel: params.channel,
    recipient: params.recipient,
    subject: params.subject || null,
    body: params.body || null,
    status: params.status,
    error: params.error || null,
    sentAt: params.status === "sent" ? new Date() : null,
    userId: params.userId || null,
  });
}

export async function sendNotification(input: SendNotificationInput) {
  const template = await notificationTemplateService.getByCode(input.templateCode);
  if (!template || !template.isActive) {
    throw new Error(`Template "${input.templateCode}" not found or inactive`);
  }

  const variables = input.variables || {};
  const renderedBody = renderTemplate(template.body, variables);
  const renderedSubject = template.subject ? renderTemplate(template.subject, variables) : undefined;

  if (template.channel === "email") {
    const result = await sendEmail({
      to: input.recipient,
      subject: renderedSubject ?? "Notification",
      text: renderedBody,
      html: renderedBody.replace(/\n/g, "<br>"),
    });

    await logNotification({
      templateId: template.id,
      channel: "email",
      recipient: input.recipient,
      subject: renderedSubject,
      body: renderedBody,
      status: result.success ? "sent" : "failed",
      error: result.error,
      userId: input.userId,
    });

    return { queued: false, success: result.success, error: result.error };
  }

  if (template.channel === "sms" || template.channel === "whatsapp") {
    await logNotification({
      templateId: template.id,
      channel: template.channel,
      recipient: input.recipient,
      body: renderedBody,
      status: "queued",
      userId: input.userId,
    });

    return { queued: true, channel: template.channel };
  }
  if (template.channel === "system") {
    await logNotification({
      templateId: template.id,
      channel: "system",
      recipient: input.recipient,
      subject: renderedSubject,
      body: renderedBody,
      status: "sent",
      userId: input.userId,
    });

    if (input.userId) {
      await systemNotificationService.create({
        userId: input.userId,
        type: "info",
        title: renderedSubject ?? "System Notification",
        message: renderedBody,
      });
    }

    return { queued: false, success: true };
  }

  return { queued: false, success: false, error: `Unsupported channel: ${template.channel}` };
}

export async function sendSystemNotification(params: {
  userId: string;
  subject: string;
  body?: string;
  type?: "info" | "warning" | "error" | "success";
  link?: string;
}) {
  await db.insert(notificationLogs).values({
    channel: "system",
    recipient: "in-app",
    subject: params.subject,
    body: params.body || null,
    status: "sent",
    userId: params.userId,
  });

  await systemNotificationService.create({
    userId: params.userId,
    type: params.type ?? "info",
    title: params.subject,
    message: params.body,
    link: params.link,
  });
}
