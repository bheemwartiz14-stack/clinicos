export type NotificationMessage = {
  branchId: string;
  to: string;
  subject?: string;
  body: string;
};

export async function queueEmail(message: NotificationMessage) {
  return { provider: "email", status: "queued", message };
}

export async function queueSms(message: NotificationMessage) {
  return { provider: "twilio", status: "queued", message };
}

export async function queueWhatsApp(message: NotificationMessage) {
  return { provider: "whatsapp-cloud", status: "queued", message };
}
