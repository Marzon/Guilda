import { createClient } from "npm:@supabase/supabase-js@2";
import { hoursAgo, logWithSaoPauloTime } from "../_shared/timezone.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    logWithSaoPauloTime("send-daily-pending-push", "Starting daily pending match push notifications...");

    // Get matches that are pending for more than 24 hours
    const twentyFourHoursAgo = hoursAgo(24).toISOString();

    const { data: pendingMatches, error: matchesError } = await supabase
      .from("matches")
      .select(`
        id,
        target_id,
        requester_id,
        created_at,
        requester:profiles!matches_requester_id_fkey(username)
      `)
      .eq("status", "PENDING")
      .lt("created_at", twentyFourHoursAgo);

    if (matchesError) {
      console.error("[send-daily-pending-push] Error fetching matches:", matchesError);
      throw matchesError;
    }

    if (!pendingMatches || pendingMatches.length === 0) {
      console.log("[send-daily-pending-push] No pending matches older than 24h found");
      return new Response(
        JSON.stringify({ success: true, message: "No pending matches to notify", sent: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[send-daily-pending-push] Found ${pendingMatches.length} pending matches`);

    // Group by target_id (recipient of the pending invites)
    const groupedByTarget: Record<string, { count: number; firstRequester: string }> = {};
    
    for (const match of pendingMatches) {
      const targetId = match.target_id;
      const requesterName = (match.requester as any)?.username || "Alguém";
      
      if (!groupedByTarget[targetId]) {
        groupedByTarget[targetId] = { count: 0, firstRequester: requesterName };
      }
      groupedByTarget[targetId].count++;
    }

    console.log(`[send-daily-pending-push] Grouped into ${Object.keys(groupedByTarget).length} users`);

    // Check email preferences and send push notifications
    let sentCount = 0;
    const targetIds = Object.keys(groupedByTarget);

    for (const targetId of targetIds) {
      // Check if user wants pending match reminders
      const { data: prefs } = await supabase
        .from("email_preferences")
        .select("pending_match_reminder")
        .eq("user_id", targetId)
        .single();

      if (prefs?.pending_match_reminder === false) {
        console.log(`[send-daily-pending-push] User ${targetId} has disabled pending match reminders`);
        continue;
      }

      const { count, firstRequester } = groupedByTarget[targetId];
      
      const title = count === 1 
        ? `🔔 ${firstRequester} quer se conectar!`
        : `🔔 Você tem ${count} convites esperando!`;
      
      const body = count === 1
        ? "Responda agora para não perder essa conexão"
        : `${firstRequester} e outros querem se conectar. Não perca!`;

      try {
        const { error: pushError } = await supabase.functions.invoke("send-push-notification", {
          body: {
            userId: targetId,
            title,
            body,
            type: "pending_match_reminder",
            url: "/tavern",
          },
        });

        if (pushError) {
          console.error(`[send-daily-pending-push] Error sending push to ${targetId}:`, pushError);
        } else {
          console.log(`[send-daily-pending-push] Sent push to ${targetId}`);
          sentCount++;
        }

        // Rate limiting - 600ms between pushes
        await new Promise((resolve) => setTimeout(resolve, 600));
      } catch (error) {
        console.error(`[send-daily-pending-push] Error invoking push function for ${targetId}:`, error);
      }
    }

    console.log(`[send-daily-pending-push] Completed. Sent ${sentCount} push notifications`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Sent ${sentCount} push notifications`,
        sent: sentCount,
        total: targetIds.length
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[send-daily-pending-push] Error:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});