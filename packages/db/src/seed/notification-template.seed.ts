import { createScopedLogger } from "@mediclinic/logger";
import { db } from "../index";
import { notificationTemplates } from "../schema";
import { eq } from "drizzle-orm";

const logger = createScopedLogger("notification-template-seed");

const staffTemplateData = [
  {
    name: "Staff Welcome",
    code: "staff_welcome",
    channel: "email" as const,
    subject: "Welcome to {{clinic_name}}, {{staff_name}}",
    body: `
<div style="font-family:Arial,sans-serif;background:#f8fafc;padding:24px;">
  <div style="max-width:640px;margin:auto;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e2e8f0;">
    <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:28px;color:white;">
      <h1 style="margin:0;font-size:24px;">Welcome, {{staff_name}}</h1>
      <p style="margin:8px 0 0;">Your staff account is ready at {{clinic_name}}.</p>
    </div>
    <div style="padding:28px;color:#334155;">
      <p>Dear {{staff_name}},</p>
      <p>Your staff account has been created successfully. You have been assigned the role of <strong>{{staff_role}}</strong>.</p>
      <div style="background:#f1f5f9;border-radius:14px;padding:18px;margin:20px 0;">
        <p><strong>Email:</strong> {{staff_email}}</p>
        <p><strong>Temporary Password:</strong> {{temporary_password}}</p>
        <p><strong>Department:</strong> {{staff_department}}</p>
      </div>
      <p>Please login and change your password after first login.</p>
      <a href="{{portal_url}}" style="display:inline-block;background:#6366f1;color:white;padding:12px 20px;border-radius:10px;text-decoration:none;">
        Login to Portal
      </a>
      <p style="margin-top:28px;">Best regards,<br/>{{clinic_name}} Administration</p>
    </div>
  </div>
</div>`,
    isActive: true,
  },
  {
    name: "Staff Account Deactivated",
    code: "staff_deactivated",
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
      <p>Dear {{staff_name}},</p>
      <p>Your staff account has been deactivated.</p>
      <div style="background:#fff1f2;border-left:4px solid #dc2626;padding:16px;border-radius:12px;">
        You can no longer login to the clinic management system.
      </div>
      <p>If this was done by mistake, please contact administration.</p>
      <p>Best regards,<br/>{{clinic_name}} Administration</p>
    </div>
  </div>
</div>`,
    isActive: true,
  },
  {
    name: "Staff Account Activated",
    code: "staff_activated",
    channel: "email" as const,
    subject: "Account Activated - {{clinic_name}}",
    body: `
<div style="font-family:Arial,sans-serif;background:#ecfdf5;padding:24px;">
  <div style="max-width:640px;margin:auto;background:white;border-radius:18px;border:1px solid #bbf7d0;overflow:hidden;">
    <div style="background:#16a34a;padding:26px;color:white;">
      <h1 style="margin:0;font-size:24px;">Account Activated</h1>
      <p style="margin:8px 0 0;">Your staff account is active again.</p>
    </div>
    <div style="padding:28px;color:#334155;">
      <p>Dear {{staff_name}},</p>
      <p>Your staff account at {{clinic_name}} has been activated successfully.</p>
      <div style="background:#f0fdf4;border-radius:14px;padding:18px;margin:20px 0;">
        You can now login and access the system.
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
    name: "Staff Status Changed (System)",
    code: "staff_status_changed",
    channel: "system" as const,
    subject: "Staff Status Updated",
    body: "{{staff_name}}'s status has been changed to {{new_status}}.",
    isActive: true,
  },
];

const authTemplateData = [
  {
    name: "Login Success (System)",
    code: "auth_login_success",
    channel: "system" as const,
    subject: "New Login Detected",
    body: "You logged in to {{clinic_name}} from {{device_info}} on {{login_time}}.",
    isActive: true,
  },
  {
    name: "Login Success (Email)",
    code: "auth_login_success_email",
    channel: "email" as const,
    subject: "New Login to Your {{clinic_name}} Account",
    body: `
<div style="font-family:Arial,sans-serif;background:#f0fdf4;padding:24px;">
  <div style="max-width:560px;margin:auto;background:white;border-radius:18px;border:1px solid #bbf7d0;overflow:hidden;">
    <div style="background:#16a34a;padding:24px;color:white;">
      <h1 style="margin:0;font-size:20px;">New Login Detected</h1>
      <p style="margin:6px 0 0;">Your {{clinic_name}} account was accessed.</p>
    </div>
    <div style="padding:24px;color:#334155;">
      <p>Hello {{user_name}},</p>
      <p>A new login was detected on your account.</p>
      <div style="background:#f0fdf4;border-radius:12px;padding:16px;margin:16px 0;">
        <p><strong>Time:</strong> {{login_time}}</p>
        <p><strong>Device:</strong> {{device_info}}</p>
        <p><strong>IP Address:</strong> {{ip_address}}</p>
      </div>
      <p>If this was you, you can ignore this email. If not, please change your password immediately.</p>
      <a href="{{portal_url}}/settings/profile" style="display:inline-block;background:#16a34a;color:white;padding:10px 18px;border-radius:8px;text-decoration:none;">
        Review Account
      </a>
      <p style="margin-top:24px;">Best regards,<br/>{{clinic_name}} Team</p>
    </div>
  </div>
</div>`,
    isActive: true,
  },
  {
    name: "Failed Login Attempt (System)",
    code: "auth_login_failed",
    channel: "system" as const,
    subject: "Failed Login Attempt",
    body: "A failed login attempt was detected on your account. {{failure_reason}}",
    isActive: true,
  },
  {
    name: "Password Reset Request (Email)",
    code: "auth_password_reset_request",
    channel: "email" as const,
    subject: "Reset Your {{clinic_name}} Password",
    body: `
<div style="font-family:Arial,sans-serif;background:#fffbeb;padding:24px;">
  <div style="max-width:560px;margin:auto;background:white;border-radius:18px;border:1px solid #fde68a;overflow:hidden;">
    <div style="background:#f59e0b;padding:24px;color:white;">
      <h1 style="margin:0;font-size:20px;">Password Reset Request</h1>
      <p style="margin:6px 0 0;">Reset your {{clinic_name}} password.</p>
    </div>
    <div style="padding:24px;color:#334155;">
      <p>Hello {{user_name}},</p>
      <p>A password reset was requested for your account.</p>
      <div style="background:#fffbeb;border-radius:12px;padding:16px;margin:16px 0;text-align:center;">
        <p style="font-size:14px;color:#6b7280;">Click the button below to reset your password. This link expires in 30 minutes.</p>
        <a href="{{reset_link}}" style="display:inline-block;background:#f59e0b;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">
          Reset Password
        </a>
      </div>
      <p>If you did not request this, please ignore this email and contact administration.</p>
      <p style="margin-top:24px;">Best regards,<br/>{{clinic_name}} Team</p>
    </div>
  </div>
</div>`,
    isActive: true,
  },
  {
    name: "Password Reset Success (System)",
    code: "auth_password_reset_success",
    channel: "system" as const,
    subject: "Password Changed Successfully",
    body: "Your password was changed successfully. If you did not make this change, contact administration immediately.",
    isActive: true,
  },
  {
    name: "Password Reset Success (Email)",
    code: "auth_password_reset_success_email",
    channel: "email" as const,
    subject: "Your {{clinic_name}} Password Has Been Changed",
    body: `
<div style="font-family:Arial,sans-serif;background:#f0fdf4;padding:24px;">
  <div style="max-width:560px;margin:auto;background:white;border-radius:18px;border:1px solid #bbf7d0;overflow:hidden;">
    <div style="background:#16a34a;padding:24px;color:white;">
      <h1 style="margin:0;font-size:20px;">Password Changed</h1>
      <p style="margin:6px 0 0;">Your {{clinic_name}} password was updated.</p>
    </div>
    <div style="padding:24px;color:#334155;">
      <p>Hello {{user_name}},</p>
      <p>Your password has been changed successfully.</p>
      <div style="background:#f0fdf4;border-left:4px solid #16a34a;padding:12px 16px;border-radius:8px;margin:16px 0;">
        This change was made on {{reset_time}}. All active sessions have been terminated.
      </div>
      <p>If you did not make this change, please contact administration immediately.</p>
      <p style="margin-top:24px;">Best regards,<br/>{{clinic_name}} Team</p>
    </div>
  </div>
</div>`,
    isActive: true,
  },
];

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
    for (const template of [...authTemplateData, ...staffTemplateData, ...doctorTemplateData]) {
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
