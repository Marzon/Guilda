import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { APP_URL, EMAIL_URLS, ROUTES } from "../_shared/constants.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface HighlightedProject {
  id: string;
  title: string;
  description: string | null;
  status: string | null;
  cover_image_url: string | null;
  owner: {
    username: string;
    avatar_url: string | null;
    archetype: string;
  } | null;
  open_roles_count: number;
}

interface BroadcastRequest {
  title: string;
  message: string;
  type: string;
  target_audience: string;
  send_email: boolean;
  send_push: boolean;
  scheduled_at?: string | null;
  highlighted_project_id?: string | null;
  cohort_id?: string | null;
  member_status?: string | null;
}

interface ProfileRow {
  id: string;
  username: string;
  bio: string | null;
  avatar_url: string | null;
  archetype: string;
  created_at: string;
  last_seen_at: string | null;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });

    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden: Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { title, message, type, target_audience, send_email, send_push, scheduled_at, highlighted_project_id, cohort_id, member_status }: BroadcastRequest = await req.json();

    console.log(`[send-admin-broadcast] Request received:`, {
      title,
      target_audience,
      send_email,
      send_push,
      scheduled_at,
      highlighted_project_id,
      cohort_id,
      member_status,
    });

    // Handle scheduled broadcasts
    if (scheduled_at && scheduled_at !== null && scheduled_at !== "null") {
      const { data: broadcast, error: broadcastError } = await supabase
        .from("admin_broadcasts")
        .insert({
          title,
          message,
          type,
          target_audience,
          sent_by: user.id,
          status: "scheduled",
          scheduled_at,
        })
        .select()
        .single();

      if (broadcastError) throw broadcastError;

      console.log(`[send-admin-broadcast] Broadcast scheduled for ${scheduled_at}`);

      return new Response(
        JSON.stringify({
          success: true,
          broadcast_id: broadcast.id,
          scheduled_at,
          status: "scheduled",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Build query for target audience
    let usersQuery = supabase.from("profiles").select("id, username, bio, avatar_url, archetype, created_at, last_seen_at");
    
    if (target_audience === "builders") {
      usersQuery = usersQuery.eq("archetype", "BUILDER");
    } else if (target_audience === "sellers") {
      usersQuery = usersQuery.eq("archetype", "SELLER");
    }

    const { data: profiles, error: profilesError } = await usersQuery;
    if (profilesError) throw profilesError;

    const typedProfiles = (profiles || []) as ProfileRow[];
    let targetUserIds = typedProfiles.map((p: ProfileRow) => p.id);
    const now = new Date();

    // Handle cohort targeting
    if (target_audience === "cohort" && cohort_id) {
      let cohortQuery = supabase
        .from("subscriptions")
        .select("user_id")
        .eq("cohort_id", cohort_id);
      
      // Filter by member status if specified
      if (member_status) {
        cohortQuery = cohortQuery.eq("member_status", member_status);
      }
      
      const { data: cohortSubs } = await cohortQuery;
      
      const cohortUserIds = new Set((cohortSubs || []).map((s: { user_id: string }) => s.user_id));
      targetUserIds = targetUserIds.filter((id: string) => cohortUserIds.has(id));
      console.log(`[send-admin-broadcast] Filtered to cohort ${cohort_id}${member_status ? ` with status ${member_status}` : ''}: ${targetUserIds.length} users`);
    }

    if (target_audience === "founders" || target_audience === "free") {
      const { data: subs } = await supabase.from("subscriptions").select("user_id, tier");
      const founderIds = new Set((subs || []).filter((s: { tier: string }) => s.tier === "FOUNDER").map((s: { user_id: string }) => s.user_id));
      
      if (target_audience === "founders") {
        targetUserIds = targetUserIds.filter((id: string) => founderIds.has(id));
      } else if (target_audience === "free") {
        targetUserIds = targetUserIds.filter((id: string) => !founderIds.has(id));
      }
    }

    if (target_audience === "inactive7") {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const inactiveProfiles = typedProfiles.filter((p: ProfileRow) => p.last_seen_at && new Date(p.last_seen_at) < sevenDaysAgo);
      targetUserIds = inactiveProfiles.map((p: ProfileRow) => p.id);
    } else if (target_audience === "inactive30") {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const inactiveProfiles = typedProfiles.filter((p: ProfileRow) => p.last_seen_at && new Date(p.last_seen_at) < thirtyDaysAgo);
      targetUserIds = inactiveProfiles.map((p: ProfileRow) => p.id);
    }

    if (target_audience === "pushEnabled") {
      const { data: pushSubs } = await supabase.from("push_subscriptions").select("user_id");
      const pushUserIds = new Set((pushSubs || []).map((p: { user_id: string }) => p.user_id));
      targetUserIds = targetUserIds.filter((id: string) => pushUserIds.has(id));
    }

    if (target_audience === "newUsers") {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const newProfiles = typedProfiles.filter((p: ProfileRow) => new Date(p.created_at) >= sevenDaysAgo);
      targetUserIds = newProfiles.map((p: ProfileRow) => p.id);
    }

    if (target_audience === "profileComplete") {
      const completeProfiles = typedProfiles.filter((p: ProfileRow) => p.bio && p.avatar_url);
      targetUserIds = completeProfiles.map((p: ProfileRow) => p.id);
    } else if (target_audience === "profileIncomplete") {
      const incompleteProfiles = typedProfiles.filter((p: ProfileRow) => !p.bio || !p.avatar_url);
      targetUserIds = incompleteProfiles.map((p: ProfileRow) => p.id);
    }

    // Handle project-based targeting - ALWAYS execute this before final count
    console.log(`[send-admin-broadcast] Checking project filter for target_audience="${target_audience}"`);
    if (target_audience === "hasProject" || target_audience === "noProject") {
      console.log(`[send-admin-broadcast] Fetching project owners...`);
      const { data: projectOwners, error: projectError } = await supabase
        .from("projects")
        .select("owner_id");
      
      if (projectError) {
        console.error(`[send-admin-broadcast] Error fetching projects:`, projectError);
      }
      
      console.log(`[send-admin-broadcast] Found ${projectOwners?.length || 0} projects`);
      const ownerIds = new Set((projectOwners || []).map((p: { owner_id: string }) => p.owner_id));
      console.log(`[send-admin-broadcast] Unique project owners: ${ownerIds.size}`);
      
      const beforeCount = targetUserIds.length;
      if (target_audience === "hasProject") {
        targetUserIds = targetUserIds.filter((id: string) => ownerIds.has(id));
      } else if (target_audience === "noProject") {
        targetUserIds = targetUserIds.filter((id: string) => !ownerIds.has(id));
      }
      
      console.log(`[send-admin-broadcast] Filtered by project ownership (${target_audience}): ${beforeCount} -> ${targetUserIds.length} users`);
    }

    console.log(`[send-admin-broadcast] Target users: ${targetUserIds.length}`);

    // Create broadcast record
    const { data: broadcast, error: broadcastError } = await supabase
      .from("admin_broadcasts")
      .insert({
        title,
        message,
        type,
        target_audience,
        sent_by: user.id,
        status: send_email ? "queued" : "sent",
        recipients_count: targetUserIds.length,
        emails_sent: 0,
      })
      .select()
      .single();

    if (broadcastError) throw broadcastError;

    // Create notifications (fast operation)
    const notifications = targetUserIds.map((userId: string) => ({
      user_id: userId,
      type: `admin_${type}`,
      title,
      message,
      sent_push: send_push,
    }));

    if (notifications.length > 0) {
      await supabase.from("notifications").insert(notifications);
      console.log(`[send-admin-broadcast] Created ${notifications.length} notifications`);
    }

    // Queue emails for background processing
    if (send_email && targetUserIds.length > 0) {
      // Fetch user emails
      const emailQueue: { broadcast_id: string; user_id: string; email: string }[] = [];
      
      // Process in batches to avoid memory issues
      const FETCH_BATCH_SIZE = 100;
      for (let i = 0; i < targetUserIds.length; i += FETCH_BATCH_SIZE) {
        const batch = targetUserIds.slice(i, i + FETCH_BATCH_SIZE);
        
        for (const userId of batch) {
          try {
            const { data: userData } = await supabase.auth.admin.getUserById(userId);
            if (userData?.user?.email) {
              emailQueue.push({
                broadcast_id: broadcast.id,
                user_id: userId,
                email: userData.user.email,
              });
            }
          } catch (e) {
            console.error(`[send-admin-broadcast] Failed to get email for ${userId}:`, e);
          }
        }
      }

      // Insert all emails into queue
      if (emailQueue.length > 0) {
        const { error: queueError } = await supabase
          .from("broadcast_email_queue")
          .insert(emailQueue);

        if (queueError) {
          console.error(`[send-admin-broadcast] Failed to queue emails:`, queueError);
        } else {
          console.log(`[send-admin-broadcast] Queued ${emailQueue.length} emails for processing`);
        }
      }

      // Trigger first batch processing immediately
      try {
        const processResponse = await fetch(`${supabaseUrl}/functions/v1/process-broadcast-queue`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${supabaseServiceKey}`,
          },
        });
        console.log(`[send-admin-broadcast] Triggered queue processing: ${processResponse.status}`);
      } catch (e) {
        console.error(`[send-admin-broadcast] Failed to trigger queue processing:`, e);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        broadcast_id: broadcast.id,
        recipients_count: targetUserIds.length,
        status: send_email ? "queued" : "sent",
        message: send_email 
          ? `${targetUserIds.length} emails enfileirados para envio. Acompanhe o progresso no painel.`
          : "Broadcast criado (apenas notificações).",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[send-admin-broadcast] Error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
