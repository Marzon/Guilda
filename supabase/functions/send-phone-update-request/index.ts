import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { sendBrevoEmail } from "../_shared/brevo.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BATCH_SIZE = 3;
const BATCH_DELAY_MS = 2000;

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function generateEmailHtml(username: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f3f4f6;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e5e7eb;">
          <tr>
            <td style="background: linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%); padding: 24px 40px; text-align: center;">
              <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0;">⚔️ Guilda</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 40px;">
              <h2 style="color: #1f2937; font-size: 22px; font-weight: 700; margin: 0 0 16px 0;">Olá, ${username}! 👋</h2>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
                Notamos que seu perfil está quase completo, mas está faltando o seu <strong>número de telefone/WhatsApp</strong>.
              </p>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Adicionar seu telefone é importante para que outros founders possam entrar em contato direto com você sobre oportunidades de parceria e co-fundação.
              </p>
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
                <p style="color: #92400e; font-size: 14px; margin: 0;">
                  <strong>🔒 Privacidade:</strong> Seu telefone só é visível para conexões aceitas e nunca compartilhamos com terceiros.
                </p>
              </div>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align: center;">
                    <a href="https://guilda.app.br/profile" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #9333ea 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 600; font-size: 16px;">📱 Atualizar meu perfil</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 20px 40px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 12px; margin: 0; text-align: center;">© 2025 Guilda. Todos os direitos reservados.</p>
              <p style="color: #9ca3af; font-size: 11px; margin: 8px 0 0 0; text-align: center;">
                <a href="https://guilda.app.br/settings" style="color: #7c3aed; text-decoration: underline;">Gerenciar preferências de email</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

async function processEmailsInBackground(
  supabaseUrl: string,
  supabaseServiceKey: string,
  profiles: { id: string; username: string }[]
) {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  let emailsSent = 0;

  console.log(`[send-phone-update-request] Background: Starting to process ${profiles.length} users`);

  for (let i = 0; i < profiles.length; i += BATCH_SIZE) {
    const batch = profiles.slice(i, i + BATCH_SIZE);

    for (const profile of batch) {
      try {
        const { data: userData } = await supabase.auth.admin.getUserById(profile.id);
        
        if (userData?.user?.email) {
          const result = await sendBrevoEmail({
            to: [{ email: userData.user.email }],
            subject: "📱 Complete seu perfil na Guilda",
            htmlContent: generateEmailHtml(profile.username),
            tags: ["phone-update-request"],
          });
          if (result.success) emailsSent++;
        }
      } catch (error) {
        console.error(`[send-phone-update-request] Failed for ${profile.username}:`, error);
      }
      await sleep(500);
    }

    if (i + BATCH_SIZE < profiles.length) {
      await sleep(BATCH_DELAY_MS);
    }
  }

  console.log(`[send-phone-update-request] Background: Completed. Sent ${emailsSent}/${profiles.length} emails`);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });

    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden: Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let daysBack = 7;
    try {
      const body = await req.json();
      if (body.days_back && typeof body.days_back === 'number') {
        daysBack = Math.min(body.days_back, 30);
      }
    } catch {}

    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, username")
      .is("phone", null)
      .gte("created_at", new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString());

    if (profilesError) throw profilesError;

    if (!profiles || profiles.length === 0) {
      return new Response(
        JSON.stringify({ success: true, totalUsers: 0, message: "No users without phone found" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // @ts-ignore
    if (typeof EdgeRuntime !== 'undefined' && EdgeRuntime.waitUntil) {
      // @ts-ignore
      EdgeRuntime.waitUntil(processEmailsInBackground(supabaseUrl, supabaseServiceKey, profiles));
      
      return new Response(
        JSON.stringify({ success: true, totalUsers: profiles.length, message: `Processando ${profiles.length} emails em background.`, processing: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      return new Response(
        JSON.stringify({ success: true, totalUsers: profiles.length, message: `${profiles.length} users found.` }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("[send-phone-update-request] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
