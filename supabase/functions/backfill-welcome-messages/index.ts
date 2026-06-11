import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { ADMIN_USER_ID } from "../_shared/admin.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const getWelcomeMessage = (username: string) => `👋 Olá ${username}!

Bem-vindo(a) à Guilda! 🎉

Obrigado por se cadastrar na nossa plataforma de conexão entre Builders, Sellers e Investidores.

Aqui estão as principais funcionalidades:

🏰 **Taverna** - Encontre co-founders compatíveis
👉 https://guilda.app.br/tavern

📋 **Startups** - Crie sua startup e recrute membros
👉 https://guilda.app.br/projects

🚀 **Aceleração** - Nosso programa de validação intensiva (Do Or Die)
👉 https://guilda.app.br/aceleracao

💼 **Capital** - Conecte-se com investidores ou veja dealflow
👉 https://guilda.app.br/capital

🧰 **Ferramentas** - Calculadoras gratuitas (Equity, Valuation, Runway, etc.)
👉 https://guilda.app.br/tools

📚 **Academy** - Artigos e guias sobre empreendedorismo
👉 https://guilda.app.br/blog

Qualquer dúvida, é só responder aqui!

Bons negócios! 🚀`;

const PROJECT_MESSAGE = `Parabéns pela sua startup! 🎉

Agora que você tem um projeto, recomendo:

1. **Complete o perfil** - Adicione descrição, imagem e vagas
2. **Busque co-founders** na Taverna: https://guilda.app.br/tavern
3. **Explore as ferramentas**: https://guilda.app.br/tools

Se quiser validar sua ideia, confira nosso programa de Aceleração:
👉 https://guilda.app.br/aceleracao

Abraços 🚀`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const { dryRun = false } = await req.json().catch(() => ({}));
    
    console.log(`[backfill-welcome-messages] Starting... dryRun=${dryRun}`);

    const results = {
      welcomeMessages: { found: 0, sent: 0, errors: 0, details: [] as any[] },
      projectMessages: { found: 0, sent: 0, errors: 0, details: [] as any[] },
    };

    // 1. Find users without welcome messages
    const { data: usersWithoutWelcome, error: usersError } = await supabase
      .from('profiles')
      .select('id, username')
      .neq('id', ADMIN_USER_ID);

    if (usersError) {
      console.error('[backfill-welcome-messages] Error fetching profiles:', usersError);
      throw usersError;
    }

    console.log(`[backfill-welcome-messages] Found ${usersWithoutWelcome?.length || 0} total users`);

    // Filter users who don't have a conversation with admin
    const usersNeedingWelcome = [];
    for (const user of usersWithoutWelcome || []) {
      const { data: existingConvo } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(participant_1.eq.${ADMIN_USER_ID},participant_2.eq.${user.id}),and(participant_1.eq.${user.id},participant_2.eq.${ADMIN_USER_ID})`)
        .maybeSingle();

      if (!existingConvo) {
        usersNeedingWelcome.push(user);
      }
    }

    results.welcomeMessages.found = usersNeedingWelcome.length;
    console.log(`[backfill-welcome-messages] ${usersNeedingWelcome.length} users need welcome messages`);

    // Send welcome messages
    for (const user of usersNeedingWelcome) {
      try {
        if (dryRun) {
          console.log(`[DRY RUN] Would send welcome to ${user.username} (${user.id})`);
          results.welcomeMessages.details.push({ userId: user.id, username: user.username, status: 'dry_run' });
          results.welcomeMessages.sent++;
          continue;
        }

        // Create conversation
        const { data: newConvo, error: convoError } = await supabase
          .from('conversations')
          .insert({
            participant_1: ADMIN_USER_ID,
            participant_2: user.id,
            last_message_at: new Date().toISOString(),
          })
          .select('id')
          .single();

        if (convoError) {
          console.error(`[backfill-welcome-messages] Error creating conversation for ${user.id}:`, convoError);
          results.welcomeMessages.errors++;
          results.welcomeMessages.details.push({ userId: user.id, username: user.username, status: 'error', error: convoError.message });
          continue;
        }

        // Send welcome message
        const { error: msgError } = await supabase
          .from('messages')
          .insert({
            conversation_id: newConvo.id,
            sender_id: ADMIN_USER_ID,
            content: getWelcomeMessage(user.username),
          });

        if (msgError) {
          console.error(`[backfill-welcome-messages] Error sending message for ${user.id}:`, msgError);
          results.welcomeMessages.errors++;
          results.welcomeMessages.details.push({ userId: user.id, username: user.username, status: 'error', error: msgError.message });
          continue;
        }

        console.log(`[backfill-welcome-messages] Sent welcome to ${user.username}`);
        results.welcomeMessages.sent++;
        results.welcomeMessages.details.push({ userId: user.id, username: user.username, status: 'sent' });

      } catch (err) {
        console.error(`[backfill-welcome-messages] Unexpected error for ${user.id}:`, err);
        results.welcomeMessages.errors++;
        results.welcomeMessages.details.push({ userId: user.id, username: user.username, status: 'error', error: String(err) });
      }
    }

    // 2. Find projects without project message
    const { data: allProjects, error: projectsError } = await supabase
      .from('projects')
      .select('id, owner_id, title')
      .eq('is_showcase', false)
      .neq('owner_id', ADMIN_USER_ID);

    if (projectsError) {
      console.error('[backfill-welcome-messages] Error fetching projects:', projectsError);
      throw projectsError;
    }

    console.log(`[backfill-welcome-messages] Found ${allProjects?.length || 0} total non-showcase projects`);

    // Filter projects whose owners haven't received the project message
    const projectsNeedingMessage = [];
    for (const project of allProjects || []) {
      // Check if owner has received project message
      const { data: existingProjectMsg } = await supabase
        .from('messages')
        .select('id')
        .eq('sender_id', ADMIN_USER_ID)
        .ilike('content', '%Muito legal ver que você já tem um projeto%')
        .limit(1);

      // Get the conversation with this owner
      const { data: ownerConvo } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(participant_1.eq.${ADMIN_USER_ID},participant_2.eq.${project.owner_id}),and(participant_1.eq.${project.owner_id},participant_2.eq.${ADMIN_USER_ID})`)
        .maybeSingle();

      if (!ownerConvo) {
        // No conversation means they didn't get welcome either - project message will follow welcome
        projectsNeedingMessage.push(project);
        continue;
      }

      // Check if project message exists in their conversation
      const { data: projectMsgInConvo } = await supabase
        .from('messages')
        .select('id')
        .eq('conversation_id', ownerConvo.id)
        .eq('sender_id', ADMIN_USER_ID)
        .ilike('content', '%Muito legal ver que você já tem um projeto%')
        .maybeSingle();

      if (!projectMsgInConvo) {
        projectsNeedingMessage.push(project);
      }
    }

    results.projectMessages.found = projectsNeedingMessage.length;
    console.log(`[backfill-welcome-messages] ${projectsNeedingMessage.length} projects need project messages`);

    // Send project messages
    const processedOwners = new Set<string>();
    for (const project of projectsNeedingMessage) {
      // Skip if we already processed this owner (they might have multiple projects)
      if (processedOwners.has(project.owner_id)) {
        console.log(`[backfill-welcome-messages] Skipping duplicate owner ${project.owner_id}`);
        continue;
      }
      processedOwners.add(project.owner_id);

      try {
        if (dryRun) {
          console.log(`[DRY RUN] Would send project message for "${project.title}" to owner ${project.owner_id}`);
          results.projectMessages.details.push({ projectId: project.id, title: project.title, ownerId: project.owner_id, status: 'dry_run' });
          results.projectMessages.sent++;
          continue;
        }

        // Get or create conversation with owner
        let conversationId: string;
        const { data: existingConvo } = await supabase
          .from('conversations')
          .select('id')
          .or(`and(participant_1.eq.${ADMIN_USER_ID},participant_2.eq.${project.owner_id}),and(participant_1.eq.${project.owner_id},participant_2.eq.${ADMIN_USER_ID})`)
          .maybeSingle();

        if (existingConvo) {
          conversationId = existingConvo.id;
        } else {
          // Create conversation (this shouldn't happen after welcome backfill, but just in case)
          const { data: newConvo, error: convoError } = await supabase
            .from('conversations')
            .insert({
              participant_1: ADMIN_USER_ID,
              participant_2: project.owner_id,
              last_message_at: new Date().toISOString(),
            })
            .select('id')
            .single();

          if (convoError) {
            console.error(`[backfill-welcome-messages] Error creating conversation for project owner ${project.owner_id}:`, convoError);
            results.projectMessages.errors++;
            results.projectMessages.details.push({ projectId: project.id, title: project.title, ownerId: project.owner_id, status: 'error', error: convoError.message });
            continue;
          }
          conversationId = newConvo.id;
        }

        // Send project message
        const { error: msgError } = await supabase
          .from('messages')
          .insert({
            conversation_id: conversationId,
            sender_id: ADMIN_USER_ID,
            content: PROJECT_MESSAGE,
          });

        if (msgError) {
          console.error(`[backfill-welcome-messages] Error sending project message for ${project.owner_id}:`, msgError);
          results.projectMessages.errors++;
          results.projectMessages.details.push({ projectId: project.id, title: project.title, ownerId: project.owner_id, status: 'error', error: msgError.message });
          continue;
        }

        // Update conversation last_message_at
        await supabase
          .from('conversations')
          .update({ last_message_at: new Date().toISOString() })
          .eq('id', conversationId);

        console.log(`[backfill-welcome-messages] Sent project message for "${project.title}"`);
        results.projectMessages.sent++;
        results.projectMessages.details.push({ projectId: project.id, title: project.title, ownerId: project.owner_id, status: 'sent' });

      } catch (err) {
        console.error(`[backfill-welcome-messages] Unexpected error for project ${project.id}:`, err);
        results.projectMessages.errors++;
        results.projectMessages.details.push({ projectId: project.id, title: project.title, ownerId: project.owner_id, status: 'error', error: String(err) });
      }
    }

    console.log('[backfill-welcome-messages] Completed!', JSON.stringify({
      welcomeMessages: { found: results.welcomeMessages.found, sent: results.welcomeMessages.sent, errors: results.welcomeMessages.errors },
      projectMessages: { found: results.projectMessages.found, sent: results.projectMessages.sent, errors: results.projectMessages.errors },
    }));

    return new Response(JSON.stringify({
      success: true,
      dryRun,
      summary: {
        welcomeMessages: {
          found: results.welcomeMessages.found,
          sent: results.welcomeMessages.sent,
          errors: results.welcomeMessages.errors,
        },
        projectMessages: {
          found: results.projectMessages.found,
          sent: results.projectMessages.sent,
          errors: results.projectMessages.errors,
        },
      },
      details: {
        welcomeMessages: results.welcomeMessages.details,
        projectMessages: results.projectMessages.details,
      },
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[backfill-welcome-messages] Fatal error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
