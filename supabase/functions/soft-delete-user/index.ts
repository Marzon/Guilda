import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Verify admin authorization
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get caller's user and check if admin
    const token = authHeader.replace("Bearer ", "");
    const { data: { user: caller }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !caller) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid authorization" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if caller is admin
    const { data: adminRole } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id)
      .eq("role", "admin")
      .single();

    const { userId, reason } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ success: false, error: "userId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const isAdmin = !!adminRole;
    const isSelfDelete = caller.id === userId;

    // Allow if admin OR self-delete
    if (!isAdmin && !isSelfDelete) {
      console.log(`[SOFT-DELETE] Unauthorized: caller ${caller.id} trying to delete ${userId}`);
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized - can only delete your own account" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[SOFT-DELETE] Authorization OK - isAdmin: ${isAdmin}, isSelfDelete: ${isSelfDelete}`);
    console.log(`[SOFT-DELETE] Starting deletion for user: ${userId}`);

    // Get the user's profile first
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      console.log(`[SOFT-DELETE] Profile not found: ${profileError?.message}`);
      return new Response(
        JSON.stringify({ success: false, error: "Profile not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[SOFT-DELETE] Found profile: ${profile.username}`);

    // Get the user's email from auth
    const { data: { user: targetUser }, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
    
    if (userError || !targetUser) {
      console.log(`[SOFT-DELETE] User not found in auth: ${userError?.message}`);
      return new Response(
        JSON.stringify({ success: false, error: "User not found in auth" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[SOFT-DELETE] Found auth user: ${targetUser.email}`);
    console.log(`[SOFT-DELETE] Starting cleanup of dependent records...`);

    // =========================================================
    // STEP 1: Delete from group_conversation_members FIRST
    // =========================================================
    console.log(`[SOFT-DELETE] Step 1: Removing group_conversation_members...`);
    const { error: groupMembersError, count: groupMembersCount } = await supabaseAdmin
      .from("group_conversation_members")
      .delete()
      .eq("user_id", userId);
    
    if (groupMembersError) {
      console.log(`[SOFT-DELETE] Step 1 ERROR: ${groupMembersError.message}`);
    } else {
      console.log(`[SOFT-DELETE] Step 1 OK: Removed group members`);
    }

    // =========================================================
    // STEP 2: Delete ALL messages sent by user (any context)
    // =========================================================
    console.log(`[SOFT-DELETE] Step 2: Removing messages sent by user...`);
    const { error: senderMessagesError, count: senderMsgCount } = await supabaseAdmin
      .from("messages")
      .delete()
      .eq("sender_id", userId);
    
    if (senderMessagesError) {
      console.log(`[SOFT-DELETE] Step 2 ERROR: ${senderMessagesError.message}`);
    } else {
      console.log(`[SOFT-DELETE] Step 2 OK: Removed messages by sender`);
    }

    // =========================================================
    // STEP 3: Get and delete conversations
    // =========================================================
    console.log(`[SOFT-DELETE] Step 3: Getting conversations...`);
    const { data: conversations, error: convQueryError } = await supabaseAdmin
      .from("conversations")
      .select("id")
      .or(`participant_1.eq.${userId},participant_2.eq.${userId}`);
    
    if (convQueryError) {
      console.log(`[SOFT-DELETE] Step 3 ERROR querying conversations: ${convQueryError.message}`);
    }

    console.log(`[SOFT-DELETE] Step 3: Found ${conversations?.length || 0} conversations`);
    
    if (conversations && conversations.length > 0) {
      const conversationIds = conversations.map(c => c.id);
      console.log(`[SOFT-DELETE] Step 3a: Conversation IDs: ${conversationIds.join(', ')}`);
      
      // Delete ALL messages in these conversations (including from other users)
      console.log(`[SOFT-DELETE] Step 3b: Deleting all messages in conversations...`);
      const { error: convMessagesError } = await supabaseAdmin
        .from("messages")
        .delete()
        .in("conversation_id", conversationIds);
      
      if (convMessagesError) {
        console.log(`[SOFT-DELETE] Step 3b ERROR: ${convMessagesError.message}`);
      } else {
        console.log(`[SOFT-DELETE] Step 3b OK: Removed conversation messages`);
      }
      
      // Now delete the conversations
      console.log(`[SOFT-DELETE] Step 3c: Deleting conversations...`);
      const { error: conversationsError } = await supabaseAdmin
        .from("conversations")
        .delete()
        .in("id", conversationIds);
      
      if (conversationsError) {
        console.log(`[SOFT-DELETE] Step 3c ERROR: ${conversationsError.message}`);
        // This is likely the foreign key error - return details
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Failed to delete conversations: ${conversationsError.message}`,
            details: {
              step: "3c",
              conversationIds,
              error: conversationsError
            }
          }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else {
        console.log(`[SOFT-DELETE] Step 3c OK: Removed ${conversationIds.length} conversations`);
      }
    }

    // =========================================================
    // STEP 4: Delete group conversations created by user
    // =========================================================
    console.log(`[SOFT-DELETE] Step 4: Getting group conversations...`);
    const { data: groupConvs } = await supabaseAdmin
      .from("group_conversations")
      .select("id")
      .eq("created_by", userId);
    
    if (groupConvs && groupConvs.length > 0) {
      const groupConvIds = groupConvs.map(c => c.id);
      console.log(`[SOFT-DELETE] Step 4a: Found ${groupConvIds.length} group conversations`);
      
      // Delete messages in these group conversations
      console.log(`[SOFT-DELETE] Step 4b: Deleting messages in group conversations...`);
      const { error: groupMsgError } = await supabaseAdmin
        .from("messages")
        .delete()
        .in("group_conversation_id", groupConvIds);
      
      if (groupMsgError) {
        console.log(`[SOFT-DELETE] Step 4b ERROR: ${groupMsgError.message}`);
      }
      
      // Delete group conversation members
      console.log(`[SOFT-DELETE] Step 4c: Deleting group conversation members...`);
      const { error: groupMemError } = await supabaseAdmin
        .from("group_conversation_members")
        .delete()
        .in("conversation_id", groupConvIds);
      
      if (groupMemError) {
        console.log(`[SOFT-DELETE] Step 4c ERROR: ${groupMemError.message}`);
      }
      
      // Delete the group conversations
      console.log(`[SOFT-DELETE] Step 4d: Deleting group conversations...`);
      const { error: groupConvError } = await supabaseAdmin
        .from("group_conversations")
        .delete()
        .in("id", groupConvIds);
      
      if (groupConvError) {
        console.log(`[SOFT-DELETE] Step 4d ERROR: ${groupConvError.message}`);
      } else {
        console.log(`[SOFT-DELETE] Step 4d OK: Removed group conversations`);
      }
    } else {
      console.log(`[SOFT-DELETE] Step 4: No group conversations found`);
    }

    // =========================================================
    // STEP 5: Remove matches
    // =========================================================
    console.log(`[SOFT-DELETE] Step 5: Removing matches...`);
    const { error: matchesError } = await supabaseAdmin
      .from("matches")
      .delete()
      .or(`requester_id.eq.${userId},target_id.eq.${userId}`);
    
    if (matchesError) {
      console.log(`[SOFT-DELETE] Step 5 ERROR: ${matchesError.message}`);
    } else {
      console.log(`[SOFT-DELETE] Step 5 OK: Removed matches`);
    }

    // =========================================================
    // STEP 6: Remove notifications
    // =========================================================
    console.log(`[SOFT-DELETE] Step 6: Removing notifications...`);
    const { error: notificationsError } = await supabaseAdmin
      .from("notifications")
      .delete()
      .or(`user_id.eq.${userId},related_user_id.eq.${userId}`);
    
    if (notificationsError) {
      console.log(`[SOFT-DELETE] Step 6 ERROR: ${notificationsError.message}`);
    } else {
      console.log(`[SOFT-DELETE] Step 6 OK: Removed notifications`);
    }

    // =========================================================
    // STEP 7: Remove profile views
    // =========================================================
    console.log(`[SOFT-DELETE] Step 7: Removing profile views...`);
    const { error: viewsError } = await supabaseAdmin
      .from("profile_views")
      .delete()
      .or(`viewer_id.eq.${userId},viewed_profile_id.eq.${userId}`);
    
    if (viewsError) {
      console.log(`[SOFT-DELETE] Step 7 ERROR: ${viewsError.message}`);
    } else {
      console.log(`[SOFT-DELETE] Step 7 OK: Removed profile views`);
    }

    // =========================================================
    // STEP 8: Remove founder introductions
    // =========================================================
    console.log(`[SOFT-DELETE] Step 8: Removing founder introductions...`);
    const { error: introductionsError } = await supabaseAdmin
      .from("founder_introductions")
      .delete()
      .or(`introducer_id.eq.${userId},introduced_id.eq.${userId},recipient_id.eq.${userId}`);
    
    if (introductionsError) {
      console.log(`[SOFT-DELETE] Step 8 ERROR: ${introductionsError.message}`);
    } else {
      console.log(`[SOFT-DELETE] Step 8 OK: Removed introductions`);
    }

    // =========================================================
    // STEP 9: Remove user skills
    // =========================================================
    console.log(`[SOFT-DELETE] Step 9: Removing user skills...`);
    const { error: skillsError } = await supabaseAdmin
      .from("user_skills")
      .delete()
      .eq("user_id", userId);
    
    if (skillsError) {
      console.log(`[SOFT-DELETE] Step 9 ERROR: ${skillsError.message}`);
    } else {
      console.log(`[SOFT-DELETE] Step 9 OK: Removed skills`);
    }

    // =========================================================
    // STEP 10: Remove project applications
    // =========================================================
    console.log(`[SOFT-DELETE] Step 10: Removing project applications...`);
    const { error: applicationsError } = await supabaseAdmin
      .from("project_applications")
      .delete()
      .eq("applicant_id", userId);
    
    if (applicationsError) {
      console.log(`[SOFT-DELETE] Step 10 ERROR: ${applicationsError.message}`);
    } else {
      console.log(`[SOFT-DELETE] Step 10 OK: Removed applications`);
    }

    // =========================================================
    // STEP 11: Remove project members
    // =========================================================
    console.log(`[SOFT-DELETE] Step 11: Removing project members...`);
    const { error: membersError } = await supabaseAdmin
      .from("project_members")
      .delete()
      .eq("user_id", userId);
    
    if (membersError) {
      console.log(`[SOFT-DELETE] Step 11 ERROR: ${membersError.message}`);
    } else {
      console.log(`[SOFT-DELETE] Step 11 OK: Removed project members`);
    }

    // =========================================================
    // STEP 12: Remove projects (and their dependencies)
    // =========================================================
    console.log(`[SOFT-DELETE] Step 12: Getting user's projects...`);
    const { data: projects } = await supabaseAdmin
      .from("projects")
      .select("id")
      .eq("owner_id", userId);
    
    if (projects && projects.length > 0) {
      const projectIds = projects.map(p => p.id);
      console.log(`[SOFT-DELETE] Step 12a: Found ${projectIds.length} projects`);
      
      // Delete project dependencies first
      await supabaseAdmin.from("project_roles").delete().in("project_id", projectIds);
      await supabaseAdmin.from("project_tags").delete().in("project_id", projectIds);
      await supabaseAdmin.from("project_links").delete().in("project_id", projectIds);
      await supabaseAdmin.from("project_updates").delete().in("project_id", projectIds);
      await supabaseAdmin.from("project_comments").delete().in("project_id", projectIds);
      await supabaseAdmin.from("project_favorites").delete().in("project_id", projectIds);
      await supabaseAdmin.from("project_views").delete().in("project_id", projectIds);
      await supabaseAdmin.from("project_applications").delete().in("project_id", projectIds);
      await supabaseAdmin.from("project_members").delete().in("project_id", projectIds);
      
      console.log(`[SOFT-DELETE] Step 12b: Deleted project dependencies`);
      
      // Now delete projects
      const { error: projectsError } = await supabaseAdmin
        .from("projects")
        .delete()
        .in("id", projectIds);
      
      if (projectsError) {
        console.log(`[SOFT-DELETE] Step 12c ERROR: ${projectsError.message}`);
      } else {
        console.log(`[SOFT-DELETE] Step 12c OK: Removed ${projectIds.length} projects`);
      }
    } else {
      console.log(`[SOFT-DELETE] Step 12: No projects found`);
    }

    // =========================================================
    // STEP 13: Remove other user data
    // =========================================================
    console.log(`[SOFT-DELETE] Step 13: Removing other user data...`);
    
    // Email preferences
    await supabaseAdmin.from("email_preferences").delete().eq("user_id", userId);
    
    // Push subscriptions
    await supabaseAdmin.from("push_subscriptions").delete().eq("user_id", userId);
    
    // Daily/monthly limits
    await supabaseAdmin.from("daily_limits").delete().eq("user_id", userId);
    await supabaseAdmin.from("monthly_message_limits").delete().eq("user_id", userId);
    
    // Profile boosts
    await supabaseAdmin.from("profile_boosts").delete().eq("user_id", userId);
    
    // Profile reactions (both directions)
    await supabaseAdmin.from("profile_reactions").delete().or(`reactor_id.eq.${userId},target_id.eq.${userId}`);
    
    // Saved calculations
    await supabaseAdmin.from("saved_calculations").delete().eq("user_id", userId);
    
    // Email rate limits
    await supabaseAdmin.from("email_rate_limits").delete().eq("user_id", userId);
    
    // Pending email digests
    await supabaseAdmin.from("pending_email_digests").delete().or(`user_id.eq.${userId},related_user_id.eq.${userId}`);
    
    // Payment receipts
    await supabaseAdmin.from("payment_receipts").delete().eq("user_id", userId);
    
    console.log(`[SOFT-DELETE] Step 13 OK: Removed additional user data`);

    // =========================================================
    // STEP 14: Delete the profile (trigger will archive)
    // =========================================================
    console.log(`[SOFT-DELETE] Step 14: Deleting profile...`);
    const { error: deleteProfileError } = await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (deleteProfileError) {
      console.error(`[SOFT-DELETE] Step 14 ERROR: ${deleteProfileError.message}`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Failed to delete profile: " + deleteProfileError.message,
          details: { step: "14", error: deleteProfileError }
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[SOFT-DELETE] Step 14 OK: Profile deleted (archived by trigger)`);

    // =========================================================
    // STEP 15: Update deleted_profiles with deletion info
    // =========================================================
    console.log(`[SOFT-DELETE] Step 15: Updating deleted_profiles...`);
    await supabaseAdmin
      .from("deleted_profiles")
      .update({
        deleted_by: caller.id,
        deletion_reason: reason || null,
      })
      .eq("id", userId);

    // =========================================================
    // STEP 16: Delete from auth
    // =========================================================
    console.log(`[SOFT-DELETE] Step 16: Deleting from auth...`);
    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteAuthError) {
      console.error(`[SOFT-DELETE] Step 16 ERROR: ${deleteAuthError.message}`);
    } else {
      console.log(`[SOFT-DELETE] Step 16 OK: Removed from auth`);
    }

    // =========================================================
    // STEP 17: Log the action with FULL profile data for recovery
    // =========================================================
    console.log(`[SOFT-DELETE] Step 17: Logging audit with full profile data...`);
    await supabaseAdmin.from("admin_audit_log").insert({
      admin_id: caller.id,
      action: "SOFT_DELETE_USER",
      target_table: "profiles",
      target_id: userId,
      old_value: { 
        // Full profile data for recovery purposes
        username: profile.username, 
        email: targetUser.email,
        archetype: profile.archetype,
        bio: profile.bio,
        stats: profile.stats,
        main_skills: profile.main_skills,
        xp_level: profile.xp_level,
        avatar_url: profile.avatar_url,
        looking_for: profile.looking_for,
        offering: profile.offering,
        phone: profile.phone,
        signup_source: profile.signup_source,
        signup_source_other: profile.signup_source_other,
        original_created_at: profile.created_at
      },
      new_value: { deleted_at: new Date().toISOString(), reason },
    });

    console.log(`[SOFT-DELETE] SUCCESS: User ${profile.username} (${targetUser.email}) deleted`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `User ${profile.username} (${targetUser.email}) soft deleted successfully`
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("[SOFT-DELETE] FATAL ERROR:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
