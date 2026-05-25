import nodemailer from "nodemailer";
import { logger } from "@mediclinic/logger";

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT) || 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass) {
      transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
    } else {
      logger.warn("SMTP not configured, using mock transport");
      transporter = nodemailer.createTransport({ jsonTransport: true });
    }
  }
  return transporter;
}

const defaultFrom = process.env.EMAIL_FROM || "noreply@mediclinicpro.com";

export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const transport = getTransporter();
    const info = await transport.sendMail({
      from: defaultFrom,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    logger.info("Email sent", { to: options.to, subject: options.subject, messageId: info.messageId });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logger.error("Email send failed", { to: options.to, subject: options.subject, error: message });
    return { success: false, error: message };
  }
}
