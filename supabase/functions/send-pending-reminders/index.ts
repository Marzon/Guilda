import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { sendBrevoEmail } from "../_shared/brevo.ts";
import { hoursAgo, logWithSaoPauloTime } from "../_shared/timezone.ts";

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
    logWithSaoPauloTime("send-pending-reminders", "Unauthorized request");
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

    logWithSaoPauloTime("send-pending-reminders", "Starting pending match reminders job");

    // Use 48 hours ago for pending match threshold
    const twoDaysAgo = hoursAgo(48);

    const { data: pendingMatches, error: matchesError } = await supabaseClient
      .from("matches")
      .select("target_id, requester_id, profiles!matches_requester_id_fkey(username, archetype, bio)")
      .eq("status", "PENDING")
      .lte("created_at", twoDaysAgo.toISOString());

    if (matchesError) {
      console.error("Error fetching pending matches:", matchesError);
      throw matchesError;
    }

    console.log(`Found ${pendingMatches?.length || 0} pending matches older than 48h`);

    const matchesByUser = new Map<string, any[]>();
    for (const match of pendingMatches || []) {
      const existing = matchesByUser.get(match.target_id) || [];
      existing.push(match);
      matchesByUser.set(match.target_id, existing);
    }

    for (const [userId, matches] of matchesByUser.entries()) {
      try {
        const { data: prefs } = await supabaseClient
          .from("email_preferences")
          .select("pending_match_reminder")
          .eq("user_id", userId)
          .single();

        if (!prefs?.pending_match_reminder) {
          console.log(`User ${userId} has reminders disabled, skipping`);
          continue;
        }

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

        const translations = {
          pt: {
            subject: "Você tem matches pendentes!",
            title: "Matches Aguardando Resposta",
            greeting: "Olá",
            intro: `Você tem <strong>${matches.length}</strong> ${matches.length === 1 ? 'solicitação' : 'solicitações'} de match aguardando sua resposta:`,
            dontMiss: "Não deixe passar oportunidades!",
            button: "Responder Agora",
            footer: "Este é um lembrete automático da Guilda."
          },
          en: {
            subject: "You have pending matches!",
            title: "Matches Awaiting Response",
            greeting: "Hello",
            intro: `You have <strong>${matches.length}</strong> match ${matches.length === 1 ? 'request' : 'requests'} awaiting your response:`,
            dontMiss: "Don't miss opportunities!",
            button: "Respond Now",
            footer: "This is an automatic reminder from Guilda."
          },
          es: {
            subject: "¡Tienes matches pendientes!",
            title: "Matches Esperando Respuesta",
            greeting: "Hola",
            intro: `Tienes <strong>${matches.length}</strong> ${matches.length === 1 ? 'solicitud' : 'solicitudes'} de match esperando tu respuesta:`,
            dontMiss: "¡No dejes pasar oportunidades!",
            button: "Responder Ahora",
            footer: "Este es un recordatorio automático de Guilda."
          }
        };

        const t = translations[locale as keyof typeof translations] || translations.pt;

        let matchesList = "";
        for (const match of matches.slice(0, 5)) {
          const requesterProfile = match.profiles as any;
          const archetype = locale === 'pt' ? (requesterProfile.archetype === 'BUILDER' ? 'Builder' : 'Seller') :
                            requesterProfile.archetype === 'BUILDER' ? 'Builder' : 'Seller';
          const bio = requesterProfile.bio?.substring(0, 100) || (locale === 'pt' ? 'Sem bio' : locale === 'es' ? 'Sin bio' : 'No bio');
          matchesList += `
            <div style="background-color: #f3f4f6; border: 1px solid #e5e7eb; border-left: 4px solid #7c3aed; border-radius: 8px; padding: 16px; margin: 12px 0;">
              <strong style="color: #1f2937;">@${requesterProfile.username}</strong> <span style="color: #6b7280;">- ${archetype}</span><br>
              <span style="color: #4b5563; font-size: 14px;">"${bio}${requesterProfile.bio?.length > 100 ? '...' : ''}"</span>
            </div>
          `;
        }
        if (matches.length > 5) {
          const remaining = matches.length - 5;
          matchesList += `<p style="text-align: center; color: #6b7280; margin-top: 12px;">
            ${locale === 'pt' ? `+ ${remaining} mais` : locale === 'es' ? `+ ${remaining} más` : `+ ${remaining} more`}
          </p>`;
        }

        const emailHtml = buildEmailTemplate(
          t.title,
          t.greeting,
          userName,
          `<p style="color: #4b5563;">${t.intro}</p>${matchesList}<p style="color: #1f2937; font-weight: 600; margin-top: 16px;">${t.dontMiss}</p>`,
          `${APP_URL}/matches`,
          t.button,
          t.footer
        );

        await sendBrevoEmail({
          to: [{ email: userEmail }],
          subject: t.subject,
          htmlContent: emailHtml,
          tags: ["pending-reminder"],
        });

        console.log(`Pending reminder sent to ${userEmail}`);
      } catch (error) {
        console.error(`Error processing user ${userId}:`, error);
      }
    }

    return new Response(
      JSON.stringify({ success: true, processed: matchesByUser.size }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-pending-reminders:", error);
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
