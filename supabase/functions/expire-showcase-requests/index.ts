import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ADMIN_USER_ID = '38a1c53d-b99e-4958-9bb2-18663d8b9b3e';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting expire-showcase-requests job...');

    // Find pending requests older than 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: expiredRequests, error: fetchError } = await supabase
      .from('showcase_requests')
      .select(`
        id,
        project_id,
        requester_id,
        request_type,
        created_at,
        projects:project_id (
          id,
          title,
          owner_id
        )
      `)
      .eq('status', 'pending')
      .lt('created_at', sevenDaysAgo.toISOString());

    if (fetchError) {
      console.error('Error fetching expired requests:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${expiredRequests?.length || 0} expired requests`);

    const results = [];

    for (const request of expiredRequests || []) {
      try {
        const project = request.projects as any;
        if (!project) {
          console.log(`Skipping request ${request.id} - project not found`);
          continue;
        }

        const projectTitle = project.title;
        const projectOwnerId = project.owner_id;

        // 1. Update request status to expired
        const { error: updateError } = await supabase
          .from('showcase_requests')
          .update({
            status: 'expired',
            reviewed_at: new Date().toISOString()
          })
          .eq('id', request.id);

        if (updateError) {
          console.error(`Error updating request ${request.id}:`, updateError);
          continue;
        }

        // 2. Get or create conversation between admin and project owner
        let conversationId: string;
        
        const { data: existingConv } = await supabase
          .from('conversations')
          .select('id')
          .or(`and(participant_1.eq.${ADMIN_USER_ID},participant_2.eq.${projectOwnerId}),and(participant_1.eq.${projectOwnerId},participant_2.eq.${ADMIN_USER_ID})`)
          .single();

        if (existingConv) {
          conversationId = existingConv.id;
        } else {
          const { data: newConv, error: convError } = await supabase
            .from('conversations')
            .insert({
              participant_1: ADMIN_USER_ID,
              participant_2: projectOwnerId,
              last_message_at: new Date().toISOString()
            })
            .select('id')
            .single();

          if (convError) {
            console.error(`Error creating conversation for request ${request.id}:`, convError);
            continue;
          }
          conversationId = newConv.id;
        }

        // 3. Prepare message based on request type
        let messageContent: string;
        
        if (request.request_type === 'owner_request') {
          // Owner requested, admin didn't respond
          messageContent = `⏰ **Solicitação de Publicação Expirada**

Sua solicitação de publicação para a startup "**${projectTitle}**" expirou após 7 dias sem revisão.

Você pode solicitar novamente a qualquer momento nas configurações da startup:
👉 https://guilda.app.br/project/${request.project_id}/settings`;
        } else {
          // Admin suggested, owner didn't respond
          messageContent = `⏰ **Sugestão de Publicação Expirada**

A sugestão de publicar sua startup "**${projectTitle}**" no Discovery expirou após 7 dias sem resposta.

Se ainda tiver interesse em publicar, visite as configurações da startup:
👉 https://guilda.app.br/project/${request.project_id}/settings`;
        }

        // 4. Send message from admin
        const { error: msgError } = await supabase
          .from('messages')
          .insert({
            conversation_id: conversationId,
            sender_id: ADMIN_USER_ID,
            content: messageContent
          });

        if (msgError) {
          console.error(`Error sending message for request ${request.id}:`, msgError);
        }

        // Update conversation last_message_at
        await supabase
          .from('conversations')
          .update({ last_message_at: new Date().toISOString() })
          .eq('id', conversationId);

        // 5. Create in-app notification
        const { error: notifError } = await supabase
          .from('notifications')
          .insert({
            user_id: projectOwnerId,
            type: 'showcase_expired',
            title: 'Solicitação de publicação expirada',
            message: `A solicitação de publicação para "${projectTitle}" expirou após 7 dias.`
          });

        if (notifError) {
          console.error(`Error creating notification for request ${request.id}:`, notifError);
        }

        // 6. Add timeline entry
        const { error: timelineError } = await supabase
          .from('project_updates')
          .insert({
            project_id: request.project_id,
            author_id: ADMIN_USER_ID,
            type: 'SHOWCASE_EXPIRED',
            content: request.request_type === 'owner_request' 
              ? 'Solicitação de publicação expirou sem revisão'
              : 'Sugestão de publicação expirou sem resposta do proprietário'
          });

        if (timelineError) {
          console.error(`Error adding timeline for request ${request.id}:`, timelineError);
        }

        results.push({
          requestId: request.id,
          projectId: request.project_id,
          projectTitle,
          requestType: request.request_type,
          status: 'expired'
        });

        console.log(`Successfully expired request ${request.id} for project "${projectTitle}"`);

      } catch (err) {
        console.error(`Error processing request ${request.id}:`, err);
      }
    }

    console.log(`Finished expire-showcase-requests job. Expired ${results.length} requests.`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        expired_count: results.length,
        results 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in expire-showcase-requests:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
