import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getTodayInSaoPaulo, hoursSinceInSaoPaulo, logWithSaoPauloTime } from "../_shared/timezone.ts";
import { ADMIN_USER_ID } from "../_shared/admin.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    logWithSaoPauloTime("send-daily-acceleration-reminders", "Starting daily acceleration reminders job...");
    
    // Get all active founders
    const { data: activeFounders, error: foundersError } = await supabase
      .from("acceleration_user_progress")
      .select(`
        user_id,
        cohort_id,
        current_day,
        last_activity_at
      `)
      .eq("status", "ACTIVE");

    if (foundersError) {
      logWithSaoPauloTime("send-daily-acceleration-reminders", `Error fetching active founders: ${foundersError.message}`);
      throw foundersError;
    }

    if (!activeFounders || activeFounders.length === 0) {
      logWithSaoPauloTime("send-daily-acceleration-reminders", "No active founders found, skipping reminders");
      return new Response(
        JSON.stringify({ success: true, reminders_sent: 0, reason: "no_active_founders" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logWithSaoPauloTime("send-daily-acceleration-reminders", `Found ${activeFounders.length} active founders`);

    // Use São Paulo timezone for "today"
    const today = getTodayInSaoPaulo();
    let remindersSent = 0;
    let skipped = 0;

    for (const founder of activeFounders) {
      try {
        // Check for prolonged silence (> 24h) and create trap alert
        // Use São Paulo timezone for hour calculations
        const hoursSinceActivity = hoursSinceInSaoPaulo(founder.last_activity_at);

        if (hoursSinceActivity > 24) {
          logWithSaoPauloTime("send-daily-acceleration-reminders", `User ${founder.user_id} has been silent for ${Math.round(hoursSinceActivity)}h - creating silence alert`);
          
          // Check if we already have an unresolved silence alert
          const { data: existingAlert } = await supabase
            .from("founder_trap_alerts")
            .select("id")
            .eq("user_id", founder.user_id)
            .eq("cohort_id", founder.cohort_id)
            .eq("trap_type", "SILENCE_ALERT")
            .eq("resolved", false)
            .limit(1);

          if (!existingAlert || existingAlert.length === 0) {
            // Create new silence alert
            await supabase.from("founder_trap_alerts").insert({
              user_id: founder.user_id,
              cohort_id: founder.cohort_id,
              trap_type: "SILENCE_ALERT",
              severity: hoursSinceActivity > 48 ? "critical" : "warning",
              trigger_data: { 
                hours_silent: Math.round(hoursSinceActivity),
                last_activity: founder.last_activity_at 
              }
            });
            logWithSaoPauloTime("send-daily-acceleration-reminders", `Silence alert created for user ${founder.user_id}`);
          }
        } else {
          // Resolve any existing silence alerts if user became active
          await supabase
            .from("founder_trap_alerts")
            .update({ resolved: true, resolved_at: new Date().toISOString() })
            .eq("user_id", founder.user_id)
            .eq("cohort_id", founder.cohort_id)
            .eq("trap_type", "SILENCE_ALERT")
            .eq("resolved", false);
        }

        // Check if user already submitted something today (any status)
        const { data: todaySubmissions } = await supabase
          .from("acceleration_submissions")
          .select("id")
          .eq("user_id", founder.user_id)
          .eq("cohort_id", founder.cohort_id)
          .gte("submitted_at", `${today}T00:00:00.000Z`)
          .limit(1);

        if (todaySubmissions && todaySubmissions.length > 0) {
          logWithSaoPauloTime("send-daily-acceleration-reminders", `User ${founder.user_id} already submitted today, skipping`);
          skipped++;
          continue;
        }

        // Get the task for current day
        const { data: task } = await supabase
          .from("acceleration_tasks")
          .select("id, day_number")
          .eq("day_number", founder.current_day)
          .limit(1)
          .single();

        if (!task) {
          logWithSaoPauloTime("send-daily-acceleration-reminders", `No task found for day ${founder.current_day}, skipping user ${founder.user_id}`);
          skipped++;
          continue;
        }

        // Check if already has approved submission for current day
        const { data: approvedSubmission } = await supabase
          .from("acceleration_submissions")
          .select("id")
          .eq("user_id", founder.user_id)
          .eq("cohort_id", founder.cohort_id)
          .eq("task_id", task.id)
          .eq("status", "APPROVED")
          .limit(1);

        if (approvedSubmission && approvedSubmission.length > 0) {
          logWithSaoPauloTime("send-daily-acceleration-reminders", `User ${founder.user_id} already completed day ${founder.current_day}, skipping`);
          skipped++;
          continue;
        }

        // Get user's email preferences
        const { data: prefs } = await supabase
          .from("email_preferences")
          .select("acceleration_updates")
          .eq("user_id", founder.user_id)
          .single();

        if (prefs?.acceleration_updates === false) {
          logWithSaoPauloTime("send-daily-acceleration-reminders", `User ${founder.user_id} has acceleration updates disabled, skipping`);
          skipped++;
          continue;
        }

        // Get user's locale from profile or default to 'pt'
        const { data: profile } = await supabase
          .from("profiles")
          .select("locale")
          .eq("id", founder.user_id)
          .single();

        const locale = profile?.locale || 'pt';

        // Send reminder notification - include silence alert info if applicable
        const notificationType = hoursSinceActivity > 24 ? 'silence_reality_check' : 'daily_reminder';
        logWithSaoPauloTime("send-daily-acceleration-reminders", `Sending ${notificationType} to user ${founder.user_id} for day ${founder.current_day}`);
        
        const notificationResponse = await supabase.functions.invoke('send-acceleration-notification', {
          body: {
            type: notificationType,
            userId: founder.user_id,
            cohortId: founder.cohort_id,
            taskDay: founder.current_day,
            locale,
            hoursSilent: hoursSinceActivity > 24 ? Math.round(hoursSinceActivity) : undefined
          }
        });

        if (notificationResponse.error) {
          logWithSaoPauloTime("send-daily-acceleration-reminders", `Failed to send reminder to ${founder.user_id}: ${notificationResponse.error}`);
        } else {
          remindersSent++;
          logWithSaoPauloTime("send-daily-acceleration-reminders", `Reminder sent successfully to ${founder.user_id}`);
        }

      } catch (err) {
        logWithSaoPauloTime("send-daily-acceleration-reminders", `Error processing founder ${founder.user_id}: ${err}`);
      }
    }

    // Send admin alerts for high-risk founders (those with critical alerts or long silence)
    const criticalFounders = activeFounders.filter(f => {
      const hoursSilent = hoursSinceInSaoPaulo(f.last_activity_at);
      return hoursSilent > 48;
    });

    if (criticalFounders.length > 0) {
      await supabase.from('notifications').insert({
        user_id: ADMIN_USER_ID,
        type: 'RISK_ALERT',
        title: `⚠️ ${criticalFounders.length} founders em risco crítico`,
        message: `${criticalFounders.length} founders estão silenciosos há mais de 48h. Verifique o painel de Inteligência.`,
        data: { founderIds: criticalFounders.map(f => f.user_id) }
      });
      logWithSaoPauloTime("send-daily-acceleration-reminders", `Admin alert sent for ${criticalFounders.length} critical founders`);
    }

    logWithSaoPauloTime("send-daily-acceleration-reminders", `Daily reminders job completed. Sent: ${remindersSent}, Skipped: ${skipped}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        reminders_sent: remindersSent,
        skipped,
        total_active: activeFounders.length,
        critical_alerts: criticalFounders.length
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logWithSaoPauloTime("send-daily-acceleration-reminders", `Error: ${errorMessage}`);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
