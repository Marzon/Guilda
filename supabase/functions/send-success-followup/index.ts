import { createClient } from "npm:@supabase/supabase-js@2";
import { sendBrevoEmail } from "../_shared/brevo.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Find matches that were accepted 28-32 days ago and don't have a success story yet
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const minDate = new Date(thirtyDaysAgo);
    minDate.setDate(minDate.getDate() - 2);
    const maxDate = new Date(thirtyDaysAgo);
    maxDate.setDate(maxDate.getDate() + 2);

    console.log(`Looking for matches accepted between ${minDate.toISOString()} and ${maxDate.toISOString()}`);

    // Get accepted matches in the date range
    const { data: matches, error: matchesError } = await supabase
      .from("matches")
      .select(`
        id,
        requester_id,
        target_id,
        updated_at,
        requester:profiles!matches_requester_id_fkey(id, username),
        target:profiles!matches_target_id_fkey(id, username)
      `)
      .eq("status", "ACCEPTED")
      .gte("updated_at", minDate.toISOString())
      .lte("updated_at", maxDate.toISOString());

    if (matchesError) {
      console.error("Error fetching matches:", matchesError);
      throw matchesError;
    }

    console.log(`Found ${matches?.length || 0} matches to process`);

    if (!matches || matches.length === 0) {
      return new Response(
        JSON.stringify({ success: true, processed: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check which matches already have success stories
    const matchIds = matches.map((m) => m.id);
    const { data: existingStories, error: storiesError } = await supabase
      .from("success_stories")
      .select("match_id")
      .in("match_id", matchIds);

    if (storiesError) {
      console.error("Error checking existing stories:", storiesError);
      throw storiesError;
    }

    const existingMatchIds = new Set(existingStories?.map((s) => s.match_id) || []);
    const matchesToProcess = matches.filter((m) => !existingMatchIds.has(m.id));

    console.log(`${matchesToProcess.length} matches need follow-up`);

    let processed = 0;
    let errors = 0;

    const baseUrl = "https://guilda.app";

    for (const match of matchesToProcess) {
      try {
        // Generate tokens for both founders
        const token1 = generateToken();
        const token2 = generateToken();

        // Create success story record with tokens
        const { error: storyError } = await supabase
          .from("success_stories")
          .insert({
            match_id: match.id,
            founder_1_id: match.requester_id,
            founder_2_id: match.target_id,
            confirmation_token_1: token1,
            confirmation_token_2: token2,
            status: "pending",
            follow_up_sent_at: new Date().toISOString(),
          });

        if (storyError) {
          console.error(`Error creating story for match ${match.id}:`, storyError);
          errors++;
          continue;
        }

        // Get emails for both users
        const { data: user1 } = await supabase.auth.admin.getUserById(match.requester_id);
        const { data: user2 } = await supabase.auth.admin.getUserById(match.target_id);

        const email1 = user1?.user?.email;
        const email2 = user2?.user?.email;

        // Send email to founder 1
        if (email1) {
          const partner1 = (match.target as any)?.username || "seu match";
          await sendBrevoEmail({
            to: [{ email: email1 }],
            subject: `Sua conexão com @${partner1} deu certo? 🎯`,
            htmlContent: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2>Olá @${(match.requester as any)?.username}! 👋</h2>
                
                <p>Faz 30 dias que você conectou com <strong>@${partner1}</strong> na Guilda.</p>
                
                <p>Queremos saber: <strong>a parceria deu certo?</strong></p>
                
                <div style="margin: 30px 0;">
                  <a href="${baseUrl}/success-confirm?token=${token1}" 
                     style="display: inline-block; background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                    Sim, deu certo! 🎉
                  </a>
                </div>
                
                <p style="color: #666; font-size: 14px;">
                  Seu feedback ajuda outros founders a encontrar os melhores parceiros.
                </p>
                
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                
                <p style="color: #999; font-size: 12px;">
                  Guilda - Onde founders se encontram
                </p>
              </div>
            `,
            tags: ["success-followup"],
          });
        }

        // Send email to founder 2
        if (email2) {
          const partner2 = (match.requester as any)?.username || "seu match";
          await sendBrevoEmail({
            to: [{ email: email2 }],
            subject: `Sua conexão com @${partner2} deu certo? 🎯`,
            htmlContent: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2>Olá @${(match.target as any)?.username}! 👋</h2>
                
                <p>Faz 30 dias que você conectou com <strong>@${partner2}</strong> na Guilda.</p>
                
                <p>Queremos saber: <strong>a parceria deu certo?</strong></p>
                
                <div style="margin: 30px 0;">
                  <a href="${baseUrl}/success-confirm?token=${token2}" 
                     style="display: inline-block; background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                    Sim, deu certo! 🎉
                  </a>
                </div>
                
                <p style="color: #666; font-size: 14px;">
                  Seu feedback ajuda outros founders a encontrar os melhores parceiros.
                </p>
                
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                
                <p style="color: #999; font-size: 12px;">
                  Guilda - Onde founders se encontram
                </p>
              </div>
            `,
            tags: ["success-followup"],
          });
        }

        processed++;
        console.log(`Processed match ${match.id}`);
      } catch (error) {
        console.error(`Error processing match ${match.id}:`, error);
        errors++;
      }
    }

    console.log(`Completed: ${processed} processed, ${errors} errors`);

    return new Response(
      JSON.stringify({ success: true, processed, errors }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-success-followup:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
