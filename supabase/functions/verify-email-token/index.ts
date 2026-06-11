import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, token } = await req.json();
    
    console.log(`[VerifyToken] Request received - email: ${email}, token: ${token}`);

    if (!email || !token) {
      console.log("[VerifyToken] Missing fields");
      return new Response(
        JSON.stringify({ success: false, error: "missing_fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Check rate limiting: max 5 attempts per email in 15 minutes
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const { count: attemptCount } = await supabaseAdmin
      .from("email_verification_tokens")
      .select("*", { count: "exact", head: true })
      .eq("email", email.toLowerCase())
      .gte("created_at", fifteenMinutesAgo);

    if (attemptCount && attemptCount > 10) {
      return new Response(
        JSON.stringify({ success: false, error: "too_many_attempts" }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Find valid token (case-insensitive)
    const normalizedEmail = email.toLowerCase();
    const normalizedToken = token.toUpperCase();
    const now = new Date().toISOString();
    
    console.log(`[VerifyToken] Looking for token - email: ${normalizedEmail}, token: ${normalizedToken}, now: ${now}`);
    
    const { data: tokenRecord, error: tokenError } = await supabaseAdmin
      .from("email_verification_tokens")
      .select("*")
      .eq("email", normalizedEmail)
      .ilike("token", normalizedToken)
      .is("used_at", null)
      .gt("expires_at", now)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    console.log(`[VerifyToken] Token lookup result:`, { found: !!tokenRecord, error: tokenError?.message, tokenRecord });

    if (tokenError || !tokenRecord) {
      // Check if token exists but is expired
      const { data: expiredToken } = await supabaseAdmin
        .from("email_verification_tokens")
        .select("*")
        .eq("email", email.toLowerCase())
        .ilike("token", token.toUpperCase())
        .is("used_at", null)
        .lte("expires_at", new Date().toISOString())
        .limit(1)
        .single();

      if (expiredToken) {
        return new Response(
          JSON.stringify({ success: false, error: "expired_token" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      return new Response(
        JSON.stringify({ success: false, error: "invalid_token" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Mark token as used
    await supabaseAdmin
      .from("email_verification_tokens")
      .update({ used_at: new Date().toISOString() })
      .eq("id", tokenRecord.id);

    // Find user by email using paginated search
    let user = null;
    let page = 1;
    const perPage = 1000;
    
    while (!user) {
      const { data: usersPage, error: listError } = await supabaseAdmin.auth.admin.listUsers({
        page,
        perPage,
      });
      
      if (listError) {
        console.error("Error listing users:", listError);
        return new Response(
          JSON.stringify({ success: false, error: "verification_failed" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      
      user = usersPage.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
      
      // If we found the user or there are no more pages, break
      if (user || usersPage.users.length < perPage) {
        break;
      }
      
      page++;
    }
    
    if (!user) {
      console.log(`User not found for email: ${email}`);
      return new Response(
        JSON.stringify({ success: false, error: "user_not_found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    
    console.log(`Found user: ${user.id} for email: ${email}`);

    // Update user to confirm email in auth.users
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { email_confirm: true }
    );

    if (updateError) {
      console.error("Error confirming email:", updateError);
      return new Response(
        JSON.stringify({ success: false, error: "verification_failed" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Also update otp_verified in profiles table
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({ otp_verified: true })
      .eq("id", user.id);

    if (profileError) {
      console.error("Error updating profile otp_verified:", profileError);
      // Don't fail the request, email is already confirmed
    }

    console.log(`Email verified successfully for: ${email}, user_id: ${user.id}`);

    return new Response(
      JSON.stringify({ success: true, user_id: user.id }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "internal_error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
