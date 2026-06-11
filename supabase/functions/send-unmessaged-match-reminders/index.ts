import { createClient } from "npm:@supabase/supabase-js@2";
import { sendBrevoEmail } from "../_shared/brevo.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function buildEmailTemplate(
  username: string,
  matchUsername: string,
  matchArchetype: string,
  locale: string
): string {
  const isBuilder = matchArchetype === "BUILDER";
  const archetypeLabel = locale === "pt" 
    ? (isBuilder ? "Builder (técnico)" : "Seller (negócios)")
    : (isBuilder ? "Builder (technical)" : "Seller (business)");

  const content = locale === "pt" ? {
    title: "Você tem uma conexão esperando!",
    greeting: `Olá ${username}!`,
    body: `Você conectou com <strong>@${matchUsername}</strong> (${archetypeLabel}) há 24 horas, mas ainda não conversaram.`,
    tip: "Dica: Pergunte sobre o projeto ou habilidade que mais te interessou!",
    cta: "Iniciar Conversa",
    footer: "Conexões que conversam têm 5x mais chances de colaborar."
  } : {
    title: "You have a connection waiting!",
    greeting: `Hi ${username}!`,
    body: `You connected with <strong>@${matchUsername}</strong> (${archetypeLabel}) 24 hours ago, but haven't chatted yet.`,
    tip: "Tip: Ask about the project or skill that interested you most!",
    cta: "Start Conversation",
    footer: "Connections that chat are 5x more likely to collaborate."
  };

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
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e5e7eb;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%); padding: 24px; text-align: center;">
              <h1 style="color: #ffffff; font-size: 20px; font-weight: 700; margin: 0;">${content.title}</h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 32px;">
              <p style="color: #1f2937; font-size: 16px; margin: 0 0 16px;">${content.greeting}</p>
              <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">${content.body}</p>
              
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 0 12px 12px 0; padding: 16px; margin-bottom: 24px;">
                <p style="color: #92400e; font-size: 14px; margin: 0;">${content.tip}</p>
              </div>
              
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align: center;">
                    <a href="https://guilda.app.br/messages" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #9333ea 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      ${content.cta}
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #6b7280; font-size: 13px; text-align: center; margin: 24px 0 0;">${content.footer}</p>
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

    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.includes(supabaseServiceKey)) {
      console.log("[send-unmessaged-match-reminders] Unauthorized");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log("[send-unmessaged-match-reminders] Starting reminder check...");

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

    const { data: unmessagedMatches, error: matchError } = await supabase
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
      .gte("updated_at", fortyEightHoursAgo)
      .lte("updated_at", twentyFourHoursAgo);

    if (matchError) {
      console.error("Error fetching matches:", matchError);
      throw matchError;
    }

    console.log(`Found ${unmessagedMatches?.length || 0} matches in 24-48h window`);

    let emailsSent = 0;
    let pushSent = 0;

    for (const match of unmessagedMatches || []) {
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
          console.log(`Match ${match.id}: Already has ${count} messages, skipping`);
          continue;
        }
      }

      const { data: existingNotification } = await supabase
        .from("notifications")
        .select("id")
        .eq("type", "unmessaged_match_reminder")
        .eq("related_match_id", match.id)
        .limit(1);

      if (existingNotification && existingNotification.length > 0) {
        console.log(`Match ${match.id}: Already reminded, skipping`);
        continue;
      }

      const requester = match.requester as any;
      const target = match.target as any;

      const usersToRemind = [
        { userId: match.requester_id, profile: requester, otherProfile: target },
        { userId: match.target_id, profile: target, otherProfile: requester },
      ];

      for (const { userId, profile, otherProfile } of usersToRemind) {
        const { data: authUser } = await supabase.auth.admin.getUserById(userId);
        const email = authUser?.user?.email;

        const { data: prefs } = await supabase
          .from("email_preferences")
          .select("match_accepted")
          .eq("user_id", userId)
          .single();

        if (email && (prefs?.match_accepted !== false)) {
          const result = await sendBrevoEmail({
            to: [{ email }],
            subject: `@${otherProfile.username} está esperando sua mensagem!`,
            htmlContent: buildEmailTemplate(
              profile.username,
              otherProfile.username,
              otherProfile.archetype,
              "pt"
            ),
            tags: ["unmessaged-match-reminder"],
          });
          if (result.success) emailsSent++;
        }

        try {
          await supabase.functions.invoke("send-push-notification", {
            body: {
              userId,
              title: "Conexão esperando!",
              body: `Você e @${otherProfile.username} conectaram há 24h mas não conversaram. Mande uma mensagem!`,
              type: "unmessaged_match_reminder",
              url: "/messages"
            }
          });
          pushSent++;
        } catch (err) {
          console.error("Push error:", err);
        }

        await supabase.from("notifications").insert({
          user_id: userId,
          type: "unmessaged_match_reminder",
          title: "Conexão esperando!",
          message: `Você conectou com @${otherProfile.username} há 24h. Mande uma mensagem!`,
          related_match_id: match.id,
          related_user_id: otherProfile.id,
        });
      }

      console.log(`Match ${match.id}: Sent reminders to both users`);
    }

    console.log(`[send-unmessaged-match-reminders] Complete: ${emailsSent} emails, ${pushSent} push`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: unmessagedMatches?.length || 0,
        emailsSent,
        pushSent 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in send-unmessaged-match-reminders:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
