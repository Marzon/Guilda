import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { sendBrevoEmail } from "../_shared/brevo.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Configuration - tuned for reliability
const BATCH_SIZE = 10; // Small batches for better control
const MAX_ATTEMPTS = 3;
const EMAIL_DELAY_MS = 300; // Delay between individual emails
const BATCH_DELAY_MS = 1000; // Delay between batches (throttling)
const RETRY_DELAY_MS = 500; // Delay before retry

const EMAIL_URLS = {
  tavern: "https://guilda.app.br/taverna",
  settings: "https://guilda.app.br/settings",
};

async function sendBrevoWithRetry(
  options: { to: string; subject: string; htmlBody: string },
  retries = 1
): Promise<{ success: boolean; error?: string }> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const result = await sendBrevoEmail({
      to: [{ email: options.to }],
      subject: options.subject,
      htmlContent: options.htmlBody,
      tags: ["broadcast"]
    });
    
    if (result.success) {
      return { success: true };
    }
    
    // Retry on failure
    if (attempt < retries) {
      console.log(`[process-broadcast-queue] Send failed, retrying...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * (attempt + 1)));
      continue;
    }
    
    return { success: false, error: result.error };
  }
  
  return { success: false, error: "Max retries exceeded" };
}

serve(async (req: Request) => {
  console.log("[process-broadcast-queue] Function invoked");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const MAX_EXECUTION_TIME = 25000; // 25 seconds (leave buffer for Deno's 30s limit)

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Mark any "queued" broadcasts as "processing"
    await supabase
      .from("admin_broadcasts")
      .update({ status: "processing" })
      .eq("status", "queued");

    let totalSent = 0;
    let totalFailed = 0;
    let batchesProcessed = 0;
    const broadcastUpdates: Record<string, { sent: number; failed: number }> = {};

    // Process in a loop while we have time
    while (Date.now() - startTime < MAX_EXECUTION_TIME) {
      // CRITICAL FIX: Use atomic claim with FOR UPDATE SKIP LOCKED via RPC
      // The RPC returns full records (SETOF broadcast_email_queue), not just IDs
      // NOTE: Parameter names must match SQL function (p_batch_size, p_max_attempts)
      const { data: claimedEmails, error: claimError } = await supabase.rpc(
        'claim_broadcast_emails',
        { p_batch_size: BATCH_SIZE, p_max_attempts: MAX_ATTEMPTS }
      );

      if (claimError) {
        console.error("[process-broadcast-queue] Claim error:", JSON.stringify(claimError));
        
        // Fallback to regular select if RPC doesn't exist (for backwards compatibility)
        // But with immediate status update to prevent duplicates
        const { data: fallbackEmails, error: fetchError } = await supabase
          .from("broadcast_email_queue")
          .select("id, broadcast_id, user_id, email, attempts")
          .eq("status", "pending")
          .lt("attempts", MAX_ATTEMPTS)
          .order("created_at", { ascending: true })
          .limit(BATCH_SIZE);
        
        if (fetchError || !fallbackEmails || fallbackEmails.length === 0) {
          console.log("[process-broadcast-queue] No more pending emails");
          break;
        }
        
        // Immediately mark as processing to prevent other instances from claiming
        const emailIds = fallbackEmails.map(e => e.id);
        await supabase
          .from("broadcast_email_queue")
          .update({ status: "processing" })
          .in("id", emailIds);
        
        // Process this batch
        await processBatch(supabase, supabaseUrl, fallbackEmails, broadcastUpdates, { totalSent, totalFailed });
        totalSent += fallbackEmails.filter(() => true).length; // Will be updated in processBatch
        batchesProcessed++;
        await new Promise(resolve => setTimeout(resolve, BATCH_DELAY_MS));
        continue;
      }

      // No more pending emails
      if (!claimedEmails || claimedEmails.length === 0) {
        console.log("[process-broadcast-queue] No more pending emails");
        break;
      }

      // Use claimed emails directly - RPC already returns full records!
      const pendingEmails = claimedEmails;
      console.log(`[process-broadcast-queue] Claimed ${pendingEmails.length} emails for processing`);

      console.log(`[process-broadcast-queue] Processing batch ${batchesProcessed + 1} (${pendingEmails.length} emails)`);

      // Get unique broadcast IDs to fetch broadcast data
      const broadcastIds = [...new Set(pendingEmails.map((e: { broadcast_id: string }) => e.broadcast_id))];
      
      const { data: broadcasts, error: broadcastError } = await supabase
        .from("admin_broadcasts")
        .select("id, title, message")
        .in("id", broadcastIds);

      if (broadcastError) {
        console.error("[process-broadcast-queue] Broadcast fetch error:", JSON.stringify(broadcastError));
        // Release the claimed emails back to pending
        const emailIds = pendingEmails.map((e: { id: string }) => e.id);
        await supabase
          .from("broadcast_email_queue")
          .update({ status: "pending" })
          .in("id", emailIds);
        throw new Error(`Broadcast fetch error: ${broadcastError.message}`);
      }

      const broadcastMap = new Map(broadcasts?.map(b => [b.id, b]) || []);

      // Process each email in the batch
      for (const item of pendingEmails) {
        // Check time limit
        if (Date.now() - startTime > MAX_EXECUTION_TIME) {
          console.log("[process-broadcast-queue] Time limit approaching, stopping batch");
          // Release uncompleted emails back to pending
          await supabase
            .from("broadcast_email_queue")
            .update({ status: "pending" })
            .eq("id", item.id)
            .eq("status", "processing");
          break;
        }

        const broadcast = broadcastMap.get(item.broadcast_id);
        
        if (!broadcast) {
          console.error(`[process-broadcast-queue] Broadcast not found for item ${item.id}`);
          await supabase
            .from("broadcast_email_queue")
            .update({ status: "failed", error_message: "Broadcast not found" })
            .eq("id", item.id);
          totalFailed++;
          continue;
        }

        // Initialize broadcast tracking
        if (!broadcastUpdates[item.broadcast_id]) {
          broadcastUpdates[item.broadcast_id] = { sent: 0, failed: 0 };
        }
        
        // Generate email HTML
        const trackingPixelUrl = `${supabaseUrl}/functions/v1/track-email-open?broadcast_id=${item.broadcast_id}&user_id=${item.user_id}`;
        const emailHtml = generateEmailHtml(broadcast.title, broadcast.message) + 
          `<img src="${trackingPixelUrl}" width="1" height="1" style="display:none;" alt="" />`;

        // Send with retry
        const result = await sendBrevoWithRetry({
          to: item.email,
          subject: broadcast.title,
          htmlBody: emailHtml,
        }, 1);

        if (result.success) {
          // Mark as sent
          await supabase
            .from("broadcast_email_queue")
            .update({
              status: "sent",
              sent_at: new Date().toISOString(),
              last_attempt_at: new Date().toISOString(),
              attempts: item.attempts + 1,
            })
            .eq("id", item.id);

          broadcastUpdates[item.broadcast_id].sent++;
          totalSent++;
          
          console.log(`[process-broadcast-queue] ✓ Sent to ${item.email}`);

          // Insert into broadcast_recipients for tracking (with upsert to prevent duplicates)
          await supabase.from("broadcast_recipients").upsert({
            broadcast_id: item.broadcast_id,
            user_id: item.user_id,
            email: item.email,
            sent_at: new Date().toISOString(),
          }, {
            onConflict: "broadcast_id,email",
            ignoreDuplicates: true
          });

        } else {
          // Handle failure
          const newAttempts = item.attempts + 1;
          const isFinalFailure = newAttempts >= MAX_ATTEMPTS;
          
          await supabase
            .from("broadcast_email_queue")
            .update({
              status: isFinalFailure ? "failed" : "pending",
              attempts: newAttempts,
              last_attempt_at: new Date().toISOString(),
              error_message: result.error,
            })
            .eq("id", item.id);

          if (isFinalFailure) {
            broadcastUpdates[item.broadcast_id].failed++;
            totalFailed++;
          }
          
          console.error(`[process-broadcast-queue] ✗ Failed to send to ${item.email}: ${result.error}`);
        }

        // Delay between emails (throttling)
        await new Promise(resolve => setTimeout(resolve, EMAIL_DELAY_MS));
      }

      batchesProcessed++;

      // Update broadcast email counts after each batch
      for (const [broadcastId, counts] of Object.entries(broadcastUpdates)) {
        const { data: currentBroadcast } = await supabase
          .from("admin_broadcasts")
          .select("emails_sent")
          .eq("id", broadcastId)
          .single();

        await supabase
          .from("admin_broadcasts")
          .update({
            emails_sent: (currentBroadcast?.emails_sent || 0) + counts.sent,
          })
          .eq("id", broadcastId);

        // Reset counts for next batch
        broadcastUpdates[broadcastId] = { sent: 0, failed: 0 };
      }

      // Delay between batches (major throttling)
      await new Promise(resolve => setTimeout(resolve, BATCH_DELAY_MS));
    }

    // Final status update for completed broadcasts
    const { data: allBroadcasts } = await supabase
      .from("admin_broadcasts")
      .select("id")
      .eq("status", "processing");

    for (const broadcast of allBroadcasts || []) {
      const { count: pendingCount } = await supabase
        .from("broadcast_email_queue")
        .select("id", { count: "exact", head: true })
        .eq("broadcast_id", broadcast.id)
        .in("status", ["pending", "processing"]);

      if (pendingCount === 0) {
        const { count: failedCount } = await supabase
          .from("broadcast_email_queue")
          .select("id", { count: "exact", head: true })
          .eq("broadcast_id", broadcast.id)
          .eq("status", "failed");

        await supabase
          .from("admin_broadcasts")
          .update({
            status: failedCount && failedCount > 0 ? "partial" : "sent",
            sent_at: new Date().toISOString(),
          })
          .eq("id", broadcast.id);

        console.log(`[process-broadcast-queue] Broadcast ${broadcast.id} completed (${failedCount || 0} failures)`);
      }
    }

    // Check if there are more pending emails for auto-continuation
    const { count: remainingCount } = await supabase
      .from("broadcast_email_queue")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending")
      .lt("attempts", MAX_ATTEMPTS);

    const hasMorePending = remainingCount && remainingCount > 0;

    // NOTE: Removed self-invocation to prevent concurrency issues
    // The cron job will pick up remaining emails in the next minute
    if (hasMorePending) {
      console.log(`[process-broadcast-queue] ${remainingCount} emails remaining, will be processed by next cron run`);
    }

    const executionTime = Date.now() - startTime;
    console.log(`[process-broadcast-queue] Completed: ${totalSent} sent, ${totalFailed} failed, ${batchesProcessed} batches in ${executionTime}ms`);

    return new Response(
      JSON.stringify({
        processed: totalSent + totalFailed,
        sent: totalSent,
        failed: totalFailed,
        batches: batchesProcessed,
        executionTime,
        remainingEmails: remainingCount || 0,
        hasMorePending,
        message: hasMorePending 
          ? `Processed ${totalSent} emails, ${remainingCount} remaining (next cron will continue)`
          : `Completed! ${totalSent} emails sent.`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[process-broadcast-queue] Error:", errorMessage);
    console.error("[process-broadcast-queue] Stack:", error instanceof Error ? error.stack : "No stack");
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function processBatch(
  supabase: any,
  supabaseUrl: string,
  pendingEmails: { id: string; broadcast_id: string; user_id: string; email: string; attempts: number }[],
  broadcastUpdates: Record<string, { sent: number; failed: number }>,
  stats: { totalSent: number; totalFailed: number }
) {
  const broadcastIds = [...new Set(pendingEmails.map(e => e.broadcast_id))];
  const { data: broadcasts } = await supabase
    .from("admin_broadcasts")
    .select("id, title, message")
    .in("id", broadcastIds);
  
  const broadcastMap = new Map<string, { id: string; title: string; message: string }>(
    broadcasts?.map((b: { id: string; title: string; message: string }) => [b.id, b]) || []
  );
  
  for (const item of pendingEmails) {
    const broadcast = broadcastMap.get(item.broadcast_id);
    if (!broadcast) continue;
    
    if (!broadcastUpdates[item.broadcast_id]) {
      broadcastUpdates[item.broadcast_id] = { sent: 0, failed: 0 };
    }
    
    const trackingPixelUrl = `${supabaseUrl}/functions/v1/track-email-open?broadcast_id=${item.broadcast_id}&user_id=${item.user_id}`;
    const emailHtml = generateEmailHtml(broadcast.title, broadcast.message) + 
      `<img src="${trackingPixelUrl}" width="1" height="1" style="display:none;" alt="" />`;

    const result = await sendBrevoWithRetry({
      to: item.email,
      subject: broadcast.title,
      htmlBody: emailHtml,
    }, 1);

    if (result.success) {
      await supabase
        .from("broadcast_email_queue")
        .update({
          status: "sent",
          sent_at: new Date().toISOString(),
          last_attempt_at: new Date().toISOString(),
          attempts: item.attempts + 1,
        })
        .eq("id", item.id);
      broadcastUpdates[item.broadcast_id].sent++;
      stats.totalSent++;
    } else {
      const newAttempts = item.attempts + 1;
      await supabase
        .from("broadcast_email_queue")
        .update({
          status: newAttempts >= 3 ? "failed" : "pending",
          attempts: newAttempts,
          last_attempt_at: new Date().toISOString(),
          error_message: result.error,
        })
        .eq("id", item.id);
      if (newAttempts >= 3) stats.totalFailed++;
    }
    
    await new Promise(resolve => setTimeout(resolve, 300));
  }
}

function generateEmailHtml(title: string, message: string): string {
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
          <tr>
            <td style="background: linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%); padding: 24px 40px; text-align: center;">
              <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0;">Guilda</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 40px;">
              <h2 style="color: #1f2937; font-size: 22px; font-weight: 700; margin: 0 0 16px 0;">${title}</h2>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${message}</p>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 24px;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${EMAIL_URLS.tavern}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #9333ea 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 600; font-size: 16px;">Acessar Guilda</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 20px 40px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 12px; margin: 0; text-align: center;">© 2024 Guilda. Todos os direitos reservados.</p>
              <p style="color: #9ca3af; font-size: 11px; margin: 8px 0 0 0; text-align: center;">
                <a href="${EMAIL_URLS.settings}" style="color: #7c3aed; text-decoration: underline;">Gerenciar preferências de email</a>
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
