import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CORE_API_URL = "https://wesmoijjctmtyrstoxsn.supabase.co/functions/v1/api-proxy";
const API_KEY = "gld_mkt_prod_8f42b1c35d9e4a7bb2e19c3f4d5a6e7b_2024";

interface LeadPayload {
  nome: string;
  email: string;
  telefone: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: LeadPayload = await req.json();
    const { nome, email } = payload;

    if (!nome || !email) {
      return new Response(
        JSON.stringify({ error: "nome and email are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[sync-lead-to-core] Syncing lead ${email} to Core`);

    const response = await fetch(`${CORE_API_URL}?endpoint=leads`, {
      method: "POST",
      headers: {
        "x-api-key": API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[sync-lead-to-core] Core API error: ${response.status} - ${errorText}`);
      return new Response(
        JSON.stringify({ error: `Core API error: ${response.status}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await response.json();
    console.log(`[sync-lead-to-core] Lead ${email} synced to Core successfully`);

    return new Response(JSON.stringify({ success: true, ...result }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[sync-lead-to-core] Error:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
