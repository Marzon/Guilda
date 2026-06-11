import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { sendBrevoEmail } from "../_shared/brevo.ts";

const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };

const getEmailContent = (locale: string) => ({
  pt: { subject: "Redefinir sua senha - Guilda", title: "Redefinição de Senha", body: "Você solicitou a redefinição da sua senha na Guilda. Clique no botão abaixo para criar uma nova senha.", cta: "Redefinir Senha", warning: "Se você não solicitou esta redefinição, ignore este email." },
  en: { subject: "Reset your password - Guilda", title: "Password Reset", body: "You requested to reset your password on Guilda. Click the button below to create a new password.", cta: "Reset Password", warning: "If you didn't request this reset, please ignore this email." },
  es: { subject: "Restablecer tu contraseña - Guilda", title: "Restablecimiento de Contraseña", body: "Solicitaste restablecer tu contraseña en Guilda. Haz clic en el botón de abajo para crear una nueva contraseña.", cta: "Restablecer Contraseña", warning: "Si no solicitaste este restablecimiento, ignora este correo." },
}[locale] || { subject: "Redefinir sua senha - Guilda", title: "Redefinição de Senha", body: "Você solicitou a redefinição da sua senha na Guilda.", cta: "Redefinir Senha", warning: "Se você não solicitou esta redefinição, ignore este email." });

const generateEmailHtml = (content: { title: string; body: string; cta: string; warning: string }, resetUrl: string) => `
<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">
  <table role="presentation" width="100%" style="background-color: #f3f4f6;"><tr><td style="padding: 40px 20px;">
    <table role="presentation" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e5e7eb;">
      <tr><td style="background: linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%); padding: 24px 40px; text-align: center;"><h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0;">Guilda</h1></td></tr>
      <tr><td style="padding: 32px 40px; text-align: center;">
        <div style="width: 80px; height: 80px; margin: 0 auto 20px; background: linear-gradient(135deg, #7c3aed, #9333ea); border-radius: 50%; line-height: 80px; font-size: 36px;">🔐</div>
        <h2 style="color: #1f2937; font-size: 22px; margin: 0 0 16px;">${content.title}</h2>
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">${content.body}</p>
        <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #9333ea 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 600; font-size: 16px;">${content.cta}</a>
        <p style="color: #9ca3af; font-size: 14px; margin: 24px 0 0;">${content.warning}</p>
      </td></tr>
      <tr><td style="background-color: #f9fafb; padding: 20px 40px; border-top: 1px solid #e5e7eb;"><p style="color: #6b7280; font-size: 12px; margin: 0; text-align: center;">© 2024 Guilda - <a href="https://guilda.app.br" style="color: #7c3aed;">guilda.app.br</a></p></td></tr>
    </table>
  </td></tr></table>
</body></html>`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
    const { email, locale = "pt" } = await req.json();
    if (!email) return new Response(JSON.stringify({ error: "Email is required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { data, error } = await supabase.auth.admin.generateLink({ type: "recovery", email, options: { redirectTo: "https://guilda.app.br/auth" } });
    if (error || !data.properties?.action_link) return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const content = getEmailContent(locale);
    await sendBrevoEmail({
      to: [{ email }],
      subject: content.subject,
      htmlContent: generateEmailHtml(content, data.properties.action_link),
      tags: ["password-reset"],
    });
    
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
