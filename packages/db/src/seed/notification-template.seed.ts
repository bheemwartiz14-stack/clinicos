import { createScopedLogger } from "@mediclinic/logger";
import { db } from "../index";
import { notificationTemplates } from "../schema";
import { eq } from "drizzle-orm";

const logger = createScopedLogger("notification-template-seed");

const doctorTemplateData = [
  {
    name: "Doctor Welcome",
    code: "doctor_welcome",
    channel: "email" as const,
    subject: "👋 Welcome to {{clinic_name}}, Dr. {{doctor_name}}",
    body: `
<div style="font-family:Arial,sans-serif;background:#f8fafc;padding:24px;">
  <div style="max-width:640px;margin:auto;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e2e8f0;">
    <div style="background:linear-gradient(135deg,#0f766e,#14b8a6);padding:28px;color:white;">
      <h1 style="margin:0;font-size:24px;">Welcome, Dr. {{doctor_name}}</h1>
      <p style="margin:8px 0 0;">Your doctor account is ready at {{clinic_name}}.</p>
    </div>

    <div style="padding:28px;color:#334155;">
      <p>Dear Dr. {{doctor_name}},</p>
      <p>Your account has been created successfully.</p>

      <div style="background:#f1f5f9;border-radius:14px;padding:18px;margin:20px 0;">
        <p><strong>Email:</strong> {{doctor_email}}</p>
        <p><strong>Temporary Password:</strong> {{temporary_password}}</p>
      </div>

      <p>Please login and change your password after first login.</p>

      <a href="{{portal_url}}" style="display:inline-block;background:#0f766e;color:white;padding:12px 20px;border-radius:10px;text-decoration:none;">
        Login to Portal
      </a>

      <p style="margin-top:28px;">Best regards,<br/>{{clinic_name}} Administration</p>
    </div>
  </div>
</div>`,
    isActive: true,
  },
  {
    name: "Doctor Account Deactivated",
    code: "doctor_deactivated",
    channel: "email" as const,
    subject: "Account Deactivated - {{clinic_name}}",
    body: `
<div style="font-family:Arial,sans-serif;background:#fef2f2;padding:24px;">
  <div style="max-width:640px;margin:auto;background:white;border-radius:18px;border:1px solid #fecaca;overflow:hidden;">
    <div style="background:#dc2626;padding:26px;color:white;">
      <h1 style="margin:0;font-size:24px;">Account Deactivated</h1>
      <p style="margin:8px 0 0;">Your access to {{clinic_name}} has been disabled.</p>
    </div>

    <div style="padding:28px;color:#334155;">
      <p>Dear Dr. {{doctor_name}},</p>
      <p>Your doctor account has been deactivated.</p>

      <div style="background:#fff1f2;border-left:4px solid #dc2626;padding:16px;border-radius:12px;">
        You can no longer login, view appointments, or access patient records.
      </div>

      <p>If this was done by mistake, please contact administration.</p>

      <p>Best regards,<br/>{{clinic_name}} Administration</p>
    </div>
  </div>
</div>`,
    isActive: true,
  },
  {
    name: "Doctor Account Activate",
    code: "doctor_activated",
    channel: "email" as const,
    subject: "Account Activated - {{clinic_name}}",
    body: `
<div style="font-family:Arial,sans-serif;background:#ecfdf5;padding:24px;">
  <div style="max-width:640px;margin:auto;background:white;border-radius:18px;border:1px solid #bbf7d0;overflow:hidden;">
    <div style="background:#16a34a;padding:26px;color:white;">
      <h1 style="margin:0;font-size:24px;">Account Activated</h1>
      <p style="margin:8px 0 0;">Your doctor account is active again.</p>
    </div>

    <div style="padding:28px;color:#334155;">
      <p>Dear Dr. {{doctor_name}},</p>
      <p>Your account at {{clinic_name}} has been activated successfully.</p>

      <div style="background:#f0fdf4;border-radius:14px;padding:18px;margin:20px 0;">
        You can now login, manage schedules, view appointments, and access assigned patient records.
      </div>

      <a href="{{portal_url}}" style="display:inline-block;background:#16a34a;color:white;padding:12px 20px;border-radius:10px;text-decoration:none;">
        Open Dashboard
      </a>

      <p style="margin-top:28px;">Best regards,<br/>{{clinic_name}} Administration</p>
    </div>
  </div>
</div>`,
    isActive: true,
  },
  {
    name: "Doctor Leave Added",
    code: "doctor_leave_added",
    channel: "email" as const,
    subject: "Leave Added - {{clinic_name}}",
    body: `
<div style="font-family:Arial,sans-serif;background:#fffbeb;padding:24px;">
  <div style="max-width:640px;margin:auto;background:white;border-radius:18px;border:1px solid #fde68a;overflow:hidden;">
    <div style="background:#f59e0b;padding:26px;color:white;">
      <h1 style="margin:0;font-size:24px;">Leave Added</h1>
      <p style="margin:8px 0 0;">Your availability has been updated.</p>
    </div>

    <div style="padding:28px;color:#334155;">
      <p>Dear Dr. {{doctor_name}},</p>
      <p>A leave has been recorded in your schedule.</p>

      <div style="background:#fffbeb;border-radius:14px;padding:18px;margin:20px 0;">
        <p><strong>Date:</strong> {{leave_date}}</p>
        <p><strong>Duration:</strong> {{leave_duration}}</p>
        <p><strong>Reason:</strong> {{leave_reason}}</p>
      </div>

      <p>Your appointment availability has been updated accordingly.</p>

      <p>Best regards,<br/>{{clinic_name}} Administration</p>
    </div>
  </div>
</div>`,
    isActive: true,
  },
];

export async function seedNotificationTemplates() {
  try {
    logger.info("Seeding notification templates");
    for (const template of doctorTemplateData) {
      const existing = await db.query.notificationTemplates.findFirst({
        where: eq(notificationTemplates.code, template.code),
      });

      if (existing) {
        logger.info("Template already exists", { templateCode: template.code });
        continue;
      }

      await db.insert(notificationTemplates).values(template);
      logger.info("Template created", { templateCode: template.code });
    }

    logger.info("Notification template seeding completed");
  } catch (error) {
    logger.error("Error seeding notification templates", { error });
    throw error;
  }
}
