import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Admin user ID that will act as the introducer
const ADMIN_USER_ID = '38a1c53d-b99e-4958-9bb2-18663d8b9b3e';

interface TeamMember {
  id: string;
  username: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  archetype: string;
}

interface Team {
  id: string;
  startup_name: string;
  builder_id: string | null;
  seller_id: string | null;
  introductions_sent_at: string | null;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Auth check
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

    // Check admin role
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

    const { cohortId, teamIds } = await req.json();
    
    if (!cohortId) {
      return new Response(JSON.stringify({ error: "cohortId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[introduce-acceleration-teams] Starting for cohort: ${cohortId}, specific teams: ${teamIds?.length || 'all'}`);

    // Get cohort info (for WhatsApp link)
    const { data: cohort, error: cohortError } = await supabase
      .from("cohorts")
      .select("id, name, whatsapp_link")
      .eq("id", cohortId)
      .single();

    if (cohortError || !cohort) {
      console.error("[introduce-acceleration-teams] Cohort not found:", cohortError);
      return new Response(JSON.stringify({ error: "Cohort not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get teams that need introductions
    let teamsQuery = supabase
      .from("acceleration_teams")
      .select("id, startup_name, builder_id, seller_id, introductions_sent_at")
      .eq("cohort_id", cohortId)
      .is("introductions_sent_at", null);

    // If specific teamIds provided, filter to those
    if (teamIds && teamIds.length > 0) {
      teamsQuery = teamsQuery.in("id", teamIds);
    }

    const { data: teams, error: teamsError } = await teamsQuery;

    if (teamsError) {
      console.error("[introduce-acceleration-teams] Failed to fetch teams:", teamsError);
      throw teamsError;
    }

    if (!teams || teams.length === 0) {
      console.log("[introduce-acceleration-teams] No teams pending introduction");
      return new Response(JSON.stringify({ 
        success: true, 
        message: "Nenhum time pendente de apresentação",
        introduced: 0 
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[introduce-acceleration-teams] Found ${teams.length} teams to introduce`);

    // Collect all member IDs
    const memberIds = teams
      .flatMap(t => [t.builder_id, t.seller_id])
      .filter(Boolean) as string[];

    // Fetch profiles
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, username, phone, avatar_url, archetype")
      .in("id", memberIds);

    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

    // Fetch emails from auth.users
    const emailMap = new Map<string, string>();
    for (const memberId of memberIds) {
      try {
        const { data: userData } = await supabase.auth.admin.getUserById(memberId);
        if (userData?.user?.email) {
          emailMap.set(memberId, userData.user.email);
        }
      } catch (e) {
        console.error(`[introduce-acceleration-teams] Failed to get email for ${memberId}:`, e);
      }
    }

    let introducedCount = 0;
    const errors: string[] = [];

    for (const team of teams as Team[]) {
      const members: TeamMember[] = [];
      
      // Get builder info
      if (team.builder_id) {
        const profile = profileMap.get(team.builder_id);
        if (profile) {
          members.push({
            id: team.builder_id,
            username: profile.username || "Founder",
            email: emailMap.get(team.builder_id) || "",
            phone: profile.phone,
            avatar_url: profile.avatar_url,
            archetype: profile.archetype || "BUILDER",
          });
        }
      }

      // Get seller info
      if (team.seller_id) {
        const profile = profileMap.get(team.seller_id);
        if (profile) {
          members.push({
            id: team.seller_id,
            username: profile.username || "Founder",
            email: emailMap.get(team.seller_id) || "",
            phone: profile.phone,
            avatar_url: profile.avatar_url,
            archetype: profile.archetype || "SELLER",
          });
        }
      }

      // Handle solo teams - send direct message instead of group
      if (members.length < 2) {
        console.log(`[introduce-acceleration-teams] Processing solo team: ${team.startup_name}`);
        
        const soloMember = members[0];
        if (!soloMember) {
          console.log(`[introduce-acceleration-teams] No member found for solo team: ${team.startup_name}`);
          await supabase
            .from("acceleration_teams")
            .update({ introductions_sent_at: new Date().toISOString() })
            .eq("id", team.id);
          continue;
        }

        try {
          // Check if conversation already exists between admin and solo member
          let conversationId: string;
          
          const { data: existingConv } = await supabase
            .from("conversations")
            .select("id")
            .or(`and(participant_1.eq.${ADMIN_USER_ID},participant_2.eq.${soloMember.id}),and(participant_1.eq.${soloMember.id},participant_2.eq.${ADMIN_USER_ID})`)
            .maybeSingle();

          if (existingConv) {
            conversationId = existingConv.id;
          } else {
            // Create new direct conversation
            const { data: newConv, error: convError } = await supabase
              .from("conversations")
              .insert({
                participant_1: ADMIN_USER_ID,
                participant_2: soloMember.id,
                last_message_at: new Date().toISOString(),
              })
              .select()
              .single();

            if (convError || !newConv) {
              console.error(`[introduce-acceleration-teams] Failed to create conversation for solo team:`, convError);
              errors.push(`Erro ao criar conversa para ${team.startup_name}`);
              continue;
            }
            conversationId = newConv.id;
          }

          // Build welcome message for solo member
          let soloMessage = `🚀 **Bem-vindo ao programa de aceleração!**\n\n` +
            `Você faz parte do time **${team.startup_name || 'Aceleração'}** na turma **${cohort.name}**!\n\n` +
            `Por enquanto você está como time solo, mas isso pode mudar durante o programa.`;

          // Add WhatsApp link if available
          if (cohort.whatsapp_link) {
            soloMessage += `\n\n💬 **Grupo de WhatsApp da turma:**\n${cohort.whatsapp_link}`;
          }

          soloMessage += `\n\n🎯 Entre no grupo e conecte-se com os outros founders da turma! Boa sorte na jornada!`;

          // Send direct message
          const { error: messageError } = await supabase
            .from("messages")
            .insert({
              conversation_id: conversationId,
              sender_id: ADMIN_USER_ID,
              content: soloMessage,
              read_at: null,
            });

          if (messageError) {
            console.error(`[introduce-acceleration-teams] Failed to send solo message:`, messageError);
            errors.push(`Erro ao enviar mensagem para ${team.startup_name}`);
            continue;
          }

          // Create notification for solo member
          await supabase.from("notifications").insert({
            user_id: soloMember.id,
            type: "team_introduction",
            title: `Você foi adicionado ao time ${team.startup_name}!`,
            message: `Confira sua mensagem de boas-vindas na aba de mensagens.`,
            sent_push: false,
          });

          // Mark team as introduced
          await supabase
            .from("acceleration_teams")
            .update({ introductions_sent_at: new Date().toISOString() })
            .eq("id", team.id);

          introducedCount++;
          console.log(`[introduce-acceleration-teams] Successfully sent solo welcome to: ${team.startup_name}`);
          continue;

        } catch (e) {
          console.error(`[introduce-acceleration-teams] Error processing solo team ${team.startup_name}:`, e);
          errors.push(`Erro ao processar time solo ${team.startup_name}`);
          continue;
        }
      }

      try {
        // Create group conversation
        const groupName = `Time: ${team.startup_name || 'Aceleração'}`;
        
        const { data: groupConversation, error: groupError } = await supabase
          .from("group_conversations")
          .insert({
            name: groupName,
            type: "TEAM_INTRODUCTION",
            created_by: ADMIN_USER_ID,
            last_message_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (groupError || !groupConversation) {
          console.error(`[introduce-acceleration-teams] Failed to create group for ${team.startup_name}:`, groupError);
          errors.push(`Erro ao criar grupo para ${team.startup_name}`);
          continue;
        }

        // Add all members + admin as bot
        const membersToInsert = [
          { conversation_id: groupConversation.id, user_id: ADMIN_USER_ID, role: "BOT" },
          ...members.map(m => ({
            conversation_id: groupConversation.id,
            user_id: m.id,
            role: "MEMBER",
          })),
        ];

        const { error: membersError } = await supabase
          .from("group_conversation_members")
          .insert(membersToInsert);

        if (membersError) {
          console.error(`[introduce-acceleration-teams] Failed to add members:`, membersError);
          await supabase.from("group_conversations").delete().eq("id", groupConversation.id);
          errors.push(`Erro ao adicionar membros para ${team.startup_name}`);
          continue;
        }

        // Build introduction message
        const memberLines = members.map(m => {
          const phone = m.phone ? `📱 ${m.phone}` : "📱 Não informado";
          const email = m.email ? `📧 ${m.email}` : "📧 Não informado";
          const archetype = m.archetype === "BUILDER" ? "🔧 Builder" : 
                           m.archetype === "SELLER" ? "💼 Seller" : 
                           "⭐ Starter";
          return `**@${m.username}** (${archetype})\n${phone}\n${email}`;
        }).join("\n\n");

        let message = `🚀 **Bem-vindos ao programa de aceleração!**\n\n` +
          `Vocês formam o time **${team.startup_name || 'Aceleração'}** na turma **${cohort.name}**!\n\n` +
          `📋 **Contatos do time:**\n\n${memberLines}`;

        // Add WhatsApp link if available
        if (cohort.whatsapp_link) {
          message += `\n\n💬 **Grupo de WhatsApp da turma:**\n${cohort.whatsapp_link}`;
        }

        message += `\n\n🎯 Aproveitem para se conectar agora e começar a trabalhar juntos! Boa sorte na jornada!`;

        // Send message
        const { error: messageError } = await supabase
          .from("messages")
          .insert({
            group_conversation_id: groupConversation.id,
            sender_id: ADMIN_USER_ID,
            content: message,
            read_at: null,
          });

        if (messageError) {
          console.error(`[introduce-acceleration-teams] Failed to send message:`, messageError);
        }

        // Create notifications for each member
        for (const member of members) {
          await supabase.from("notifications").insert({
            user_id: member.id,
            type: "team_introduction",
            title: `Você foi adicionado ao time ${team.startup_name}!`,
            message: `Confira os contatos dos seus parceiros na aba de mensagens.`,
            sent_push: false,
          });
        }

        // Mark team as introduced
        await supabase
          .from("acceleration_teams")
          .update({ introductions_sent_at: new Date().toISOString() })
          .eq("id", team.id);

        introducedCount++;
        console.log(`[introduce-acceleration-teams] Successfully introduced team: ${team.startup_name}`);

      } catch (e) {
        console.error(`[introduce-acceleration-teams] Error processing team ${team.startup_name}:`, e);
        errors.push(`Erro ao processar ${team.startup_name}`);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: `${introducedCount} time(s) apresentado(s) com sucesso!`,
      introduced: introducedCount,
      errors: errors.length > 0 ? errors : undefined,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[introduce-acceleration-teams] Error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
