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

    if (!adminRole) {
      return new Response(
        JSON.stringify({ success: false, error: "Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { profileId } = await req.json();

    if (!profileId) {
      return new Response(
        JSON.stringify({ success: false, error: "profileId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the deleted profile data
    const { data: deletedProfile, error: fetchError } = await supabaseAdmin
      .from("deleted_profiles")
      .select("*")
      .eq("id", profileId)
      .single();

    if (fetchError || !deletedProfile) {
      return new Response(
        JSON.stringify({ success: false, error: "Deleted profile not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user exists in auth.users with this email
    const { data: { users: existingUsers } } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.find(u => u.email === deletedProfile.email);

    let targetUserId = profileId;

    if (existingUser) {
      // User exists in auth, use their current ID
      targetUserId = existingUser.id;
    }

    // Check if a profile already exists for this user (shouldn't happen but let's be safe)
    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("id", targetUserId)
      .single();

    if (existingProfile) {
      // Profile already exists - just remove from deleted_profiles
      await supabaseAdmin
        .from("deleted_profiles")
        .delete()
        .eq("id", profileId);

      return new Response(
        JSON.stringify({ success: true, message: "Profile already exists, removed from trash" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Reinsert the profile
    const { error: insertError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: targetUserId,
        username: deletedProfile.username,
        archetype: deletedProfile.archetype,
        bio: deletedProfile.bio,
        main_skills: deletedProfile.main_skills,
        stats: deletedProfile.stats,
        xp_level: deletedProfile.xp_level,
        avatar_url: deletedProfile.avatar_url,
        looking_for: deletedProfile.looking_for,
        offering: deletedProfile.offering,
        signup_source: deletedProfile.signup_source,
        signup_source_other: deletedProfile.signup_source_other,
        phone: deletedProfile.phone,
        created_at: deletedProfile.original_created_at || new Date().toISOString(),
      });

    if (insertError) {
      console.error("Error reinserting profile:", insertError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to reactivate profile: " + insertError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Remove from deleted_profiles
    await supabaseAdmin
      .from("deleted_profiles")
      .delete()
      .eq("id", profileId);

    // Log the action
    await supabaseAdmin.from("admin_audit_log").insert({
      admin_id: caller.id,
      action: "REACTIVATE_PROFILE",
      target_table: "profiles",
      target_id: targetUserId,
      old_value: { deleted_at: deletedProfile.deleted_at },
      new_value: { reactivated_at: new Date().toISOString() },
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Profile ${deletedProfile.username} reactivated successfully`,
        userId: targetUserId
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Error in reactivate-profile:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
