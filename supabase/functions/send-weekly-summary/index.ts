import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { sendBrevoEmail } from "../_shared/brevo.ts";

const APP_URL = "https://guilda.app.br";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const authHeader = req.headers.get("Authorization");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  
  if (!authHeader || authHeader !== `Bearer ${serviceRoleKey}`) {
    console.error("Unauthorized request to send-weekly-summary");
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    console.log("Starting weekly summary email job");

    const { data: prefsData, error: prefsError } = await supabaseClient
      .from("email_preferences")
      .select("user_id")
      .eq("weekly_summary", true);

    if (prefsError) {
      console.error("Error fetching preferences:", prefsError);
      throw prefsError;
    }

    console.log(`Found ${prefsData?.length || 0} users with weekly summary enabled`);

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    for (const pref of prefsData || []) {
      try {
        const userId = pref.user_id;

        const { data: authUser } = await supabaseClient.auth.admin.getUserById(userId);
        const { data: profile } = await supabaseClient
          .from("profiles")
          .select("username")
          .eq("id", userId)
          .single();

        if (!authUser?.user?.email || !profile) continue;

        const userEmail = authUser.user.email;
        const userName = profile.username || "Aventureiro";

        const { data: waitlistData } = await supabaseClient
          .from("waitlist_signups")
          .select("locale")
          .eq("email", userEmail)
          .single();
        const locale = waitlistData?.locale || 'pt';

        const { count: newMatchRequests } = await supabaseClient
          .from("matches")
          .select("*", { count: "exact", head: true })
          .eq("target_id", userId)
          .eq("status", "PENDING")
          .gte("created_at", weekAgo.toISOString());

        const { count: acceptedMatches } = await supabaseClient
          .from("matches")
          .select("*", { count: "exact", head: true })
          .or(`requester_id.eq.${userId},target_id.eq.${userId}`)
          .eq("status", "ACCEPTED")
          .gte("updated_at", weekAgo.toISOString());

        const { data: acceptedMatchIds } = await supabaseClient
          .from("matches")
          .select("id")
          .or(`requester_id.eq.${userId},target_id.eq.${userId}`)
          .eq("status", "ACCEPTED");

        const matchIds = acceptedMatchIds?.map(m => m.id) || [];
        let unreadMessages = 0;
        
        if (matchIds.length > 0) {
          const { count } = await supabaseClient
            .from("messages")
            .select("*", { count: "exact", head: true })
            .in("match_id", matchIds)
            .neq("sender_id", userId)
            .gte("created_at", weekAgo.toISOString());
          unreadMessages = count || 0;
        }

        const { count: projectInvites } = await supabaseClient
          .from("project_invites")
          .select("*", { count: "exact", head: true })
          .eq("invitee_id", userId)
          .eq("status", "PENDING")
          .gte("created_at", weekAgo.toISOString());

        const { count: newUsers } = await supabaseClient
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .gte("created_at", weekAgo.toISOString());

        if (!newMatchRequests && !acceptedMatches && !unreadMessages && !projectInvites) {
          console.log(`No activity for user ${userId}, skipping email`);
          continue;
        }

        const translations = {
          pt: {
            subject: "Seu Resumo Semanal na Guilda",
            title: "Resumo Semanal",
            greeting: "Olá",
            intro: "Veja o que aconteceu esta semana:",
            matchRequests: "novos pedidos de match",
            acceptedMatches: "matches aceitos",
            unreadMessages: "mensagens não lidas",
            projectInvites: "convites de projeto pendentes",
            newUsers: "novos aventureiros entraram",
            button: "Ver Atividades",
            footer: "Este é um resumo automático semanal da Guilda."
          },
          en: {
            subject: "Your Weekly Summary on Guilda",
            title: "Weekly Summary",
            greeting: "Hello",
            intro: "Here's what happened this week:",
            matchRequests: "new match requests",
            acceptedMatches: "accepted matches",
            unreadMessages: "unread messages",
            projectInvites: "pending project invites",
            newUsers: "new adventurers joined",
            button: "View Activity",
            footer: "This is an automatic weekly summary from Guilda."
          },
          es: {
            subject: "Tu Resumen Semanal en Guilda",
            title: "Resumen Semanal",
            greeting: "Hola",
            intro: "Esto es lo que pasó esta semana:",
            matchRequests: "nuevas solicitudes de match",
            acceptedMatches: "matches aceptados",
            unreadMessages: "mensajes no leídos",
            projectInvites: "invitaciones de proyecto pendientes",
            newUsers: "nuevos aventureros se unieron",
            button: "Ver Actividad",
            footer: "Este es un resumen semanal automático de Guilda."
          }
        };

        const t = translations[locale as keyof typeof translations] || translations.pt;

        let statsHtml = "";
        if (newMatchRequests) statsHtml += `<div style="background-color: #f3f4f6; border-left: 4px solid #7c3aed; padding: 12px 16px; margin: 8px 0; border-radius: 0 8px 8px 0;"><span style="color: #1f2937; font-weight: 600;">${newMatchRequests}</span> <span style="color: #4b5563;">${t.matchRequests}</span></div>`;
        if (acceptedMatches) statsHtml += `<div style="background-color: #f3f4f6; border-left: 4px solid #10b981; padding: 12px 16px; margin: 8px 0; border-radius: 0 8px 8px 0;"><span style="color: #1f2937; font-weight: 600;">${acceptedMatches}</span> <span style="color: #4b5563;">${t.acceptedMatches}</span></div>`;
        if (unreadMessages) statsHtml += `<div style="background-color: #f3f4f6; border-left: 4px solid #f59e0b; padding: 12px 16px; margin: 8px 0; border-radius: 0 8px 8px 0;"><span style="color: #1f2937; font-weight: 600;">${unreadMessages}</span> <span style="color: #4b5563;">${t.unreadMessages}</span></div>`;
        if (projectInvites) statsHtml += `<div style="background-color: #f3f4f6; border-left: 4px solid #06b6d4; padding: 12px 16px; margin: 8px 0; border-radius: 0 8px 8px 0;"><span style="color: #1f2937; font-weight: 600;">${projectInvites}</span> <span style="color: #4b5563;">${t.projectInvites}</span></div>`;
        if (newUsers) statsHtml += `<div style="background-color: #f3f4f6; border-left: 4px solid #8b5cf6; padding: 12px 16px; margin: 8px 0; border-radius: 0 8px 8px 0;"><span style="color: #1f2937; font-weight: 600;">${newUsers}</span> <span style="color: #4b5563;">${t.newUsers}</span></div>`;

        const emailHtml = buildEmailTemplate(
          t.title,
          t.greeting,
          userName,
          `<p style="color: #4b5563; margin-bottom: 16px;">${t.intro}</p>${statsHtml}`,
          APP_URL,
          t.button,
          t.footer
        );

        await sendBrevoEmail({
          to: [{ email: userEmail }],
          subject: t.subject,
          htmlContent: emailHtml,
          tags: ["weekly-summary"],
        });

        console.log(`Weekly summary sent to ${userEmail}`);
      } catch (error) {
        console.error(`Error processing user ${pref.user_id}:`, error);
      }
    }

    return new Response(
      JSON.stringify({ success: true, processed: prefsData?.length || 0 }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-weekly-summary:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

function buildEmailTemplate(
  title: string,
  greeting: string,
  userName: string,
  content: string,
  buttonUrl: string,
  buttonText: string,
  footer: string
): string {
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
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%); padding: 24px 40px; text-align: center;">
              <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0;">Guilda</h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 32px 40px;">
              <h2 style="color: #1f2937; font-size: 22px; font-weight: 700; margin: 0 0 16px 0;">
                ${title}
              </h2>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 24px; margin: 0 0 16px 0;">
                ${greeting} <strong style="color: #1f2937;">${userName}</strong>,
              </p>
              
              <div style="font-size: 16px; line-height: 24px; margin: 0 0 24px 0;">
                ${content}
              </div>
              
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align: center;">
                    <a href="${buttonUrl}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #9333ea 100%); color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 12px;">
                      ${buttonText}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px 40px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 13px; line-height: 20px; margin: 0; text-align: center;">
                ${footer}
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

serve(handler);
