import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { getCurrentSaoPauloDate, logWithSaoPauloTime } from "../_shared/timezone.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    logWithSaoPauloTime("process-scheduled-broadcasts", "v5 - Using São Paulo timezone - Function invoked");
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    logWithSaoPauloTime("process-scheduled-broadcasts", "Checking for pending broadcasts...");

    // Compare against current time (broadcasts are scheduled in São Paulo time but stored as UTC)
    const { data: pendingBroadcasts, error: fetchError } = await supabase
      .from("admin_broadcasts")
      .select("*")
      .eq("status", "scheduled")
      .lte("scheduled_at", new Date().toISOString());

    if (fetchError) throw fetchError;

    if (!pendingBroadcasts || pendingBroadcasts.length === 0) {
      logWithSaoPauloTime("process-scheduled-broadcasts", "No pending broadcasts found");
      return new Response(
        JSON.stringify({ success: true, processed: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logWithSaoPauloTime("process-scheduled-broadcasts", `Found ${pendingBroadcasts.length} pending broadcast(s)`);

    let totalProcessed = 0;

    for (const broadcast of pendingBroadcasts) {
      logWithSaoPauloTime("process-scheduled-broadcasts", `Processing broadcast: ${broadcast.id} - ${broadcast.title}`);

      // Mark as queued immediately
      await supabase
        .from("admin_broadcasts")
        .update({ status: "queued" })
        .eq("id", broadcast.id);

      // Get target users based on audience
      let usersQuery = supabase.from("profiles").select("id, username, bio, avatar_url, archetype, created_at, last_seen_at");
      
      const target_audience = broadcast.target_audience;
      
      if (target_audience === "builders") {
        usersQuery = usersQuery.eq("archetype", "BUILDER");
      } else if (target_audience === "sellers") {
        usersQuery = usersQuery.eq("archetype", "SELLER");
      }

      const { data: profiles, error: profilesError } = await usersQuery;
      if (profilesError) throw profilesError;

      let targetUserIds = profiles?.map(p => p.id) || [];
      const now = new Date();

      if (target_audience === "founders" || target_audience === "free") {
        const { data: subs } = await supabase.from("subscriptions").select("user_id, tier");
        const founderIds = new Set((subs || []).filter(s => s.tier === "FOUNDER").map(s => s.user_id));
        
        if (target_audience === "founders") {
          targetUserIds = targetUserIds.filter(id => founderIds.has(id));
        } else if (target_audience === "free") {
          targetUserIds = targetUserIds.filter(id => !founderIds.has(id));
        }
      }

      if (target_audience === "inactive7") {
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const inactiveProfiles = profiles?.filter(p => p.last_seen_at && new Date(p.last_seen_at) < sevenDaysAgo) || [];
        targetUserIds = inactiveProfiles.map(p => p.id);
      } else if (target_audience === "inactive30") {
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const inactiveProfiles = profiles?.filter(p => p.last_seen_at && new Date(p.last_seen_at) < thirtyDaysAgo) || [];
        targetUserIds = inactiveProfiles.map(p => p.id);
      }

      if (target_audience === "pushEnabled") {
        const { data: pushSubs } = await supabase.from("push_subscriptions").select("user_id");
        const pushUserIds = new Set((pushSubs || []).map(p => p.user_id));
        targetUserIds = targetUserIds.filter(id => pushUserIds.has(id));
      }

      if (target_audience === "newUsers") {
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const newProfiles = profiles?.filter(p => new Date(p.created_at) >= sevenDaysAgo) || [];
        targetUserIds = newProfiles.map(p => p.id);
      }

      if (target_audience === "profileComplete") {
        const completeProfiles = profiles?.filter(p => p.bio && p.avatar_url) || [];
        targetUserIds = completeProfiles.map(p => p.id);
      } else if (target_audience === "profileIncomplete") {
        const incompleteProfiles = profiles?.filter(p => !p.bio || !p.avatar_url) || [];
        targetUserIds = incompleteProfiles.map(p => p.id);
      }

      // Handle project-based targeting
      if (target_audience === "hasProject" || target_audience === "noProject") {
        const { data: projectOwners } = await supabase
          .from("projects")
          .select("owner_id");
        
        const ownerIds = new Set((projectOwners || []).map(p => p.owner_id));
        
        if (target_audience === "hasProject") {
          targetUserIds = targetUserIds.filter(id => ownerIds.has(id));
        } else {
          targetUserIds = targetUserIds.filter(id => !ownerIds.has(id));
        }
        
        logWithSaoPauloTime("process-scheduled-broadcasts", `Filtered by project ownership (${target_audience}): ${targetUserIds.length} users`);
      }

      logWithSaoPauloTime("process-scheduled-broadcasts", `Target users: ${targetUserIds.length}`);

      // Create notifications
      const notifications = targetUserIds.map(userId => ({
        user_id: userId,
        type: `admin_${broadcast.type}`,
        title: broadcast.title,
        message: broadcast.message,
      }));

      if (notifications.length > 0) {
        await supabase.from("notifications").insert(notifications);
        logWithSaoPauloTime("process-scheduled-broadcasts", `Created ${notifications.length} notifications`);
      }

      // Get emails for users and queue them
      const emailQueueItems: { broadcast_id: string; user_id: string; email: string }[] = [];
      
      for (const userId of targetUserIds) {
        try {
          const { data: userData } = await supabase.auth.admin.getUserById(userId);
          
          if (userData?.user?.email) {
            emailQueueItems.push({
              broadcast_id: broadcast.id,
              user_id: userId,
              email: userData.user.email,
            });
          }
        } catch (err) {
          logWithSaoPauloTime("process-scheduled-broadcasts", `Failed to get email for user ${userId}: ${err}`);
        }
      }

      // Insert into queue in batches
      if (emailQueueItems.length > 0) {
        const batchSize = 100;
        for (let i = 0; i < emailQueueItems.length; i += batchSize) {
          const batch = emailQueueItems.slice(i, i + batchSize);
          const { error: queueError } = await supabase
            .from("broadcast_email_queue")
            .insert(batch);
          
          if (queueError) {
            logWithSaoPauloTime("process-scheduled-broadcasts", `Queue insert error: ${queueError.message}`);
          }
        }
        logWithSaoPauloTime("process-scheduled-broadcasts", `Queued ${emailQueueItems.length} emails for processing`);
      }

      // Update broadcast with recipient count
      await supabase
        .from("admin_broadcasts")
        .update({
          recipients_count: targetUserIds.length,
        })
        .eq("id", broadcast.id);

      logWithSaoPauloTime("process-scheduled-broadcasts", `Broadcast ${broadcast.id} queued: ${targetUserIds.length} recipients`);
      totalProcessed++;
    }

    // Trigger the queue processor to start sending immediately
    try {
      const processResponse = await fetch(`${supabaseUrl}/functions/v1/process-broadcast-queue`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({}),
      });
      logWithSaoPauloTime("process-scheduled-broadcasts", `Triggered queue processing: ${processResponse.status}`);
    } catch (triggerError) {
      logWithSaoPauloTime("process-scheduled-broadcasts", `Failed to trigger queue processing: ${triggerError}`);
    }

    return new Response(
      JSON.stringify({ success: true, processed: totalProcessed }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logWithSaoPauloTime("process-scheduled-broadcasts", `Error: ${errorMessage}`);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
