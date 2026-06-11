// Brevo (formerly Sendinblue) Email Helper
// API Docs: https://developers.brevo.com/reference/sendtransacemail

export interface BrevoEmailOptions {
  to: { email: string; name?: string }[];
  subject: string;
  htmlContent: string;
  textContent?: string;
  sender?: { email: string; name: string };
  replyTo?: { email: string; name?: string };
  tags?: string[];
  headers?: Record<string, string>;
}

export interface BrevoResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

const DEFAULT_SENDER = { email: "oi@guilda.app.br", name: "Guilda" };

export async function sendBrevoEmail(options: BrevoEmailOptions): Promise<BrevoResponse> {
  const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");

  if (!BREVO_API_KEY) {
    console.error("[Brevo] API key not configured");
    return { success: false, error: "BREVO_API_KEY not configured" };
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": BREVO_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: options.sender || DEFAULT_SENDER,
        to: options.to,
        replyTo: options.replyTo,
        subject: options.subject,
        htmlContent: options.htmlContent,
        textContent: options.textContent,
        tags: options.tags,
        headers: {
          "X-Mailer": "Guilda App",
          ...options.headers,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Brevo] API Error:", response.status, errorText);
      return { success: false, error: `Brevo API error: ${response.status} - ${errorText}` };
    }

    const result = await response.json();
    console.log("[Brevo] Email sent successfully:", result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[Brevo] Exception:", errorMessage);
    return { success: false, error: errorMessage };
  }
}

// Helper to convert Mailjet-style recipients to Brevo format
export function toBrevoRecipients(emails: string[]): { email: string }[] {
  return emails.map(email => ({ email }));
}
