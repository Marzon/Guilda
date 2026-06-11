import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Transparent 1x1 pixel GIF
const PIXEL = atob("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7");

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const trackingType = url.searchParams.get("type");
    const id = url.searchParams.get("id");

    if (!id) {
      console.error("[track-email-open] Missing ID");
      return new Response(PIXEL, {
        status: 200,
        headers: {
          "Content-Type": "image/gif",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          ...corsHeaders,
        },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle broadcast recipient tracking
    if (trackingType === "broadcast") {
      const { error } = await supabase
        .from("broadcast_recipients")
        .update({ opened_at: new Date().toISOString() })
        .eq("id", id)
        .is("opened_at", null);

      if (error) {
        console.error("[track-email-open] Error updating broadcast recipient:", error);
      } else {
        console.log(`📧 [track-email-open] Broadcast email opened: ${id}`);
      }
    } 
    // Handle waitlist signup tracking (legacy)
    else {
      const { error } = await supabase
        .from("waitlist_signups")
        .update({ email_opened_at: new Date().toISOString() })
        .eq("id", id)
        .is("email_opened_at", null);

      if (error) {
        console.error("[track-email-open] Error updating waitlist signup:", error);
      } else {
        console.log(`📧 [track-email-open] Waitlist email opened: ${id}`);
      }
    }

    // Return transparent 1x1 pixel GIF
    return new Response(PIXEL, {
      status: 200,
      headers: {
        "Content-Type": "image/gif",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("[track-email-open] Error:", error);
    // Still return pixel even on error
    return new Response(PIXEL, {
      status: 200,
      headers: {
        "Content-Type": "image/gif",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        ...corsHeaders,
      },
    });
  }
});
