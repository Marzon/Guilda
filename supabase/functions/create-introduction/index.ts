import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateIntroductionRequest {
  introducedId: string;   // C - quem está sendo apresentado
  recipientId: string;    // A - quem recebe a apresentação
  message: string;        // Mensagem de introdução
  projectId?: string;     // Opcional - projeto relacionado
  roleId?: string;        // Opcional - vaga relacionada
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    // Auth check - require valid user JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.log("[create-introduction] Missing authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
    
    // Validate user JWT to get introducer ID
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) {
      console.log("[create-introduction] Invalid user token:", authError?.message);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const introducerId = user.id; // B - quem está apresentando
    console.log("[create-introduction] Introducer:", introducerId);

    const requestBody: CreateIntroductionRequest = await req.json();
    const { introducedId, recipientId, message, projectId, roleId } = requestBody;

    // Validations
    if (!introducedId || !recipientId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: introducedId and recipientId" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!message || message.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Introduction message is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate all users are different
    const uniqueUsers = new Set([introducerId, introducedId, recipientId]);
    if (uniqueUsers.size !== 3) {
      return new Response(
        JSON.stringify({ error: "All three participants must be different users" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("[create-introduction] Creating introduction:", { 
      introducerId, 
      introducedId, 
      recipientId, 
      projectId, 
      roleId 
    });

    // Get profiles for all participants (with archetype for richer context)
    const { data: profiles, error: profilesError } = await supabaseClient
      .from("profiles")
      .select("id, username, archetype, bio")
      .in("id", [introducerId, introducedId, recipientId]);

    if (profilesError || !profiles || profiles.length !== 3) {
      console.error("[create-introduction] Error fetching profiles:", profilesError);
      return new Response(
        JSON.stringify({ error: "One or more users not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const introducerProfile = profiles.find(p => p.id === introducerId);
    const introducedProfile = profiles.find(p => p.id === introducedId);
    const recipientProfile = profiles.find(p => p.id === recipientId);

    // Get project and role info if provided
    let projectTitle = "";
    let roleName = "";
    
    if (projectId) {
      const { data: project } = await supabaseClient
        .from("projects")
        .select("title")
        .eq("id", projectId)
        .single();
      projectTitle = project?.title || "";
    }

    if (roleId) {
      const { data: role } = await supabaseClient
        .from("project_roles")
        .select("role_name")
        .eq("id", roleId)
        .single();
      roleName = role?.role_name || "";
    }

    // Generate group conversation name
    let groupName = `Introdução: ${introducedProfile?.username} → ${recipientProfile?.username}`;
    if (projectTitle) {
      groupName = `Introdução para ${projectTitle}`;
      if (roleName) {
        groupName += ` (${roleName})`;
      }
    }

    // 1. Create group conversation
    const { data: groupConversation, error: groupError } = await supabaseClient
      .from("group_conversations")
      .insert({
        name: groupName,
        type: projectId ? "INTRODUCTION" : "GENERAL",
        project_id: projectId || null,
        role_id: roleId || null,
        created_by: introducerId,
        last_message_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (groupError || !groupConversation) {
      console.error("[create-introduction] Error creating group conversation:", groupError);
      return new Response(
        JSON.stringify({ error: "Failed to create group conversation" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("[create-introduction] Created group conversation:", groupConversation.id);

    // 2. Add members to the group
    const membersToInsert = [
      { conversation_id: groupConversation.id, user_id: introducerId, role: "INTRODUCER" },
      { conversation_id: groupConversation.id, user_id: introducedId, role: "INTRODUCED" },
      { conversation_id: groupConversation.id, user_id: recipientId, role: "RECIPIENT" },
    ];

    const { error: membersError } = await supabaseClient
      .from("group_conversation_members")
      .insert(membersToInsert);

    if (membersError) {
      console.error("[create-introduction] Error adding members:", membersError);
      // Cleanup: delete the group conversation
      await supabaseClient.from("group_conversations").delete().eq("id", groupConversation.id);
      return new Response(
        JSON.stringify({ error: "Failed to add group members" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("[create-introduction] Added 3 members to group");

    // 3. Create founder_introduction record
    const { data: introduction, error: introError } = await supabaseClient
      .from("founder_introductions")
      .insert({
        introducer_id: introducerId,
        introduced_id: introducedId,
        recipient_id: recipientId,
        project_id: projectId || null,
        role_id: roleId || null,
        group_conversation_id: groupConversation.id,
        message: message.trim(),
        status: "ACTIVE",
      })
      .select()
      .single();

    if (introError) {
      console.error("[create-introduction] Error creating introduction:", introError);
      // Cleanup
      await supabaseClient.from("group_conversations").delete().eq("id", groupConversation.id);
      return new Response(
        JSON.stringify({ error: "Failed to create introduction record" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("[create-introduction] Created introduction record:", introduction.id);

    // 4. Insert automatic introduction message (humanized format)
    let autoMessage = `👋 Olá! Eu sou **${introducerProfile?.username}**, embaixador da Guilda! Eu estava analisando o perfil de vocês dois e acredito que podem se complementar.\n\n`;
    
    // User's custom message (quoted)
    autoMessage += `"${message.trim()}"\n\n`;
    
    // Natural mention of job vacancy if exists
    if (projectTitle && roleName) {
      autoMessage += `📋 Aproveito para falar da vaga de **${roleName}** publicada na startup **${projectTitle}**.\n\n`;
    } else if (projectTitle) {
      autoMessage += `📋 Esta introdução é relacionada à startup **${projectTitle}**.\n\n`;
    }
    
    // Humanized signature
    autoMessage += `Abraços\n**${introducerProfile?.username}**`;

    const { error: messageError } = await supabaseClient
      .from("messages")
      .insert({
        group_conversation_id: groupConversation.id,
        sender_id: introducerId,
        content: autoMessage,
      });

    if (messageError) {
      console.error("[create-introduction] Error inserting message:", messageError);
      // Don't fail completely, the introduction is created
    }

    console.log("[create-introduction] Inserted introduction message");

    // 5. Create notifications for recipient and introduced
    const notificationsToCreate = [
      {
        user_id: recipientId,
        type: "founder_introduction",
        title: "Nova apresentação de founder!",
        message: `${introducerProfile?.username} está te apresentando para ${introducedProfile?.username}${projectTitle ? ` para ${projectTitle}` : ""}`,
        related_user_id: introducerId,
        action_url: `/messages?group=${groupConversation.id}`,
      },
      {
        user_id: introducedId,
        type: "founder_introduction",
        title: "Você foi apresentado!",
        message: `${introducerProfile?.username} está te apresentando para ${recipientProfile?.username}${projectTitle ? ` para ${projectTitle}` : ""}`,
        related_user_id: introducerId,
        action_url: `/messages?group=${groupConversation.id}`,
      },
    ];

    const { data: createdNotifications, error: notifError } = await supabaseClient
      .from("notifications")
      .insert(notificationsToCreate)
      .select('id, user_id');

    if (notifError) {
      console.error("[create-introduction] Error creating notifications:", notifError);
    }

    console.log("[create-introduction] Created notifications:", createdNotifications);

    // Get notification IDs for each user
    const recipientNotifId = createdNotifications?.find(n => n.user_id === recipientId)?.id;
    const introducedNotifId = createdNotifications?.find(n => n.user_id === introducedId)?.id;

    // 6. Send push notifications
    try {
      // Push to recipient
      await supabaseClient.functions.invoke("send-push-notification", {
        body: {
          userId: recipientId,
          title: "Nova apresentação de founder! 🤝",
          body: `${introducerProfile?.username} está te apresentando para ${introducedProfile?.username}`,
          type: "founder_introduction",
          url: "/messages",
          notificationId: recipientNotifId,
        },
      });

      // Push to introduced
      await supabaseClient.functions.invoke("send-push-notification", {
        body: {
          userId: introducedId,
          title: "Você foi apresentado! 🎉",
          body: `${introducerProfile?.username} está te apresentando para ${recipientProfile?.username}`,
          type: "founder_introduction",
          url: "/messages",
          notificationId: introducedNotifId,
        },
      });

      console.log("[create-introduction] Sent push notifications");
    } catch (pushError) {
      console.error("[create-introduction] Error sending push:", pushError);
      // Don't fail the request
    }

    // 7. Send email notifications
    try {
      // Email to recipient
      await supabaseClient.functions.invoke("send-notification-email", {
        body: {
          userId: recipientId,
          type: "founder_introduction",
          title: "Nova apresentação de founder!",
          message: `${introducerProfile?.username} está te apresentando para ${introducedProfile?.username}${projectTitle ? ` para o projeto ${projectTitle}` : ""}. Acesse a plataforma para iniciar a conversa!`,
          senderName: introducerProfile?.username,
          senderUsername: introducerProfile?.username,
          introducedName: introducedProfile?.username,
          recipientName: recipientProfile?.username,
          notificationId: recipientNotifId,
        },
      });

      // Email to introduced
      await supabaseClient.functions.invoke("send-notification-email", {
        body: {
          userId: introducedId,
          type: "founder_introduction",
          title: "Você foi apresentado!",
          message: `${introducerProfile?.username} está te apresentando para ${recipientProfile?.username}${projectTitle ? ` para o projeto ${projectTitle}` : ""}. Acesse a plataforma para iniciar a conversa!`,
          senderName: introducerProfile?.username,
          senderUsername: introducerProfile?.username,
          introducedName: introducedProfile?.username,
          recipientName: recipientProfile?.username,
          notificationId: introducedNotifId,
        },
      });

      console.log("[create-introduction] Sent email notifications");
    } catch (emailError) {
      console.error("[create-introduction] Error sending email:", emailError);
      // Don't fail the request
    }

    return new Response(
      JSON.stringify({
        success: true,
        introduction: introduction,
        groupConversationId: groupConversation.id,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("[create-introduction] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
