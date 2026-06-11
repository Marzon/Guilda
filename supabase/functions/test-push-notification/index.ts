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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create client with user token to get authenticated user
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });
    
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      console.error("[test-push] User error:", userError);
      return new Response(
        JSON.stringify({ error: "Invalid user", details: userError?.message }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[test-push] Testing push for user ${user.id}`);
    
    // Use service role client for database operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if VAPID keys exist
    if (!vapidPublicKey || !vapidPrivateKey) {
      console.error("[test-push] VAPID keys not configured");
      return new Response(
        JSON.stringify({ error: "VAPID keys not configured", hint: "Add VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY secrets" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user's push subscriptions
    const { data: subscriptions, error: subError } = await supabase
      .from("push_subscriptions")
      .select("*")
      .eq("user_id", user.id);

    if (subError) {
      console.error("[test-push] Error fetching subscriptions:", subError);
      throw subError;
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log("[test-push] No subscriptions found");
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "No push subscriptions found. Enable push notifications first.",
          subscriptions: 0
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[test-push] Found ${subscriptions.length} subscriptions`);

    // Build push payload
    const pushPayload = {
      title: "🧪 Teste de Push - Guilda",
      body: "Se você está vendo isso, as notificações push estão funcionando!",
      icon: "/icon-192x192.png",
      badge: "/favicon.png",
      tag: "test-notification",
      data: {
        url: "/tavern",
        type: "test",
        timestamp: Date.now(),
      },
      vibrate: [100, 50, 100],
    };

    // Send to all subscriptions
    let successCount = 0;
    const results: Array<{ endpoint: string; success: boolean; error?: string }> = [];

    for (const sub of subscriptions) {
      try {
        console.log(`[test-push] Sending to endpoint: ${sub.endpoint.substring(0, 50)}...`);
        
        const response = await fetch(sub.endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "TTL": "86400",
            "Urgency": "high",
          },
          body: JSON.stringify(pushPayload),
        });

        if (response.ok || response.status === 201) {
          successCount++;
          results.push({ endpoint: sub.endpoint.substring(0, 50), success: true });
          console.log(`[test-push] Success for endpoint`);
        } else {
          const errorText = await response.text();
          console.error(`[test-push] Failed: ${response.status} - ${errorText}`);
          results.push({ 
            endpoint: sub.endpoint.substring(0, 50), 
            success: false, 
            error: `${response.status}: ${errorText.substring(0, 100)}` 
          });
        }
      } catch (error) {
        console.error(`[test-push] Error sending to endpoint:`, error);
        results.push({ 
          endpoint: sub.endpoint.substring(0, 50), 
          success: false, 
          error: error instanceof Error ? error.message : "Unknown error" 
        });
      }
    }

    console.log(`[test-push] Sent to ${successCount}/${subscriptions.length} devices`);

    return new Response(
      JSON.stringify({ 
        success: successCount > 0,
        message: successCount > 0 
          ? `Push sent to ${successCount}/${subscriptions.length} devices` 
          : "Failed to send to any device",
        sent: successCount, 
        total: subscriptions.length,
        results
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("[test-push] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
