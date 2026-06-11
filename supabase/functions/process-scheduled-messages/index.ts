import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { logWithSaoPauloTime } from "../_shared/timezone.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    logWithSaoPauloTime("process-scheduled-messages", "Starting scheduled messages processing...");

    // Fetch pending messages that are due (scheduled_for is already in UTC)
    const { data: pendingMessages, error: fetchError } = await supabase
      .from('scheduled_messages')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString())
      .order('scheduled_for', { ascending: true })
      .limit(100);

    if (fetchError) {
      logWithSaoPauloTime("process-scheduled-messages", `Error fetching scheduled messages: ${fetchError.message}`);
      throw fetchError;
    }

    if (!pendingMessages || pendingMessages.length === 0) {
      logWithSaoPauloTime("process-scheduled-messages", "No pending messages to process");
      return new Response(
        JSON.stringify({ success: true, processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    logWithSaoPauloTime("process-scheduled-messages", `Found ${pendingMessages.length} pending messages to process`);

    let processedCount = 0;
    let errorCount = 0;

    for (const scheduledMsg of pendingMessages) {
      try {
        // Insert the message into the messages table
        const { error: insertError } = await supabase
          .from('messages')
          .insert({
            conversation_id: scheduledMsg.conversation_id,
            sender_id: scheduledMsg.sender_id,
            content: scheduledMsg.content,
            created_at: new Date().toISOString()
          });

        if (insertError) {
          logWithSaoPauloTime("process-scheduled-messages", `Error inserting message ${scheduledMsg.id}: ${insertError.message}`);
          errorCount++;
          continue;
        }

        // Update the conversation's last_message_at
        const { error: updateConvError } = await supabase
          .from('conversations')
          .update({ last_message_at: new Date().toISOString() })
          .eq('id', scheduledMsg.conversation_id);

        if (updateConvError) {
          logWithSaoPauloTime("process-scheduled-messages", `Error updating conversation ${scheduledMsg.conversation_id}: ${updateConvError.message}`);
        }

        // Mark the scheduled message as sent
        const { error: updateError } = await supabase
          .from('scheduled_messages')
          .update({ status: 'sent' })
          .eq('id', scheduledMsg.id);

        if (updateError) {
          logWithSaoPauloTime("process-scheduled-messages", `Error updating scheduled message ${scheduledMsg.id}: ${updateError.message}`);
          errorCount++;
          continue;
        }

        processedCount++;
        logWithSaoPauloTime("process-scheduled-messages", `Processed message ${scheduledMsg.id} for conversation ${scheduledMsg.conversation_id}`);

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (msgError) {
        logWithSaoPauloTime("process-scheduled-messages", `Error processing message ${scheduledMsg.id}: ${msgError}`);
        errorCount++;
      }
    }

    logWithSaoPauloTime("process-scheduled-messages", `Finished processing. Success: ${processedCount}, Errors: ${errorCount}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: processedCount,
        errors: errorCount,
        total: pendingMessages.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logWithSaoPauloTime("process-scheduled-messages", `Error: ${errorMessage}`);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
