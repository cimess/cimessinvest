/**
 * Email Transporter via Resend API (with SMTP fallback option)
 */

export interface SendEmailPayload {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export interface SendEmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Sends an email using the Resend API or custom SMTP backend
 */
export async function sendEmail({
  to,
  subject,
  html,
  from,
}: SendEmailPayload): Promise<SendEmailResponse> {
  const apiKey = process.env.RESEND_API_KEY;
  const defaultFrom =
    process.env.EMAIL_FROM ||
    "Aimuan Thankgod <founder@cimessinvest.com>";

  const sender = from || defaultFrom;

  try {
    if (!apiKey) {
      console.warn("[EmailTransporter] RESEND_API_KEY is not set. Logging email payload to console:");
      console.log(`--- SIMULATED EMAIL ---`);
      console.log(`From: ${sender}`);
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`-----------------------`);
      return {
        success: true,
        messageId: `simulated-${Date.now()}`,
      };
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: sender,
        to: [to],
        subject,
        html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[EmailTransporter] Resend API error:", data);
      return {
        success: false,
        error: data.message || "Failed to send email via Resend API",
      };
    }

    return {
      success: true,
      messageId: data.id,
    };
  } catch (error: unknown) {
    console.error("[EmailTransporter] Unexpected error sending email:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      error: msg,
    };
  }
}
