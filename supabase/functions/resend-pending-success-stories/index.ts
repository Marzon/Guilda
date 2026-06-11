import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { requireAdmin } from "../_shared/admin.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  dry_run?: boolean;
  send_email?: boolean;
  story_ids?: string[];
  min_days_without_response?: number; // Minimum days since last follow-up (default: 2)
}

// Generate secure random token
function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    
    // Require service role key for this admin function
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    
    // Only allow service role or admin user
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const isServiceRole = token === supabaseServiceKey;
    
    if (!isServiceRole) {
      // Check if user is admin
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      if (authError || !user) {
        return new Response(
          JSON.stringify({ error: "Unauthorized" }),
          { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      
      // Use requireAdmin for robust admin verification via RPC
      const adminCheck = await requireAdmin(supabase, user.id, corsHeaders);
      if (adminCheck) return adminCheck;
    }

    const body: RequestBody = await req.json().catch(() => ({}));
    const { dry_run = false, send_email = true, story_ids, min_days_without_response = 2 } = body;

    console.log("[resend-pending-success-stories] Starting with options:", { 
      dry_run, 
      send_email, 
      story_ids,
      min_days_without_response 
    });

    // Calculate the cutoff date for follow-up filtering
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - min_days_without_response);
    const cutoffISO = cutoffDate.toISOString();

    // Build query for pending stories
    let query = supabase
      .from("success_stories")
      .select(`
        id,
        founder_1_id,
        founder_2_id,
        status,
        confirmation_token_1,
        confirmation_token_2,
        confirmed_by_founder_1,
        confirmed_by_founder_2,
        follow_up_sent_at,
        founder_1:profiles!success_stories_founder_1_id_fkey(id, username, avatar_url),
        founder_2:profiles!success_stories_founder_2_id_fkey(id, username, avatar_url),
        project:projects(id, title)
      `)
      .in("status", ["pending", "partial"]);

    // Filter by specific story IDs if provided
    if (story_ids && story_ids.length > 0) {
      query = query.in("id", story_ids);
    } else {
      // For cron: only get stories that haven't been notified recently
      // follow_up_sent_at is null OR follow_up_sent_at < cutoff date
      query = query.or(`follow_up_sent_at.is.null,follow_up_sent_at.lt.${cutoffISO}`);
    }

    const { data: stories, error: fetchError } = await query;

    if (fetchError) {
      console.error("[resend-pending-success-stories] Error fetching stories:", fetchError);
      return new Response(
        JSON.stringify({ error: fetchError.message }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`[resend-pending-success-stories] Found ${stories?.length || 0} pending stories`);

    const results = {
      processed: 0,
      tokens_generated: 0,
      notifications_sent: {
        founder_1: 0,
        founder_2: 0,
      },
      errors: [] as string[],
      stories: [] as any[],
    };

    for (const story of stories || []) {
      const storyResult = {
        id: story.id,
        tokens_generated: false,
        founder_1_notified: false,
        founder_2_notified: false,
      };

      try {
        let token1 = story.confirmation_token_1;
        let token2 = story.confirmation_token_2;

        // Generate tokens if missing
        if (!token1 || !token2) {
          token1 = token1 || generateToken();
          token2 = token2 || generateToken();

          if (!dry_run) {
            const { error: updateError } = await supabase
              .from("success_stories")
              .update({
                confirmation_token_1: token1,
                confirmation_token_2: token2,
              })
              .eq("id", story.id);

            if (updateError) {
              console.error(`[resend-pending-success-stories] Error updating tokens for ${story.id}:`, updateError);
              results.errors.push(`Failed to update tokens for ${story.id}: ${updateError.message}`);
              continue;
            }
          }

          storyResult.tokens_generated = true;
          results.tokens_generated++;
          console.log(`[resend-pending-success-stories] ${dry_run ? "[DRY RUN] Would generate" : "Generated"} tokens for story ${story.id}`);
        }

        const founder1 = story.founder_1 as any;
        const founder2 = story.founder_2 as any;
        const project = story.project as any;

        // Notify founder_1 if they haven't confirmed
        if (!story.confirmed_by_founder_1 && founder1 && founder2) {
          const title = "🏆 Confirme sua história de sucesso!";
          const message = project?.title 
            ? `Você e @${founder2.username} formaram uma parceria incrível no projeto "${project.title}"! Confirme sua história de sucesso.`
            : `Você e @${founder2.username} formaram uma parceria incrível! Confirme sua história de sucesso.`;
          const actionUrl = `/success-confirm?token=${token1}`;

          if (!dry_run) {
            try {
              const { error: notifError } = await supabase.functions.invoke("create-notification", {
                body: {
                  userId: story.founder_1_id,
                  type: "success_story",
                  title,
                  message,
                  relatedUserId: story.founder_2_id,
                  actionUrl,
                  sendEmail: send_email,
                },
              });

              if (notifError) {
                console.error(`[resend-pending-success-stories] Error notifying founder_1:`, notifError);
                results.errors.push(`Failed to notify founder_1 (${story.founder_1_id}): ${notifError.message}`);
              } else {
                storyResult.founder_1_notified = true;
                results.notifications_sent.founder_1++;
                console.log(`[resend-pending-success-stories] Notified founder_1: ${founder1.username}`);
              }
            } catch (e: unknown) {
              const errMsg = e instanceof Error ? e.message : String(e);
              console.error(`[resend-pending-success-stories] Exception notifying founder_1:`, e);
              results.errors.push(`Exception notifying founder_1: ${errMsg}`);
            }
          } else {
            storyResult.founder_1_notified = true;
            results.notifications_sent.founder_1++;
            console.log(`[resend-pending-success-stories] [DRY RUN] Would notify founder_1: ${founder1.username}`);
          }
        }

        // Notify founder_2 if they haven't confirmed
        if (!story.confirmed_by_founder_2 && founder1 && founder2) {
          const title = "🏆 Confirme sua história de sucesso!";
          const message = project?.title 
            ? `Você e @${founder1.username} formaram uma parceria incrível no projeto "${project.title}"! Confirme sua história de sucesso.`
            : `Você e @${founder1.username} formaram uma parceria incrível! Confirme sua história de sucesso.`;
          const actionUrl = `/success-confirm?token=${token2}`;

          if (!dry_run) {
            try {
              const { error: notifError } = await supabase.functions.invoke("create-notification", {
                body: {
                  userId: story.founder_2_id,
                  type: "success_story",
                  title,
                  message,
                  relatedUserId: story.founder_1_id,
                  actionUrl,
                  sendEmail: send_email,
                },
              });

              if (notifError) {
                console.error(`[resend-pending-success-stories] Error notifying founder_2:`, notifError);
                results.errors.push(`Failed to notify founder_2 (${story.founder_2_id}): ${notifError.message}`);
              } else {
                storyResult.founder_2_notified = true;
                results.notifications_sent.founder_2++;
                console.log(`[resend-pending-success-stories] Notified founder_2: ${founder2.username}`);
              }
            } catch (e: unknown) {
              const errMsg = e instanceof Error ? e.message : String(e);
              console.error(`[resend-pending-success-stories] Exception notifying founder_2:`, e);
              results.errors.push(`Exception notifying founder_2: ${errMsg}`);
            }
          } else {
            storyResult.founder_2_notified = true;
            results.notifications_sent.founder_2++;
            console.log(`[resend-pending-success-stories] [DRY RUN] Would notify founder_2: ${founder2.username}`);
          }
        }

        // Update follow_up_sent_at after successful notifications
        if (!dry_run && (storyResult.founder_1_notified || storyResult.founder_2_notified)) {
          const { error: updateFollowUpError } = await supabase
            .from("success_stories")
            .update({ follow_up_sent_at: new Date().toISOString() })
            .eq("id", story.id);

          if (updateFollowUpError) {
            console.error(`[resend-pending-success-stories] Error updating follow_up_sent_at for ${story.id}:`, updateFollowUpError);
            results.errors.push(`Failed to update follow_up_sent_at for ${story.id}: ${updateFollowUpError.message}`);
          } else {
            console.log(`[resend-pending-success-stories] Updated follow_up_sent_at for story ${story.id}`);
          }
        }

        results.stories.push(storyResult);
        results.processed++;

      } catch (storyError: unknown) {
        const errMsg = storyError instanceof Error ? storyError.message : String(storyError);
        console.error(`[resend-pending-success-stories] Error processing story ${story.id}:`, storyError);
        results.errors.push(`Error processing story ${story.id}: ${errMsg}`);
      }
    }

    console.log("[resend-pending-success-stories] Completed:", results);

    return new Response(
      JSON.stringify({
        success: true,
        dry_run,
        ...results,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("[resend-pending-success-stories] Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: errMsg }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
