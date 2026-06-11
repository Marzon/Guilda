import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { sendBrevoEmail } from "../_shared/brevo.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CohortWelcomeRequest {
  email: string;
  username: string;
  cohort_name: string;
  whatsapp_link: string | null;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, username, cohort_name, whatsapp_link }: CohortWelcomeRequest = await req.json();

    if (!email || !username || !cohort_name) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const whatsappSection = whatsapp_link
      ? `
        <div style="background: linear-gradient(135deg, #25D366 0%, #128C7E 100%); border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
          <p style="color: white; font-size: 16px; margin: 0 0 16px 0;">
            Entre agora no grupo exclusivo da turma:
          </p>
          <a href="${whatsapp_link}" style="display: inline-block; background: white; color: #128C7E; font-weight: bold; padding: 14px 32px; border-radius: 30px; text-decoration: none; font-size: 16px;">
            💬 Entrar no WhatsApp
          </a>
        </div>
      `
      : "";

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; margin-top: 20px; margin-bottom: 20px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #8b5cf6 100%); padding: 40px 24px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Parabéns, ${username}!</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 12px 0 0 0; font-size: 18px;">
              Você foi aprovado(a) para o programa de aceleração
            </p>
          </div>
          
          <!-- Content -->
          <div style="padding: 32px 24px;">
            <div style="background: #fef3c7; border: 1px solid #fcd34d; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
              <p style="margin: 0; color: #92400e; font-weight: 600;">
                🏆 Turma: <span style="color: #78350f;">${cohort_name}</span>
              </p>
            </div>
            
            <p style="color: #374151; font-size: 16px; margin-bottom: 16px;">
              Sua aplicação foi revisada e aprovada pela nossa equipe. Bem-vindo(a) ao programa!
            </p>
            
            <h3 style="color: #1f2937; margin-top: 24px; margin-bottom: 16px;">O que acontece agora?</h3>
            
            <ul style="color: #4b5563; padding-left: 20px;">
              <li style="margin-bottom: 8px;">✅ Seu tier foi atualizado para <strong>ALPHA</strong></li>
              <li style="margin-bottom: 8px;">✅ Você tem acesso a benefícios exclusivos na plataforma</li>
              <li style="margin-bottom: 8px;">✅ Conecte-se com outros membros da turma</li>
              <li style="margin-bottom: 8px;">✅ Participe das mentorias e conteúdos exclusivos</li>
            </ul>
            
            ${whatsappSection}
            
            <div style="text-align: center; margin-top: 32px;">
              <a href="https://guilda.app.br/tavern" style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); color: white; font-weight: bold; padding: 14px 32px; border-radius: 30px; text-decoration: none; font-size: 16px;">
                Acessar a Guilda
              </a>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              Guilda - Conectando Builders e Sellers
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 8px 0 0 0;">
              Este email foi enviado porque você se inscreveu no programa de aceleração.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const result = await sendBrevoEmail({
      to: [{ email, name: username }],
      subject: `🎉 Parabéns! Você foi aprovado para ${cohort_name}`,
      htmlContent: emailHtml,
      tags: ["cohort", "welcome"],
    });

    if (!result.success) {
      console.error("Brevo error:", result.error);
      throw new Error(`Brevo error: ${result.error}`);
    }

    console.log("Email sent successfully:", result.messageId);

    return new Response(
      JSON.stringify({ success: true, messageId: result.messageId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error sending cohort welcome email:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
