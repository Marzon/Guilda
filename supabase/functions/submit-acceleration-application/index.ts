import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, pitch, bottleneck } = await req.json();

    console.log("Received application submission:", { user_id, pitch: pitch?.substring(0, 50), bottleneck: bottleneck?.substring(0, 50) });

    if (!user_id || !pitch || !bottleneck) {
      console.error("Missing required fields");
      return new Response(
        JSON.stringify({ error: "Missing required fields: user_id, pitch, bottleneck" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with service role to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Wait for profile to exist (race condition fix - trigger may not have completed yet)
    let profileExists = false;
    const maxRetries = 5;
    const retryDelay = 500; // ms
    
    for (let i = 0; i < maxRetries; i++) {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("id", user_id)
        .maybeSingle();
      
      if (profile) {
        profileExists = true;
        console.log(`Profile found on attempt ${i + 1}`);
        break;
      }
      
      console.log(`Profile not found, attempt ${i + 1}/${maxRetries}, waiting...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }

    if (!profileExists) {
      console.error("Profile not found after max retries for user:", user_id);
      return new Response(
        JSON.stringify({ error: "Profile not created yet. Please try again." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user already has an application
    const { data: existingApp, error: checkError } = await supabaseAdmin
      .from("acceleration_applications")
      .select("id")
      .eq("user_id", user_id)
      .maybeSingle();

    if (checkError) {
      console.error("Error checking existing application:", checkError);
      return new Response(
        JSON.stringify({ error: "Failed to check existing application" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (existingApp) {
      console.log("User already has an application:", existingApp.id);
      return new Response(
        JSON.stringify({ error: "User already has an application", existing: true }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert the application
    const { data, error } = await supabaseAdmin
      .from("acceleration_applications")
      .insert({
        user_id,
        pitch,
        bottleneck,
        status: "PENDING",
      })
      .select()
      .single();

    if (error) {
      console.error("Error inserting application:", error);
      return new Response(
        JSON.stringify({ error: "Failed to submit application", details: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Application submitted successfully:", data.id);

    return new Response(
      JSON.stringify({ success: true, application: data }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Unexpected error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: "Internal server error", details: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
