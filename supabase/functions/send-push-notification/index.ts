import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: {
    url?: string;
    type?: string;
    [key: string]: any;
  };
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  sound?: string;
  vibrate?: number[];
}

// Web Push signing implementation
async function generateVapidHeaders(
  endpoint: string,
  vapidPublicKey: string,
  vapidPrivateKey: string
): Promise<{ authorization: string; cryptoKey: string }> {
  const audience = new URL(endpoint).origin;
  const expiration = Math.floor(Date.now() / 1000) + 12 * 60 * 60; // 12 hours
  
  const header = {
    typ: "JWT",
    alg: "ES256"
  };
  
  const payload = {
    aud: audience,
    exp: expiration,
    sub: "mailto:noreply@guilda.app.br"
  };
  
  // Base64url encode
  const base64url = (data: string | Uint8Array) => {
    const str = typeof data === "string" ? data : new TextDecoder().decode(data);
    return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  };
  
  const headerB64 = base64url(JSON.stringify(header));
  const payloadB64 = base64url(JSON.stringify(payload));
  const unsignedToken = `${headerB64}.${payloadB64}`;
  
  // Import private key
  const privateKeyBuffer = Uint8Array.from(atob(vapidPrivateKey.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0));
  
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    privateKeyBuffer,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );
  
  // Sign
  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    cryptoKey,
    new TextEncoder().encode(unsignedToken)
  );
  
  const signatureB64 = base64url(new Uint8Array(signature));
  const jwt = `${unsignedToken}.${signatureB64}`;
  
  return {
    authorization: `vapid t=${jwt}, k=${vapidPublicKey}`,
    cryptoKey: vapidPublicKey
  };
}

async function sendPushToEndpoint(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: PushPayload,
  vapidPublicKey: string,
  vapidPrivateKey: string
): Promise<boolean> {
  try {
    const payloadStr = JSON.stringify(payload);
    
    // For simplicity, we'll use a basic approach
    // In production, you'd want to use proper encryption
    const response = await fetch(subscription.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "TTL": "86400",
        "Urgency": "high",
      },
      body: payloadStr,
    });
    
    if (!response.ok) {
      console.error(`Push failed: ${response.status} ${response.statusText}`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error sending push:", error);
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY")!;
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY")!;

    // Security: Require service role key authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.log("[send-push-notification] Missing authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    if (token !== supabaseServiceKey) {
      console.log("[send-push-notification] Invalid service role key");
      return new Response(
        JSON.stringify({ error: "Unauthorized - Invalid credentials" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[send-push-notification] Authenticated via service role key");
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { userId, title, body, type, url, actions, notificationId } = await req.json();

    if (!userId || !title || !body) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: userId, title, body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[send-push-notification] Sending to user ${userId}: ${title}`);

    // Get user's push subscriptions
    const { data: subscriptions, error: subError } = await supabase
      .from("push_subscriptions")
      .select("*")
      .eq("user_id", userId);

    if (subError) {
      console.error("Error fetching subscriptions:", subError);
      throw subError;
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log("No push subscriptions found for user");
      return new Response(
        JSON.stringify({ success: false, message: "No subscriptions found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build push payload with actions
    const pushPayload: PushPayload = {
      title,
      body,
      icon: "/icon-192x192.png",
      badge: "/favicon.png",
      tag: type || "notification",
      data: {
        url: url || "/tavern",
        type: type || "general",
        timestamp: Date.now(),
      },
      vibrate: [100, 50, 100],
    };

    // Add actions based on notification type
    if (type === "match_request") {
      pushPayload.actions = [
        { action: "accept", title: "✓ Aceitar" },
        { action: "view", title: "👀 Ver" },
      ];
    } else if (type === "match_accepted") {
      pushPayload.actions = [
        { action: "reply", title: "💬 Mensagem" },
        { action: "view", title: "👀 Ver Perfil" },
      ];
    } else if (type === "unmessaged_match_reminder") {
      pushPayload.actions = [
        { action: "reply", title: "💬 Conversar" },
      ];
    } else if (type === "new_message") {
      pushPayload.actions = [
        { action: "reply", title: "💬 Responder" },
        { action: "view", title: "👀 Ver" },
      ];
    } else if (type === "project_comment") {
      pushPayload.actions = [
        { action: "view", title: "👀 Ver Comentário" },
      ];
    } else if (type === "founder_introduction") {
      pushPayload.actions = [
        { action: "view", title: "💬 Ver Conversa" },
        { action: "open", title: "👀 Abrir" },
      ];
    } else if (actions) {
      pushPayload.actions = actions;
    }

    // Send to all subscriptions
    let successCount = 0;
    const failedEndpoints: string[] = [];

    for (const sub of subscriptions) {
      const success = await sendPushToEndpoint(
        { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
        pushPayload,
        vapidPublicKey,
        vapidPrivateKey
      );
      
      if (success) {
        successCount++;
      } else {
        failedEndpoints.push(sub.endpoint);
      }
    }

    // Clean up failed subscriptions (likely expired)
    if (failedEndpoints.length > 0) {
      console.log(`Cleaning up ${failedEndpoints.length} failed subscriptions`);
      await supabase
        .from("push_subscriptions")
        .delete()
        .eq("user_id", userId)
        .in("endpoint", failedEndpoints);
    }

    // Update sent_push flag if notificationId is provided and push was successful
    if (notificationId && successCount > 0) {
      const { error: updateError } = await supabase
        .from("notifications")
        .update({ sent_push: true })
        .eq("id", notificationId);
      
      if (updateError) {
        console.error("Error updating sent_push flag:", updateError);
      } else {
        console.log("Updated sent_push=true for notification:", notificationId);
      }
    }

    console.log(`Push sent to ${successCount}/${subscriptions.length} devices`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent: successCount, 
        total: subscriptions.length 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in send-push-notification:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
