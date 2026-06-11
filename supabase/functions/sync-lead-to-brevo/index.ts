import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LeadPayload {
  email: string;
  phone?: string;
  tool_id?: string;
  tipo?: string;
  arquetipo?: string;
  lead_quality?: string;
  score_x?: number;
  score_y?: number;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  source: "tool_leads" | "quiz_leads";
}

/**
 * Brevo List Strategy (create these lists in Brevo dashboard):
 *
 * LIST 2 - "Marketing - Todos os Leads"
 *   → Todos os leads capturados pelo site de marketing
 *
 * LIST 3 - "Quiz - Hot Leads"
 *   → Leads quentes do quiz (lead_quality = "hot"), prontos para nurturing agressivo
 *
 * LIST 4 - "Quiz - Warm Leads"
 *   → Leads mornos do quiz (lead_quality = "warm"), nurturing moderado
 *
 * LIST 5 - "Quiz - Builders"
 *   → Leads identificados como Builder pelo quiz (tipo = "builder")
 *
 * LIST 6 - "Quiz - Sellers"
 *   → Leads identificados como Seller pelo quiz (tipo = "seller")
 *
 * LIST 7 - "Ferramentas - MVP Builder"
 *   → Leads capturados via MVP Builder (tool_id = "guilda-ia-mvp")
 *
 * ATRIBUTOS personalizados (criar no Brevo → Contacts → Settings → Attributes):
 *   LEAD_SOURCE (text)      → "tool_leads" ou "quiz_leads"
 *   TOOL_ID (text)          → ID da ferramenta usada
 *   TIPO (text)             → "builder" ou "seller"
 *   ARQUETIPO (text)        → Mago, Arquiteto, Paladino, etc.
 *   LEAD_QUALITY (text)     → "hot", "warm", "cold"
 *   UTM_SOURCE (text)       → Parâmetro UTM
 *   UTM_MEDIUM (text)       → Parâmetro UTM
 *   UTM_CAMPAIGN (text)     → Parâmetro UTM
 *   FROM_MARKETING_SITE (boolean) → Sempre true
 */

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");
  if (!BREVO_API_KEY) {
    console.error("[sync-lead-to-brevo] BREVO_API_KEY not configured");
    return new Response(JSON.stringify({ error: "BREVO_API_KEY not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const payload: LeadPayload = await req.json();
    const { email, phone, source, tool_id, tipo, arquetipo, lead_quality, score_x, score_y, utm_source, utm_medium, utm_campaign } = payload;

    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[sync-lead-to-brevo] Syncing ${email} | source=${source} | quality=${lead_quality} | tipo=${tipo} | arquetipo=${arquetipo}`);

    // Build Brevo contact attributes
    const attributes: Record<string, string | number | boolean> = {
      LEAD_SOURCE: source,
      FROM_MARKETING_SITE: true,
    };

    if (tool_id) attributes.TOOL_ID = tool_id;
    if (tipo) attributes.TIPO = tipo;
    if (arquetipo) attributes.ARQUETIPO = arquetipo;
    if (lead_quality) attributes.LEAD_QUALITY = lead_quality;
    if (score_x !== undefined) attributes.SCORE_X = score_x;
    if (score_y !== undefined) attributes.SCORE_Y = score_y;
    if (utm_source) attributes.UTM_SOURCE = utm_source;
    if (utm_medium) attributes.UTM_MEDIUM = utm_medium;
    if (utm_campaign) attributes.UTM_CAMPAIGN = utm_campaign;
    if (phone) {
      const digits = phone.replace(/\D/g, "");
      const formatted = digits.startsWith("55") ? `+${digits}` : `+55${digits}`;
      attributes.SMS = formatted;
      attributes.WHATSAPP = formatted;
      attributes.CELULAR = formatted;
    }

    // Determine Brevo lists based on lead context
    const listIds: number[] = [2]; // List 2 = All Marketing Leads (always)

    if (source === "quiz_leads") {
      // Quiz-specific lists
      if (lead_quality === "hot") listIds.push(3);     // Hot Leads
      if (lead_quality === "warm") listIds.push(4);    // Warm Leads
      if (tipo === "builder") listIds.push(5);         // Builders
      if (tipo === "seller") listIds.push(6);          // Sellers
    }

    if (source === "tool_leads") {
      if (tool_id === "guilda-ia-mvp") listIds.push(7); // MVP Builder users
      if (tool_id === "aceleracao-lp") listIds.push(8); // Aceleração LP
    }

    console.log(`[sync-lead-to-brevo] Lists: [${listIds.join(", ")}]`);

    // Create or update contact in Brevo
    const brevoResponse = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": BREVO_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        attributes,
        listIds,
        updateEnabled: true, // Update attributes if contact already exists
      }),
    });

    // Brevo returns 201 for created, 204 for updated (via updateEnabled)
    if (brevoResponse.status === 204) {
      console.log(`[sync-lead-to-brevo] Contact ${email} updated in Brevo`);
      return new Response(JSON.stringify({ success: true, action: "updated" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!brevoResponse.ok) {
      const errorText = await brevoResponse.text();
      console.error(`[sync-lead-to-brevo] Brevo API error: ${brevoResponse.status} - ${errorText}`);
      
      // If contact already exists (duplicate), still consider it success
      if (brevoResponse.status === 400 && errorText.includes("already exist")) {
        console.log(`[sync-lead-to-brevo] Contact ${email} already exists, treating as success`);
        return new Response(JSON.stringify({ success: true, action: "already_exists" }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ error: `Brevo API error: ${brevoResponse.status}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await brevoResponse.json();
    console.log(`[sync-lead-to-brevo] Contact ${email} created in Brevo (id: ${result.id})`);

    return new Response(JSON.stringify({ success: true, action: "created", id: result.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[sync-lead-to-brevo] Error:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
