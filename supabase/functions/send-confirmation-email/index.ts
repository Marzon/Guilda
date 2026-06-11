import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { sendBrevoEmail } from "../_shared/brevo.ts";

const corsHeaders = { 
  "Access-Control-Allow-Origin": "*", 
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" 
};

// Generate 6-character alphanumeric token (no ambiguous chars: I, O, 1, 0)
function generateToken(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let token = "";
  for (let i = 0; i < 6; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

function getEmailContent(locale: string) {
  const content = {
    pt: { 
      subject: "Seu código de verificação - Guilda", 
      title: "Código de Verificação", 
      body: "Use o código abaixo para verificar seu email e ativar sua conta na Guilda.", 
      footer: "Se você não criou uma conta na Guilda, pode ignorar este email com segurança.", 
      expires: "Este código expira em 15 minutos." 
    },
    en: { 
      subject: "Your verification code - Guilda", 
      title: "Verification Code", 
      body: "Use the code below to verify your email and activate your Guilda account.", 
      footer: "If you didn't create a Guilda account, you can safely ignore this email.", 
      expires: "This code expires in 15 minutes." 
    },
    es: { 
      subject: "Tu código de verificación - Guilda", 
      title: "Código de Verificación", 
      body: "Usa el código de abajo para verificar tu correo y activar tu cuenta en Guilda.", 
      footer: "Si no creaste una cuenta en Guilda, puedes ignorar este correo con seguridad.", 
      expires: "Este código expira en 15 minutos." 
    },
  };
  return content[locale as keyof typeof content] || content.pt;
}

function generateEmailHtml(content: { title: string; body: string; footer: string; expires: string }, token: string) {
  return `
<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">
  <table role="presentation" width="100%" style="background-color: #f3f4f6;"><tr><td style="padding: 40px 20px;">
    <table role="presentation" width="100%" style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e5e7eb;">
      <tr><td style="background: linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%); padding: 32px 40px; text-align: center;"><h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0;">Guilda</h1></td></tr>
      <tr><td style="padding: 40px; text-align: center;">
        <div style="display: inline-block; background-color: #f3e8ff; padding: 16px; border-radius: 50%; margin-bottom: 24px;"><span style="font-size: 40px;">🔐</span></div>
        <h2 style="color: #1f2937; font-size: 22px; font-weight: 700; margin: 0 0 16px;">${content.title}</h2>
        <p style="color: #4b5563; font-size: 16px; line-height: 24px; margin: 0 0 24px;">${content.body}</p>
        <div style="background: linear-gradient(135deg, #f3e8ff 0%, #e0e7ff 100%); padding: 24px 32px; border-radius: 16px; margin: 0 0 24px;">
          <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #7c3aed; font-family: monospace;">${token}</span>
        </div>
        <p style="color: #9ca3af; font-size: 14px; margin: 0;">${content.expires}</p>
      </td></tr>
      <tr><td style="background-color: #f9fafb; padding: 24px 40px; border-top: 1px solid #e5e7eb;"><p style="color: #9ca3af; font-size: 13px; line-height: 20px; margin: 0; text-align: center;">${content.footer}</p></td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  
  try {
    const { email, locale = "pt" } = await req.json();
    
    if (!email) {
      return new Response(
        JSON.stringify({ success: false, error: "missing_email" }), 
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "", 
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "", 
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Invalidate any previous unused tokens for this email
    await supabaseAdmin
      .from("email_verification_tokens")
      .update({ used_at: new Date().toISOString() })
      .eq("email", email.toLowerCase())
      .is("used_at", null);

    // Generate new token
    const token = generateToken();

    // Save token to database
    const { error: insertError } = await supabaseAdmin
      .from("email_verification_tokens")
      .insert({
        email: email.toLowerCase(),
        token: token,
        expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
      });

    if (insertError) {
      console.error("Error saving token:", insertError);
      throw new Error("Failed to generate verification token");
    }

    // Send email with token via Brevo
    const content = getEmailContent(locale);
    console.log(`[send-confirmation-email] Sending to ${email} with token ${token}`);
    
    const result = await sendBrevoEmail({
      to: [{ email }],
      subject: content.subject,
      htmlContent: generateEmailHtml(content, token),
      tags: ["verification", "confirmation"],
    });
    
    if (!result.success) {
      console.error("[send-confirmation-email] Brevo error:", result.error);
      throw new Error("Failed to send email");
    }

    console.log(`[send-confirmation-email] Verification token sent to: ${email}`);
    
    return new Response(
      JSON.stringify({ success: true }), 
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error) {
    console.error("[send-confirmation-email] Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "email_send_failed" }), 
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
