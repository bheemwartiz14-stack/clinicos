import nodemailer from "nodemailer";

async function main() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.EMAIL_FROM || "noreply@mediclinicpro.com";
  const to = process.argv[2] || user;

  if (!host || !user || !pass) {
    console.error("Missing SMTP env vars. Set SMTP_HOST, SMTP_USER, SMTP_PASS.");
    process.exit(1);
  }

  console.log(`Connecting to SMTP: ${host}:${port} as ${user}`);
  console.log(`Sending test email to: ${to}`);

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  try {
    await transporter.verify();
    console.log("✓ SMTP connection verified successfully");
  } catch (err) {
    console.error("✗ SMTP verification failed:", err instanceof Error ? err.message : err);
    process.exit(1);
  }

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject: "MediClinic Pro - SMTP Test",
      text: "This is a test email to verify SMTP configuration for MediClinic Pro.",
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; padding: 24px;">
          <div style="max-width: 480px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
            <div style="background: #0f172a; padding: 16px 24px;">
              <h1 style="color: #fff; margin: 0; font-size: 18px;">MediClinic Pro</h1>
            </div>
            <div style="padding: 24px;">
              <h2 style="margin-top: 0; color: #0f172a;">SMTP Test Successful</h2>
              <p style="color: #475569; line-height: 1.6;">
                This email confirms that the SMTP configuration for <strong>MediClinic Pro</strong>
                is working correctly.
              </p>
              <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                <tr>
                  <td style="padding: 8px 12px; border: 1px solid #e5e7eb; color: #64748b; font-size: 13px;">Host</td>
                  <td style="padding: 8px 12px; border: 1px solid #e5e7eb; color: #0f172a; font-size: 13px; font-weight: 600;">${host}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 12px; border: 1px solid #e5e7eb; color: #64748b; font-size: 13px;">Port</td>
                  <td style="padding: 8px 12px; border: 1px solid #e5e7eb; color: #0f172a; font-size: 13px; font-weight: 600;">${port}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 12px; border: 1px solid #e5e7eb; color: #64748b; font-size: 13px;">User</td>
                  <td style="padding: 8px 12px; border: 1px solid #e5e7eb; color: #0f172a; font-size: 13px; font-weight: 600;">${user}</td>
                </tr>
              </table>
              <p style="color: #475569; font-size: 13px;">
                Sent at: ${new Date().toLocaleString()}
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log(`✓ Email sent successfully! Message ID: ${info.messageId}`);
  } catch (err) {
    console.error("✗ Failed to send email:", err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

main();
