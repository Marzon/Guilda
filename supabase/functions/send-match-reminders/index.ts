import { createClient } from "npm:@supabase/supabase-js@2";
import { sendBrevoEmail } from "../_shared/brevo.ts";

const APP_URL = "https://guilda.app.br";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PendingMatch {
  username: string;
  archetype: string;
  bio?: string;
}

interface UnmessagedMatch {
  username: string;
  archetype: string;
  matchedAt: string;
}

function buildReminderEmailTemplate(
  userName: string,
  pendingMatches: PendingMatch[],
  unmessagedMatches: UnmessagedMatch[],
  locale: string = "pt"
): string {
  const translations = {
    pt: {
      title: "Atualizações de conexões",
      greeting: "Olá",
      pendingTitle: "Matches aguardando resposta",
      pendingIntro: (count: number) => `Você tem <strong>${count}</strong> ${count === 1 ? 'solicitação' : 'solicitações'} de match aguardando:`,
      unmessagedTitle: "Conexões sem conversa",
      unmessagedIntro: (count: number) => `${count} ${count === 1 ? 'conexão' : 'conexões'} ${count === 1 ? 'está esperando' : 'estão esperando'} sua mensagem:`,
      pendingCta: "Ver Solicitações",
      unmessagedCta: "Iniciar Conversa",
      footer: "Este é um lembrete automático da Guilda."
    },
    en: {
      title: "Connection updates",
      greeting: "Hello",
      pendingTitle: "Matches awaiting response",
      pendingIntro: (count: number) => `You have <strong>${count}</strong> match ${count === 1 ? 'request' : 'requests'} waiting:`,
      unmessagedTitle: "Connections without conversation",
      unmessagedIntro: (count: number) => `${count} ${count === 1 ? 'connection is' : 'connections are'} waiting for your message:`,
      pendingCta: "View Requests",
      unmessagedCta: "Start Conversation",
      footer: "This is an automatic reminder from Guilda."
    },
    es: {
      title: "Actualizaciones de conexiones",
      greeting: "Hola",
      pendingTitle: "Matches esperando respuesta",
      pendingIntro: (count: number) => `Tienes <strong>${count}</strong> ${count === 1 ? 'solicitud' : 'solicitudes'} de match esperando:`,
      unmessagedTitle: "Conexiones sin conversación",
      unmessagedIntro: (count: number) => `${count} ${count === 1 ? 'conexión está esperando' : 'conexiones están esperando'} tu mensaje:`,
      pendingCta: "Ver Solicitudes",
      unmessagedCta: "Iniciar Conversación",
      footer: "Este es un recordatorio automático de Guilda."
    }
  };

  const t = translations[locale as keyof typeof translations] || translations.pt;

  let pendingHtml = "";
  if (pendingMatches.length > 0) {
    pendingHtml = `
      <h3 style="color: #1f2937; font-size: 18px; margin: 24px 0 12px;">📩 ${t.pendingTitle}</h3>
      <p style="color: #4b5563;">${t.pendingIntro(pendingMatches.length)}</p>
    `;
    
    for (const match of pendingMatches.slice(0, 3)) {
      const archLabel = match.archetype === "BUILDER" ? "Builder" : "Seller";
      const bio = match.bio?.substring(0, 80) || "";
      pendingHtml += `
        <div style="background-color: #f3f4f6; border: 1px solid #e5e7eb; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 8px 0;">
          <strong style="color: #1f2937;">@${match.username}</strong> 
          <span style="color: #6b7280;">- ${archLabel}</span><br>
          ${bio ? `<span style="color: #4b5563; font-size: 14px;">"${bio}${match.bio && match.bio.length > 80 ? '...' : ''}"</span>` : ''}
        </div>
      `;
    }
    
    if (pendingMatches.length > 3) {
      pendingHtml += `<p style="text-align: center; color: #6b7280;">+ ${pendingMatches.length - 3} mais</p>`;
    }
  }

  let unmessagedHtml = "";
  if (unmessagedMatches.length > 0) {
    unmessagedHtml = `
      <h3 style="color: #1f2937; font-size: 18px; margin: 24px 0 12px;">💬 ${t.unmessagedTitle}</h3>
      <p style="color: #4b5563;">${t.unmessagedIntro(unmessagedMatches.length)}</p>
    `;
    
    for (const match of unmessagedMatches.slice(0, 3)) {
      const archLabel = match.archetype === "BUILDER" ? "Builder" : "Seller";
      unmessagedHtml += `
        <div style="background-color: #f3f4f6; border: 1px solid #e5e7eb; border-left: 4px solid #7c3aed; border-radius: 8px; padding: 16px; margin: 8px 0;">
          <strong style="color: #1f2937;">@${match.username}</strong> 
          <span style="color: #6b7280;">- ${archLabel}</span>
        </div>
      `;
    }
    
    if (unmessagedMatches.length > 3) {
      unmessagedHtml += `<p style="text-align: center; color: #6b7280;">+ ${unmessagedMatches.length - 3} mais</p>`;
    }
  }

  const ctaUrl = pendingMatches.length > 0 ? `${APP_URL}/matches` : `${APP_URL}/messages`;
  const ctaText = pendingMatches.length > 0 ? t.pendingCta : t.unmessagedCta;

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
                ${t.title}
              </h2>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 24px; margin: 0 0 16px 0;">
                ${t.greeting} <strong style="color: #1f2937;">${userName}</strong>,
              </p>

              ${pendingHtml}
              ${unmessagedHtml}
              
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 24px;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${ctaUrl}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #9333ea 100%); color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 12px;">
                      ${ctaText}
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
                ${t.footer}
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.includes(supabaseServiceKey)) {
      console.log("[send-match-reminders] Unauthorized");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log("[send-match-reminders] Starting consolidated reminder job...");

    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // 1. Get pending matches (> 48h old)
    const { data: pendingMatches, error: pendingError } = await supabase
      .from("matches")
      .select("target_id, requester_id, profiles!matches_requester_id_fkey(username, archetype, bio)")
      .eq("status", "PENDING")
      .lte("created_at", twoDaysAgo.toISOString());

    if (pendingError) {
      console.error("Error fetching pending matches:", pendingError);
    }

    // 2. Get accepted matches without messages (24-48h old)
    const { data: acceptedMatches, error: acceptedError } = await supabase
      .from("matches")
      .select(`
        id,
        requester_id,
        target_id,
        updated_at,
        requester:profiles!matches_requester_id_fkey(id, username, archetype),
        target:profiles!matches_target_id_fkey(id, username, archetype)
      `)
      .eq("status", "ACCEPTED")
      .gte("updated_at", twoDaysAgo.toISOString())
      .lte("updated_at", oneDayAgo.toISOString());

    if (acceptedError) {
      console.error("Error fetching accepted matches:", acceptedError);
    }

    console.log(`Found ${pendingMatches?.length || 0} pending, ${acceptedMatches?.length || 0} accepted matches`);

    // Build user reminder data
    const userReminders = new Map<string, { pending: PendingMatch[]; unmessaged: UnmessagedMatch[] }>();

    // Add pending matches
    for (const match of pendingMatches || []) {
      const userId = match.target_id;
      const existing = userReminders.get(userId) || { pending: [], unmessaged: [] };
      const profile = match.profiles as any;
      existing.pending.push({
        username: profile?.username || "Alguém",
        archetype: profile?.archetype || "BUILDER",
        bio: profile?.bio,
      });
      userReminders.set(userId, existing);
    }

    // Add unmessaged accepted matches
    for (const match of acceptedMatches || []) {
      // Check if there's a conversation with messages
      const { data: conversation } = await supabase
        .from("conversations")
        .select("id")
        .or(`and(participant_1.eq.${match.requester_id},participant_2.eq.${match.target_id}),and(participant_1.eq.${match.target_id},participant_2.eq.${match.requester_id})`)
        .single();

      if (conversation) {
        const { count } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("conversation_id", conversation.id);

        if (count && count > 1) {
          continue; // Already has messages
        }
      }

      // Check if already reminded
      const { data: existingNotification } = await supabase
        .from("notifications")
        .select("id")
        .eq("type", "match_reminder")
        .eq("related_match_id", match.id)
        .limit(1);

      if (existingNotification && existingNotification.length > 0) {
        continue;
      }

      const requester = match.requester as any;
      const target = match.target as any;

      // Add to both users
      for (const [userId, otherProfile] of [[match.requester_id, target], [match.target_id, requester]] as const) {
        const existing = userReminders.get(userId) || { pending: [], unmessaged: [] };
        existing.unmessaged.push({
          username: otherProfile?.username || "Alguém",
          archetype: otherProfile?.archetype || "BUILDER",
          matchedAt: match.updated_at,
        });
        userReminders.set(userId, existing);
      }
    }

    let emailsSent = 0;
    let usersProcessed = 0;

    for (const [userId, reminders] of userReminders.entries()) {
      // Skip if no reminders
      if (reminders.pending.length === 0 && reminders.unmessaged.length === 0) {
        continue;
      }

      try {
        // Check rate limit - max 1 reminder email per day
        const { data: rateLimit } = await supabase
          .from("email_rate_limits")
          .select("*")
          .eq("user_id", userId)
          .eq("email_type", "match_reminder")
          .single();

        const today = new Date().toISOString().split('T')[0];
        
        if (rateLimit && rateLimit.reset_date === today && rateLimit.count_today >= 1) {
          console.log(`User ${userId} already received reminder today, skipping`);
          continue;
        }

        // Check email preferences
        const { data: prefs } = await supabase
          .from("email_preferences")
          .select("pending_match_reminder, match_accepted, quiet_mode, quiet_mode_until")
          .eq("user_id", userId)
          .single();

        // Skip if quiet mode is enabled
        if (prefs?.quiet_mode) {
          if (!prefs.quiet_mode_until || new Date(prefs.quiet_mode_until) > new Date()) {
            console.log(`User ${userId} has quiet mode enabled, skipping`);
            continue;
          }
        }

        // Skip if all relevant preferences are disabled
        if (reminders.pending.length > 0 && prefs?.pending_match_reminder === false) {
          reminders.pending = [];
        }
        if (reminders.unmessaged.length > 0 && prefs?.match_accepted === false) {
          reminders.unmessaged = [];
        }

        if (reminders.pending.length === 0 && reminders.unmessaged.length === 0) {
          continue;
        }

        // Get user info
        const { data: profile } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", userId)
          .single();

        const { data: authUser } = await supabase.auth.admin.getUserById(userId);
        const email = authUser?.user?.email;

        if (!email || !profile) {
          continue;
        }

        // Get locale
        const { data: waitlistData } = await supabase
          .from("waitlist_signups")
          .select("locale")
          .eq("email", email)
          .single();
        const locale = waitlistData?.locale || "pt";

        // Build subject
        let subject = "";
        if (reminders.pending.length > 0 && reminders.unmessaged.length > 0) {
          subject = locale === "pt" 
            ? `${reminders.pending.length + reminders.unmessaged.length} conexões aguardando sua atenção`
            : `${reminders.pending.length + reminders.unmessaged.length} connections waiting for you`;
        } else if (reminders.pending.length > 0) {
          subject = locale === "pt" 
            ? `Você tem ${reminders.pending.length} match${reminders.pending.length === 1 ? '' : 'es'} pendente${reminders.pending.length === 1 ? '' : 's'}`
            : `You have ${reminders.pending.length} pending match${reminders.pending.length === 1 ? '' : 'es'}`;
        } else {
          subject = locale === "pt"
            ? `${reminders.unmessaged.length} conexão aguardando sua mensagem`
            : `${reminders.unmessaged.length} connection waiting for your message`;
        }

        // Send email
        const result = await sendBrevoEmail({
          to: [{ email }],
          subject,
          htmlContent: buildReminderEmailTemplate(
            profile.username,
            reminders.pending,
            reminders.unmessaged,
            locale
          ),
          tags: ["match-reminder"],
        });

        if (result.success) {
          emailsSent++;
          
          // Update rate limit
          await supabase
            .from("email_rate_limits")
            .upsert({
              user_id: userId,
              email_type: "match_reminder",
              last_sent_at: new Date().toISOString(),
              count_today: 1,
              reset_date: today,
            }, { onConflict: "user_id,email_type" });

          // Create notification record for tracking
          await supabase.from("notifications").insert({
            user_id: userId,
            type: "match_reminder",
            title: subject,
            message: `Você tem ${reminders.pending.length} matches pendentes e ${reminders.unmessaged.length} conexões sem conversa.`,
            sent_email: true,
          });
        }

        usersProcessed++;
      } catch (error) {
        console.error(`Error processing user ${userId}:`, error);
      }
    }

    console.log(`[send-match-reminders] Completed: ${emailsSent} emails sent, ${usersProcessed} users processed`);

    return new Response(
      JSON.stringify({ success: true, emailsSent, usersProcessed }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in send-match-reminders:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
