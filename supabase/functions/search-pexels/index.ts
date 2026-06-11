import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { requireAdmin } from "../_shared/admin.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const adminError = await requireAdmin(supabase, user.id, corsHeaders);
    if (adminError) return adminError;

    const { query } = await req.json();
    if (!query || typeof query !== "string") {
      return new Response(JSON.stringify({ error: "Missing query parameter" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const pexelsKey = Deno.env.get("PEXELS_API_KEY");
    if (!pexelsKey) {
      return new Response(JSON.stringify({ error: "PEXELS_API_KEY not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const params = new URLSearchParams({
      query,
      per_page: "15",
      orientation: "landscape",
      size: "large",
    });

    const pexelsRes = await fetch(
      `https://api.pexels.com/v1/search?${params.toString()}`,
      { headers: { Authorization: pexelsKey } }
    );

    if (!pexelsRes.ok) {
      const text = await pexelsRes.text();
      console.error("Pexels API error:", pexelsRes.status, text);
      return new Response(JSON.stringify({ error: "Pexels API error", details: text }), {
        status: pexelsRes.status,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const pexelsData = await pexelsRes.json();

    const photos = (pexelsData.photos || []).map((p: any) => ({
      id: p.id,
      large2x: p.src?.large2x,
      medium: p.src?.medium,
      alt: p.alt || "",
      photographer: p.photographer || "",
    }));

    return new Response(JSON.stringify({ photos }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err) {
    console.error("search-pexels error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
