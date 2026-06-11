import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { EMAIL_URLS } from "../_shared/constants.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Affected users with their showcase projects
const AFFECTED_USERS = [
  { username: "DivineKnight", email: "ricardo.erik@gmail.com", project: "NomadHub" },
  { username: "FlavioVerissimo", email: "fvffonseca@gmail.com", project: "PetMatch Brasil" },
  { username: "Visi", email: "ste.mendonca@outlook.com", project: "EcoTrack" },
  { username: "CunningBardWeaver", email: "heviadm@gmail.com", project: "SkillSwap" },
  { username: "Brendway", email: "brend@growthway.online", project: "FoodRescue" },
  { username: "rafy-co", email: "rafa.wabz@gmail.com", project: "MentorMatch" },
  { username: "FintechNator", email: "fernandoluisdecastro@gmail.com", project: "FreelanceFlow" },
  { username: "StormHunter", email: "delfiol.robson6@gmail.com", project: "CodeReview.ai" },
];

const getEmailContent = (username: string, projectName: string, locale: string) => {
  const translations: Record<string, { subject: string; title: string; body: string; cta: string }> = {
    pt: {
      subject: `📋 Esclarecimento sobre o projeto "${projectName}"`,
      title: "Esclarecimento sobre projeto em sua conta",
      body: `
        <p>Olá <strong>${username}</strong>!</p>
        <p>Identificamos que o projeto <strong>"${projectName}"</strong> que aparecia em sua conta era um projeto de <strong>demonstração</strong> criado pela equipe Guilda para fins de showcase na página de descoberta.</p>
        <p>Este projeto <strong>não aparecerá mais</strong> na aba "Meus Projetos" da sua conta.</p>
        <p>Se você deseja criar seu próprio projeto real e montar sua equipe de co-founders, clique no botão abaixo! 🚀</p>
      `,
      cta: "Criar Meu Projeto",
    },
    en: {
      subject: `📋 Clarification about the project "${projectName}"`,
      title: "Clarification about a project in your account",
      body: `
        <p>Hello <strong>${username}</strong>!</p>
        <p>We identified that the project <strong>"${projectName}"</strong> that appeared in your account was a <strong>demonstration</strong> project created by the Guilda team for showcase purposes on the discovery page.</p>
        <p>This project <strong>will no longer appear</strong> in the "My Projects" tab of your account.</p>
        <p>If you want to create your own real project and build your co-founder team, click the button below! 🚀</p>
      `,
      cta: "Create My Project",
    },
    es: {
      subject: `📋 Aclaración sobre el proyecto "${projectName}"`,
      title: "Aclaración sobre un proyecto en tu cuenta",
      body: `
        <p>¡Hola <strong>${username}</strong>!</p>
        <p>Identificamos que el proyecto <strong>"${projectName}"</strong> que aparecía en tu cuenta era un proyecto de <strong>demostración</strong> creado por el equipo de Guilda para fines de showcase en la página de descubrimiento.</p>
        <p>Este proyecto <strong>ya no aparecerá</strong> en la pestaña "Mis Proyectos" de tu cuenta.</p>
        <p>Si deseas crear tu propio proyecto real y formar tu equipo de co-fundadores, ¡haz clic en el botón de abajo! 🚀</p>
      `,
      cta: "Crear Mi Proyecto",
    },
  };

  return translations[locale] || translations.en;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const results: { user: string; notification: boolean; email: boolean; error?: string }[] = [];

    for (const user of AFFECTED_USERS) {
      try {
        // Get user_id from profiles by username
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("username", user.username)
          .single();

        if (!profile) {
          console.log(`User ${user.username} not found in profiles`);
          results.push({ user: user.username, notification: false, email: false, error: "User not found" });
          continue;
        }

        // Get locale from waitlist or default to pt
        const { data: waitlistEntry } = await supabase
          .from("waitlist_signups")
          .select("locale")
          .ilike("email", user.email)
          .single();

        const locale = waitlistEntry?.locale || "pt";
        const content = getEmailContent(user.username, user.project, locale);

        // Create in-app notification
        const { error: notifError } = await supabase.from("notifications").insert({
          user_id: profile.id,
          type: "showcase_clarification",
          title: content.title,
          message: `O projeto "${user.project}" era de demonstração e foi removido de "Meus Projetos". Crie seu próprio projeto real!`,
        });

        if (notifError) {
          console.error(`Notification error for ${user.username}:`, notifError);
        }

        // Send email via Resend
        const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
        let emailSent = false;

        if (RESEND_API_KEY) {
          const emailHtml = `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; background-color: #0B0E14; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0B0E14; padding: 40px 20px;">
                <tr>
                  <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(245, 158, 11, 0.1) 100%); border-radius: 16px; border: 1px solid rgba(139, 92, 246, 0.3);">
                      <tr>
                        <td style="padding: 40px;">
                          <h1 style="color: #F59E0B; font-size: 28px; margin: 0 0 24px 0; font-weight: 700;">
                            ⚔️ Guilda
                          </h1>
                          <h2 style="color: #FFFFFF; font-size: 22px; margin: 0 0 20px 0;">
                            ${content.title}
                          </h2>
                          <div style="color: #E5E7EB; font-size: 16px; line-height: 1.6;">
                            ${content.body}
                          </div>
                          <table cellpadding="0" cellspacing="0" style="margin-top: 32px;">
                            <tr>
                              <td style="background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); border-radius: 8px;">
                                <a href="${EMAIL_URLS.createProject}" style="display: inline-block; padding: 14px 28px; color: #FFFFFF; text-decoration: none; font-weight: 600; font-size: 16px;">
                                  ${content.cta}
                                </a>
                              </td>
                            </tr>
                          </table>
                          <p style="color: #9CA3AF; font-size: 14px; margin-top: 32px;">
                            — Equipe Guilda 🏰
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

          const emailResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from: "Guilda <noreply@guilda.app.br>",
              to: [user.email],
              subject: content.subject,
              html: emailHtml,
            }),
          });

          emailSent = emailResponse.ok;
          if (!emailSent) {
            const errorText = await emailResponse.text();
            console.error(`Email error for ${user.username}:`, errorText);
          }
        }

        results.push({
          user: user.username,
          notification: !notifError,
          email: emailSent,
        });

        // Small delay between sends
        await new Promise((resolve) => setTimeout(resolve, 300));
      } catch (userError) {
        console.error(`Error processing ${user.username}:`, userError);
        results.push({ user: user.username, notification: false, email: false, error: String(userError) });
      }
    }

    console.log("Showcase notification results:", results);

    return new Response(JSON.stringify({ success: true, results }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error in send-showcase-notification:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);
