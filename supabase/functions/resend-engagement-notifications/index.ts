import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const results = {
      unreadMessages: { notified: 0, skipped: 0 },
      pendingMatches: { notified: 0, skipped: 0 },
      errors: [] as string[],
    };

    // 1. Find users with unread messages (last 7 days)
    console.log("Finding users with unread messages...");
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get unread direct messages
    const { data: unreadDirectMessages } = await supabase
      .from("messages")
      .select(`
        id,
        sender_id,
        created_at,
        conversation:conversations!messages_conversation_id_fkey (
          id,
          participant_1,
          participant_2
        )
      `)
      .is("read_at", null)
      .not("conversation_id", "is", null)
      .gte("created_at", sevenDaysAgo.toISOString())
      .order("created_at", { ascending: false });

    // Get unread group messages  
    const { data: unreadGroupMessages } = await supabase
      .from("messages")
      .select(`
        id,
        sender_id,
        created_at,
        group_conversation_id
      `)
      .is("read_at", null)
      .not("group_conversation_id", "is", null)
      .gte("created_at", sevenDaysAgo.toISOString())
      .order("created_at", { ascending: false });

    // Build map of users with unread messages
    const usersWithUnread = new Map<string, { count: number; senderIds: Set<string> }>();

    // Process direct messages
    for (const msg of unreadDirectMessages || []) {
      const conv = msg.conversation as unknown as { id: string; participant_1: string; participant_2: string } | null;
      if (!conv) continue;
      
      const recipientId = conv.participant_1 === msg.sender_id 
        ? conv.participant_2 
        : conv.participant_1;
      
      if (recipientId === msg.sender_id) continue; // Skip self
      
      if (!usersWithUnread.has(recipientId)) {
        usersWithUnread.set(recipientId, { count: 0, senderIds: new Set() });
      }
      const data = usersWithUnread.get(recipientId)!;
      data.count++;
      data.senderIds.add(msg.sender_id);
    }

    // Process group messages
    for (const msg of unreadGroupMessages || []) {
      const { data: members } = await supabase
        .from("group_conversation_members")
        .select("user_id")
        .eq("conversation_id", msg.group_conversation_id)
        .neq("user_id", msg.sender_id);

      for (const member of members || []) {
        if (!usersWithUnread.has(member.user_id)) {
          usersWithUnread.set(member.user_id, { count: 0, senderIds: new Set() });
        }
        const data = usersWithUnread.get(member.user_id)!;
        data.count++;
        data.senderIds.add(msg.sender_id);
      }
    }

    console.log(`Found ${usersWithUnread.size} users with unread messages`);

    // Send notifications for unread messages
    for (const [userId, data] of usersWithUnread) {
      // Check if user already has a recent unread_messages notification (last 24h)
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      const { data: existingNotif } = await supabase
        .from("notifications")
        .select("id")
        .eq("user_id", userId)
        .eq("type", "unread_messages_reminder")
        .gte("created_at", oneDayAgo.toISOString())
        .maybeSingle();

      if (existingNotif) {
        results.unreadMessages.skipped++;
        continue;
      }

      // Get first sender profile for the notification
      const firstSenderId = Array.from(data.senderIds)[0];
      const { data: senderProfile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", firstSenderId)
        .maybeSingle();

      const otherCount = data.senderIds.size - 1;
      const title = data.count === 1 
        ? "Nova mensagem não lida"
        : `${data.count} mensagens não lidas`;
      
      const message = otherCount > 0
        ? `Você tem mensagens de ${senderProfile?.username || "alguém"} e mais ${otherCount} pessoa(s)`
        : `Você tem mensagens de ${senderProfile?.username || "alguém"}`;

      const { error: notifError } = await supabase
        .from("notifications")
        .insert({
          user_id: userId,
          type: "unread_messages_reminder",
          title,
          message,
          action_url: "/messages",
          related_user_id: firstSenderId,
        });

      if (notifError) {
        results.errors.push(`Notification error for ${userId}: ${notifError.message}`);
      } else {
        results.unreadMessages.notified++;
      }
    }

    // 2. Find pending matches (sent but not responded)
    console.log("Finding pending matches...");

    const { data: pendingMatches } = await supabase
      .from("matches")
      .select(`
        id,
        requester_id,
        target_id,
        created_at,
        requester:profiles!matches_requester_id_fkey (username),
        target:profiles!matches_target_id_fkey (username)
      `)
      .eq("status", "PENDING")
      .gte("created_at", sevenDaysAgo.toISOString());

    console.log(`Found ${pendingMatches?.length || 0} pending matches`);

    // Group by target (person who needs to respond)
    const pendingByTarget = new Map<string, { count: number; requesters: string[] }>();

    for (const match of pendingMatches || []) {
      if (!pendingByTarget.has(match.target_id)) {
        pendingByTarget.set(match.target_id, { count: 0, requesters: [] });
      }
      const data = pendingByTarget.get(match.target_id)!;
      data.count++;
      data.requesters.push((match.requester as any)?.username || "Alguém");
    }

    // Send notifications for pending matches
    for (const [targetId, data] of pendingByTarget) {
      // Check if user already has a recent pending_match notification (last 24h)
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      const { data: existingNotif } = await supabase
        .from("notifications")
        .select("id")
        .eq("user_id", targetId)
        .eq("type", "pending_match_reminder")
        .gte("created_at", oneDayAgo.toISOString())
        .maybeSingle();

      if (existingNotif) {
        results.pendingMatches.skipped++;
        continue;
      }

      const title = data.count === 1
        ? "Match pendente aguardando resposta"
        : `${data.count} matches pendentes`;

      const requesterNames = data.requesters.slice(0, 3).join(", ");
      const message = data.count > 3
        ? `${requesterNames} e mais ${data.count - 3} pessoa(s) querem conectar com você`
        : `${requesterNames} quer conectar com você`;

      const { error: notifError } = await supabase
        .from("notifications")
        .insert({
          user_id: targetId,
          type: "pending_match_reminder",
          title,
          message,
          action_url: "/matches",
        });

      if (notifError) {
        results.errors.push(`Pending match notification error for ${targetId}: ${notifError.message}`);
      } else {
        results.pendingMatches.notified++;
      }
    }

    console.log("Results:", results);

    return new Response(
      JSON.stringify({
        success: true,
        results,
        summary: {
          unreadMessagesNotified: results.unreadMessages.notified,
          unreadMessagesSkipped: results.unreadMessages.skipped,
          pendingMatchesNotified: results.pendingMatches.notified,
          pendingMatchesSkipped: results.pendingMatches.skipped,
          totalErrors: results.errors.length,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});