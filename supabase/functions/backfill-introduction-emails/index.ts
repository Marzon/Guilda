import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_USER_ID = "38a1c53d-b99e-4958-9bb2-18663d8b9b3e";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    // Verify JWT authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user from JWT
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if user is admin
    const { data: isAdmin } = await supabaseClient.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });

    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("[backfill-introductions] Starting comprehensive backfill...");

    // Fetch all introductions with their group conversations and message counts
    const { data: introductions, error: introError } = await supabaseClient
      .from("founder_introductions")
      .select(`
        id,
        introducer_id,
        introduced_id,
        recipient_id,
        group_conversation_id,
        message,
        created_at,
        status
      `)
      .eq("status", "ACTIVE")
      .order("created_at", { ascending: true });

    if (introError) {
      console.error("[backfill-introductions] Error fetching introductions:", introError);
      throw introError;
    }

    if (!introductions || introductions.length === 0) {
      console.log("[backfill-introductions] No introductions found");
      return new Response(
        JSON.stringify({ success: true, processed: 0, message: "No introductions found" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`[backfill-introductions] Found ${introductions.length} introductions`);

    let emailsSent = 0;
    let pushSent = 0;
    let messagesSent = 0;
    let errorCount = 0;

    for (const intro of introductions) {
      try {
        // Get message count for this group conversation
        const { count: messageCount } = await supabaseClient
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("group_conversation_id", intro.group_conversation_id);

        // Only process introductions with no response (only initial message)
        if (messageCount && messageCount > 1) {
          console.log(`[backfill-introductions] Skipping ${intro.id} - has ${messageCount} messages`);
          continue;
        }

        // Get profiles for all participants
        const { data: profiles } = await supabaseClient
          .from("profiles")
          .select("id, username")
          .in("id", [intro.introducer_id, intro.introduced_id, intro.recipient_id]);

        const introducerProfile = profiles?.find(p => p.id === intro.introducer_id);
        const introducedProfile = profiles?.find(p => p.id === intro.introduced_id);
        const recipientProfile = profiles?.find(p => p.id === intro.recipient_id);

        console.log(`[backfill-introductions] Processing introduction ${intro.id}: ${introducerProfile?.username} -> ${introducedProfile?.username} & ${recipientProfile?.username}`);

        // 1. Send push notification to introduced person
        try {
          await supabaseClient.functions.invoke("send-push-notification", {
            body: {
              userId: intro.introduced_id,
              title: "🔔 Lembrete: Você foi apresentado!",
              body: `${introducerProfile?.username || "Alguém"} te apresentou para ${recipientProfile?.username || "um fundador"}. Não esqueça de responder!`,
              type: "founder_introduction",
              url: "/messages",
            },
          });
          pushSent++;
          console.log(`[backfill-introductions] Push sent to introduced: ${intro.introduced_id}`);
        } catch (pushErr) {
          console.error(`[backfill-introductions] Error sending push to introduced:`, pushErr);
        }

        // 2. Send push notification to recipient
        try {
          await supabaseClient.functions.invoke("send-push-notification", {
            body: {
              userId: intro.recipient_id,
              title: "🔔 Lembrete: Nova apresentação!",
              body: `${introducerProfile?.username || "Alguém"} te apresentou ${introducedProfile?.username || "um fundador"}. Inicie a conversa!`,
              type: "founder_introduction",
              url: "/messages",
            },
          });
          pushSent++;
          console.log(`[backfill-introductions] Push sent to recipient: ${intro.recipient_id}`);
        } catch (pushErr) {
          console.error(`[backfill-introductions] Error sending push to recipient:`, pushErr);
        }

        // 3. Send reminder message in the group chat
        const reminderMessage = `🔔 **Lembrete automático**

Olá! Esta apresentação foi feita há alguns dias e ainda não houve resposta.

${introducedProfile?.username || "Fundador"} e ${recipientProfile?.username || "Fundador"}, não percam a oportunidade de se conectar!

💡 Basta responder aqui para iniciar a conversa. O primeiro passo é o mais difícil, mas vale a pena!`;

        const { error: msgError } = await supabaseClient
          .from("messages")
          .insert({
            group_conversation_id: intro.group_conversation_id,
            sender_id: ADMIN_USER_ID,
            content: reminderMessage,
          });

        if (msgError) {
          console.error(`[backfill-introductions] Error sending reminder message:`, msgError);
        } else {
          messagesSent++;
          console.log(`[backfill-introductions] Reminder message sent to group: ${intro.group_conversation_id}`);

          // Update group conversation last_message_at
          await supabaseClient
            .from("group_conversations")
            .update({ last_message_at: new Date().toISOString() })
            .eq("id", intro.group_conversation_id);
        }

        // 4. Send email notifications (existing logic)
        try {
          // Email to introduced
          await supabaseClient.functions.invoke("send-notification-email", {
            body: {
              userId: intro.introduced_id,
              type: "founder_introduction",
              title: `🤝 Lembrete: ${introducerProfile?.username || "Alguém"} te apresentou!`,
              message: `Você foi apresentado para ${recipientProfile?.username || "um fundador"}. Não esqueça de responder!`,
              senderName: introducerProfile?.username || "Um fundador",
              senderUsername: introducerProfile?.username || "fundador",
              introducedName: introducedProfile?.username,
              recipientName: recipientProfile?.username,
            },
          });
          emailsSent++;

          // Email to recipient
          await supabaseClient.functions.invoke("send-notification-email", {
            body: {
              userId: intro.recipient_id,
              type: "founder_introduction",
              title: `🤝 Lembrete: ${introducerProfile?.username || "Alguém"} te apresentou alguém!`,
              message: `${introducerProfile?.username || "Alguém"} te apresentou ${introducedProfile?.username || "um fundador"}. Inicie a conversa!`,
              senderName: introducerProfile?.username || "Um fundador",
              senderUsername: introducerProfile?.username || "fundador",
              introducedName: introducedProfile?.username,
              recipientName: recipientProfile?.username,
            },
          });
          emailsSent++;
        } catch (emailErr) {
          console.error(`[backfill-introductions] Error sending emails:`, emailErr);
        }

        // 5. Update notifications sent_push flag
        await supabaseClient
          .from("notifications")
          .update({ sent_push: true, sent_email: true })
          .eq("type", "founder_introduction")
          .in("user_id", [intro.introduced_id, intro.recipient_id]);

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 600));
      } catch (err) {
        console.error(`[backfill-introductions] Error processing introduction ${intro.id}:`, err);
        errorCount++;
      }
    }

    console.log(`[backfill-introductions] Completed: ${emailsSent} emails, ${pushSent} push, ${messagesSent} messages, ${errorCount} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        total: introductions.length,
        emailsSent,
        pushSent,
        messagesSent,
        errors: errorCount,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("[backfill-introductions] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
