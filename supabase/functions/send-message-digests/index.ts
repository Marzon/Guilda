import { createClient } from "npm:@supabase/supabase-js@2";
import { sendBrevoEmail } from "../_shared/brevo.ts";

const APP_URL = "https://guilda.app.br";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DigestMessage {
  senderName: string;
  preview: string;
  conversationId: string;
}

function buildDigestEmailTemplate(
  userName: string,
  messages: DigestMessage[],
  locale: string = "pt"
): string {
  const translations = {
    pt: {
      title: "Mensagens não lidas",
      greeting: "Olá",
      intro: `Você tem <strong>${messages.length}</strong> ${messages.length === 1 ? 'mensagem não lida' : 'mensagens não lidas'}:`,
      cta: "Ver Mensagens",
      footer: "Esta é uma notificação automática da Guilda."
    },
    en: {
      title: "Unread messages",
      greeting: "Hello",
      intro: `You have <strong>${messages.length}</strong> unread ${messages.length === 1 ? 'message' : 'messages'}:`,
      cta: "View Messages",
      footer: "This is an automatic notification from Guilda."
    },
    es: {
      title: "Mensajes no leídos",
      greeting: "Hola",
      intro: `Tienes <strong>${messages.length}</strong> ${messages.length === 1 ? 'mensaje no leído' : 'mensajes no leídos'}:`,
      cta: "Ver Mensajes",
      footer: "Esta es una notificación automática de Guilda."
    }
  };

  const t = translations[locale as keyof typeof translations] || translations.pt;

  // Group messages by sender
  const bySender = new Map<string, string[]>();
  for (const msg of messages) {
    const existing = bySender.get(msg.senderName) || [];
    existing.push(msg.preview);
    bySender.set(msg.senderName, existing);
  }

  let messagesHtml = "";
  for (const [sender, previews] of bySender.entries()) {
    const count = previews.length;
    const preview = previews[0].substring(0, 80) + (previews[0].length > 80 ? "..." : "");
    messagesHtml += `
      <div style="background-color: #f3f4f6; border: 1px solid #e5e7eb; border-left: 4px solid #7c3aed; border-radius: 8px; padding: 16px; margin: 12px 0;">
        <strong style="color: #1f2937;">@${sender}</strong> 
        <span style="color: #6b7280;">(${count} ${count === 1 ? 'mensagem' : 'mensagens'})</span><br>
        <span style="color: #4b5563; font-size: 14px;">"${preview}"</span>
      </div>
    `;
  }

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
              
              <p style="color: #4b5563; font-size: 16px; line-height: 24px; margin: 0 0 16px 0;">
                ${t.intro}
              </p>

              ${messagesHtml}
              
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 24px;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${APP_URL}/messages" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #9333ea 100%); color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 12px;">
                      ${t.cta}
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
      console.log("[send-message-digests] Unauthorized");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log("[send-message-digests] Starting digest processing...");

    // Get pending digests that are at least 15 minutes old (debounce)
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    
    const { data: pendingDigests, error: digestError } = await supabase
      .from("pending_email_digests")
      .select("*")
      .is("processed_at", null)
      .eq("notification_type", "new_message")
      .lte("created_at", fifteenMinutesAgo);

    if (digestError) {
      console.error("Error fetching pending digests:", digestError);
      throw digestError;
    }

    console.log(`Found ${pendingDigests?.length || 0} pending message digests`);

    if (!pendingDigests || pendingDigests.length === 0) {
      return new Response(
        JSON.stringify({ success: true, emailsSent: 0, message: "No pending digests" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Group digests by user
    const digestsByUser = new Map<string, typeof pendingDigests>();
    for (const digest of pendingDigests) {
      const existing = digestsByUser.get(digest.user_id) || [];
      existing.push(digest);
      digestsByUser.set(digest.user_id, existing);
    }

    let emailsSent = 0;
    const processedIds: string[] = [];

    for (const [userId, userDigests] of digestsByUser.entries()) {
      try {
        // Check user's message frequency preference
        const { data: prefs } = await supabase
          .from("email_preferences")
          .select("new_message, message_frequency")
          .eq("user_id", userId)
          .single();

        // Skip if user has disabled new_message or set to 'never'
        if (prefs?.new_message === false || prefs?.message_frequency === 'never') {
          console.log(`User ${userId} has message emails disabled, marking as processed`);
          processedIds.push(...userDigests.map(d => d.id));
          continue;
        }

        // Check rate limiting - max 3 message digest emails per day
        const { data: rateLimit } = await supabase
          .from("email_rate_limits")
          .select("*")
          .eq("user_id", userId)
          .eq("email_type", "new_message")
          .single();

        const today = new Date().toISOString().split('T')[0];
        
        if (rateLimit && rateLimit.reset_date === today && rateLimit.count_today >= 3) {
          console.log(`User ${userId} hit daily message email limit (3), skipping`);
          processedIds.push(...userDigests.map(d => d.id));
          continue;
        }

        // Check if user was recently active (push-first strategy)
        const { data: profile } = await supabase
          .from("profiles")
          .select("username, last_seen_at")
          .eq("id", userId)
          .single();

        const fifteenMinutesAgoDate = new Date(Date.now() - 15 * 60 * 1000);
        const wasRecentlyActive = profile?.last_seen_at && 
          new Date(profile.last_seen_at) > fifteenMinutesAgoDate;

        // Check if user has active push subscription
        const { count: pushCount } = await supabase
          .from("push_subscriptions")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId);

        const hasPush = (pushCount || 0) > 0;

        // If user was recently active AND has push, skip email
        if (wasRecentlyActive && hasPush) {
          console.log(`User ${userId} was recently active with push enabled, skipping email`);
          processedIds.push(...userDigests.map(d => d.id));
          continue;
        }

        // Get user email
        const { data: authUser } = await supabase.auth.admin.getUserById(userId);
        const email = authUser?.user?.email;

        if (!email) {
          console.log(`User ${userId} has no email, skipping`);
          processedIds.push(...userDigests.map(d => d.id));
          continue;
        }

        // Build digest messages
        const digestMessages: DigestMessage[] = [];
        for (const digest of userDigests) {
          const metadata = digest.metadata as any || {};
          digestMessages.push({
            senderName: metadata.senderName || "Alguém",
            preview: digest.message || "",
            conversationId: (metadata.conversationId as string) || "",
          });
        }

        // Send digest email
        const result = await sendBrevoEmail({
          to: [{ email }],
          subject: `Você tem ${digestMessages.length} ${digestMessages.length === 1 ? 'mensagem não lida' : 'mensagens não lidas'}`,
          htmlContent: buildDigestEmailTemplate(profile?.username || "Aventureiro", digestMessages, "pt"),
          tags: ["message-digest"],
        });

        if (result.success) {
          emailsSent++;
          
          // Update rate limit
          await supabase
            .from("email_rate_limits")
            .upsert({
              user_id: userId,
              email_type: "new_message",
              last_sent_at: new Date().toISOString(),
              count_today: rateLimit?.reset_date === today ? (rateLimit.count_today || 0) + 1 : 1,
              reset_date: today,
            }, { onConflict: "user_id,email_type" });
        }

        processedIds.push(...userDigests.map(d => d.id));
      } catch (error) {
        console.error(`Error processing digests for user ${userId}:`, error);
      }
    }

    // Mark all processed digests
    if (processedIds.length > 0) {
      await supabase
        .from("pending_email_digests")
        .update({ processed_at: new Date().toISOString() })
        .in("id", processedIds);
    }

    console.log(`[send-message-digests] Complete: ${emailsSent} emails sent, ${processedIds.length} digests processed`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailsSent,
        digestsProcessed: processedIds.length,
        usersProcessed: digestsByUser.size
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in send-message-digests:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
