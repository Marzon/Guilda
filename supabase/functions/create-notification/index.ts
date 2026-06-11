import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateNotificationRequest {
  userId?: string;
  type: 'match_request' | 'match_accepted' | 'new_message' | 'project_comment' | 'comment_like';
  title?: string;
  message?: string;
  relatedUserId?: string;
  relatedMatchId?: string;
  sendEmail?: boolean;
  // For project comments
  projectId?: string;
  commentId?: string;
  parentId?: string;
  // For comment likes
  likerId?: string;
  // For messages
  conversationId?: string;
  senderName?: string;
}

// Check if user should receive email (push-first strategy)
async function shouldSendEmail(
  supabaseClient: any,
  userId: string,
  type: string
): Promise<{ shouldSend: boolean; reason: string; useDigest: boolean }> {
  // Check quiet mode first
  const { data: prefs } = await supabaseClient
    .from("email_preferences")
    .select("*, message_frequency, quiet_mode, quiet_mode_until")
    .eq("user_id", userId)
    .single();

  if (prefs?.quiet_mode) {
    if (!prefs.quiet_mode_until || new Date(prefs.quiet_mode_until) > new Date()) {
      return { shouldSend: false, reason: "quiet_mode", useDigest: false };
    }
  }

  // Check specific preference for type
  const prefMapping: Record<string, string> = {
    match_request: 'match_request',
    match_accepted: 'match_accepted',
    new_message: 'new_message',
    project_invite: 'project_invite',
    founder_introduction: 'match_request',
  };

  const prefField = prefMapping[type];
  if (prefs && prefField && !(prefs as any)[prefField]) {
    return { shouldSend: false, reason: "preference_disabled", useDigest: false };
  }

  // For new_message, check message_frequency preference
  if (type === "new_message") {
    const messageFreq = prefs?.message_frequency || "digest";
    
    if (messageFreq === "never") {
      return { shouldSend: false, reason: "message_frequency_never", useDigest: false };
    }
    
    if (messageFreq === "digest" || messageFreq === "daily") {
      return { shouldSend: false, reason: "use_digest", useDigest: true };
    }
    
    // messageFreq === "instant" - continue to check push-first
  }

  // Push-first strategy: check if user was recently active with push enabled
  const { data: profile } = await supabaseClient
    .from("profiles")
    .select("last_seen_at")
    .eq("id", userId)
    .single();

  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
  const wasRecentlyActive = profile?.last_seen_at && 
    new Date(profile.last_seen_at) > fifteenMinutesAgo;

  const { count: pushCount } = await supabaseClient
    .from("push_subscriptions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  const hasPush = (pushCount || 0) > 0;

  if (wasRecentlyActive && hasPush) {
    return { shouldSend: false, reason: "push_first_active", useDigest: false };
  }

  // Check rate limiting
  const { data: rateLimit } = await supabaseClient
    .from("email_rate_limits")
    .select("*")
    .eq("user_id", userId)
    .eq("email_type", type)
    .single();

  const today = new Date().toISOString().split('T')[0];
  
  const limits: Record<string, number> = {
    new_message: 3,
    match_request: 5,
    match_accepted: 5,
    project_comment: 3,
  };

  const maxPerDay = limits[type] || 10;
  
  if (rateLimit && rateLimit.reset_date === today && rateLimit.count_today >= maxPerDay) {
    return { shouldSend: false, reason: "rate_limited", useDigest: type === "new_message" };
  }

  return { shouldSend: true, reason: "ok", useDigest: false };
}

// Update rate limit after sending email
async function updateRateLimit(supabaseClient: any, userId: string, emailType: string) {
  const today = new Date().toISOString().split('T')[0];
  
  const { data: existing } = await supabaseClient
    .from("email_rate_limits")
    .select("*")
    .eq("user_id", userId)
    .eq("email_type", emailType)
    .single();

  await supabaseClient
    .from("email_rate_limits")
    .upsert({
      user_id: userId,
      email_type: emailType,
      last_sent_at: new Date().toISOString(),
      count_today: existing?.reset_date === today ? (existing.count_today || 0) + 1 : 1,
      reset_date: today,
    }, { onConflict: "user_id,email_type" });
}

// Add message to digest queue
async function addToDigestQueue(
  supabaseClient: any,
  userId: string,
  type: string,
  title: string,
  message: string,
  metadata: Record<string, any>
) {
  await supabaseClient
    .from("pending_email_digests")
    .insert({
      user_id: userId,
      notification_type: type,
      title,
      message,
      metadata,
      related_user_id: metadata.relatedUserId,
      related_conversation_id: metadata.conversationId,
    });
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    
    // Authentication check - require either service role key or valid user JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.log("[create-notification] Missing authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
    
    // Check if it's service role key (for internal calls from other edge functions)
    const token = authHeader.replace("Bearer ", "");
    const isServiceRole = token === supabaseServiceKey;
    
    if (!isServiceRole) {
      // Validate user JWT
      const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
      if (authError || !user) {
        console.log("[create-notification] Invalid user token:", authError?.message);
        return new Response(
          JSON.stringify({ error: "Unauthorized" }),
          { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      console.log("[create-notification] Authenticated user:", user.email);
    } else {
      console.log("[create-notification] Service role authenticated");
    }

    const requestBody: CreateNotificationRequest = await req.json();
    const { 
      userId, 
      type, 
      title, 
      message, 
      relatedUserId, 
      relatedMatchId,
      sendEmail = true,
      projectId,
      commentId,
      parentId,
      conversationId,
      senderName,
    } = requestBody;

    console.log("[create-notification] Creating notification:", { 
      type, 
      userId, 
      projectId, 
      commentId,
      likerId: requestBody.likerId 
    });

    // Handle comment like notifications
    if (type === "comment_like" && commentId && projectId && requestBody.likerId) {
      console.log("[create-notification] Processing comment_like notification");
      const { likerId } = requestBody;

      // Get comment details
      const { data: comment, error: commentError } = await supabaseClient
        .from("project_comments")
        .select("id, content, author_id")
        .eq("id", commentId)
        .single();

      if (commentError || !comment) {
        console.error("Comment not found:", commentError);
        return new Response(
          JSON.stringify({ error: "Comment not found" }),
          { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Don't notify if user liked their own comment
      if (comment.author_id === likerId) {
        return new Response(
          JSON.stringify({ success: true, skipped: "self-like" }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Get liker profile
      const { data: likerProfile } = await supabaseClient
        .from("profiles")
        .select("username")
        .eq("id", likerId)
        .single();

      // Get project details
      const { data: project } = await supabaseClient
        .from("projects")
        .select("title")
        .eq("id", projectId)
        .single();

      const likerName = likerProfile?.username || "Alguém";
      const projectTitle = project?.title || "um projeto";
      const truncatedContent = comment.content.length > 30 
        ? comment.content.substring(0, 30) + "..." 
        : comment.content;

      // Create notification for comment author
      const { error: insertError } = await supabaseClient
        .from("notifications")
        .insert({
          user_id: comment.author_id,
          type: "comment_like",
          title: "Seu comentário recebeu uma curtida!",
          message: `${likerName} curtiu seu comentário em "${projectTitle}": "${truncatedContent}"`,
          related_user_id: likerId,
        });

      if (insertError) {
        console.error("Error inserting like notification:", insertError);
      }

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Handle project comment notifications
    if (type === "project_comment" && projectId && commentId) {
      // Get comment details
      const { data: comment, error: commentError } = await supabaseClient
        .from("project_comments")
        .select(`
          id,
          content,
          author_id,
          author:profiles!project_comments_author_id_fkey(username)
        `)
        .eq("id", commentId)
        .single();

      if (commentError || !comment) {
        console.error("Comment not found:", commentError);
        return new Response(
          JSON.stringify({ error: "Comment not found" }),
          { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Get project details
      const { data: project, error: projectError } = await supabaseClient
        .from("projects")
        .select("id, title, owner_id")
        .eq("id", projectId)
        .single();

      if (projectError || !project) {
        console.error("Project not found:", projectError);
        return new Response(
          JSON.stringify({ error: "Project not found" }),
          { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      const authorName = (comment.author as any)?.username || "Alguém";
      const truncatedContent = comment.content.length > 50 
        ? comment.content.substring(0, 50) + "..." 
        : comment.content;

      const notificationsToCreate = [];

      // If it's a reply, notify the parent comment author
      if (parentId) {
        const { data: parentComment } = await supabaseClient
          .from("project_comments")
          .select("author_id")
          .eq("id", parentId)
          .single();

        if (parentComment && parentComment.author_id !== comment.author_id) {
          notificationsToCreate.push({
            user_id: parentComment.author_id,
            type: "comment_reply",
            title: "Nova resposta ao seu comentário",
            message: `${authorName} respondeu ao seu comentário em "${project.title}": "${truncatedContent}"`,
            related_user_id: comment.author_id,
          });
        }
      }

      // Notify project owner (if they didn't write the comment)
      if (project.owner_id !== comment.author_id) {
        notificationsToCreate.push({
          user_id: project.owner_id,
          type: "project_comment",
          title: "Novo comentário no seu projeto",
          message: `${authorName} comentou em "${project.title}": "${truncatedContent}"`,
          related_user_id: comment.author_id,
        });
      }

      // Insert all notifications
      if (notificationsToCreate.length > 0) {
        const { error: insertError } = await supabaseClient
          .from("notifications")
          .insert(notificationsToCreate);

        if (insertError) {
          console.error("Error inserting notifications:", insertError);
        }
      }

      return new Response(
        JSON.stringify({ success: true, notificationsCreated: notificationsToCreate.length }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Original notification flow for other types
    if (!userId || !title || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create notification in database - filter out undefined values
    const insertData: Record<string, any> = {
      user_id: userId,
      type,
      title,
      message,
      read: false,
      sent_email: false,
      sent_push: false,
    };
    
    // Only add optional fields if they are defined
    if (relatedUserId) insertData.related_user_id = relatedUserId;
    if (relatedMatchId) insertData.related_match_id = relatedMatchId;

    console.log("[create-notification] Insert data:", JSON.stringify(insertData));

    const { data: notifications, error: notificationError } = await supabaseClient
      .from("notifications")
      .insert(insertData)
      .select();

    if (notificationError) {
      console.error("Error creating notification:", notificationError);
      return new Response(
        JSON.stringify({ error: notificationError.message }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const notification = notifications?.[0];

    // Try to send push notification first
    try {
      await supabaseClient.functions.invoke("send-push-notification", {
        body: {
          userId,
          title,
          body: message,
          type,
          url: type === "new_message" ? "/messages" : 
               type === "match_request" ? "/matches" : 
               type === "match_accepted" ? "/messages" : "/"
        }
      });
      
      // Update notification to mark push as sent
      await supabaseClient
        .from("notifications")
        .update({ sent_push: true })
        .eq("id", notification.id);
        
      console.log("[create-notification] Push notification sent for:", notification.id);
    } catch (pushError) {
      console.error("[create-notification] Push error:", pushError);
    }

    // Determine if we should send email based on push-first strategy
    if (sendEmail) {
      try {
        const emailDecision = await shouldSendEmail(supabaseClient, userId, type);
        console.log("[create-notification] Email decision:", emailDecision);

        if (emailDecision.useDigest) {
          // Add to digest queue instead of sending immediately
          await addToDigestQueue(supabaseClient, userId, type, title, message, {
            relatedUserId,
            conversationId,
            senderName,
          });
          console.log("[create-notification] Added to digest queue for:", userId);
        } else if (emailDecision.shouldSend) {
          // Get sender info if relatedUserId is provided
          let senderNameResolved = senderName || "";
          let senderUsername = "";
          
          if (relatedUserId && !senderName) {
            const { data: senderProfile } = await supabaseClient
              .from("profiles")
              .select("username")
              .eq("id", relatedUserId)
              .single();
            
            senderNameResolved = senderProfile?.username || "Um aventureiro";
            senderUsername = senderProfile?.username || "";
          }

          // Call email function with notificationId so it can update sent_email after successful send
          await supabaseClient.functions.invoke("send-notification-email", {
            body: {
              userId,
              type,
              title,
              message,
              senderName: senderNameResolved,
              senderUsername,
              notificationId: notification.id,
            },
          });

          // Update rate limit
          await updateRateLimit(supabaseClient, userId, type);

          console.log("[create-notification] Email sent for notification:", notification.id);
        } else {
          console.log("[create-notification] Email skipped:", emailDecision.reason);
        }
      } catch (emailError) {
        console.error("[create-notification] Error sending email notification:", emailError);
        // Don't fail the whole request if email fails
      }
    }

    return new Response(
      JSON.stringify({ success: true, notification }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in create-notification function:", error);
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
