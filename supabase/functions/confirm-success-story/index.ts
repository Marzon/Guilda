import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Handle both GET (from email link) and POST (from form submission)
    let token: string | null = null;
    let partnershipType: string | null = null;
    let testimonial: string | null = null;
    let isPublic = false;

    if (req.method === "GET") {
      // Initial click from email - just validate token
      const url = new URL(req.url);
      token = url.searchParams.get("token");
    } else if (req.method === "POST") {
      // Form submission with details
      const body = await req.json();
      token = body.token;
      partnershipType = body.partnership_type;
      testimonial = body.testimonial;
      isPublic = body.is_public || false;
    }

    if (!token) {
      return new Response(
        JSON.stringify({ error: "Token é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing token: ${token.substring(0, 8)}...`);

    // Find the success story by token
    const { data: story, error: storyError } = await supabase
      .from("success_stories")
      .select(`
        *,
        founder_1:profiles!success_stories_founder_1_id_fkey(id, username, avatar_url),
        founder_2:profiles!success_stories_founder_2_id_fkey(id, username, avatar_url),
        project:projects(id, title)
      `)
      .or(`confirmation_token_1.eq.${token},confirmation_token_2.eq.${token}`)
      .single();

    if (storyError || !story) {
      console.error("Story not found:", storyError);
      return new Response(
        JSON.stringify({ 
          error: "Token inválido ou expirado",
          valid: false 
        }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Determine which founder is confirming
    const isFounder1 = story.confirmation_token_1 === token;
    const isFounder2 = story.confirmation_token_2 === token;

    if (!isFounder1 && !isFounder2) {
      return new Response(
        JSON.stringify({ error: "Token não corresponde", valid: false }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // For GET requests, just return the story info for the confirmation page
    if (req.method === "GET") {
      const partner = isFounder1 ? story.founder_2 : story.founder_1;
      const currentUser = isFounder1 ? story.founder_1 : story.founder_2;
      const alreadyConfirmed = isFounder1 ? story.confirmed_by_founder_1 : story.confirmed_by_founder_2;

      return new Response(
        JSON.stringify({
          valid: true,
          already_confirmed: alreadyConfirmed,
          story_id: story.id,
          current_user: currentUser,
          partner,
          project: story.project,
          status: story.status,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // For POST requests, update the confirmation
    const updates: Record<string, any> = {};

    if (isFounder1) {
      updates.confirmed_by_founder_1 = true;
      if (testimonial) updates.testimonial_1 = testimonial;
    } else {
      updates.confirmed_by_founder_2 = true;
      if (testimonial) updates.testimonial_2 = testimonial;
    }

    if (partnershipType) {
      updates.partnership_type = partnershipType;
    }

    // Check if both will be confirmed after this update
    const willBeFullyConfirmed = 
      (isFounder1 && story.confirmed_by_founder_2) ||
      (isFounder2 && story.confirmed_by_founder_1);

    if (willBeFullyConfirmed) {
      updates.status = "confirmed";
      updates.confirmed_at = new Date().toISOString();
    } else if (story.status === "pending") {
      updates.status = "partial";
    }

    // Only update is_public if user opted in and story becomes fully confirmed
    if (isPublic && willBeFullyConfirmed) {
      updates.is_public = true;
    }

    const { data: updatedStory, error: updateError } = await supabase
      .from("success_stories")
      .update(updates)
      .eq("id", story.id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating story:", updateError);
      throw updateError;
    }

    console.log(`Story ${story.id} updated. Status: ${updatedStory.status}`);

    // Get usernames for notifications
    const currentFounder = isFounder1 ? story.founder_1 : story.founder_2;
    const otherFounder = isFounder1 ? story.founder_2 : story.founder_1;
    const currentFounderId = isFounder1 ? story.founder_1_id : story.founder_2_id;
    const otherFounderId = isFounder1 ? story.founder_2_id : story.founder_1_id;
    const otherToken = isFounder1 ? story.confirmation_token_2 : story.confirmation_token_1;

    // Send notifications based on confirmation status
    if (willBeFullyConfirmed) {
      // Both confirmed - celebrate! Notify both founders
      console.log("Both founders confirmed! Sending celebration notifications...");
      
      await Promise.allSettled([
        // Notify founder 1
        supabase.functions.invoke("create-notification", {
          body: {
            userId: story.founder_1_id,
            type: "success_story",
            title: "🎉 História de sucesso publicada!",
            message: `Parabéns! Sua parceria com @${story.founder_2?.username || 'seu parceiro'} foi confirmada!`,
            relatedUserId: story.founder_2_id,
            actionUrl: "/tavern",
            sendEmail: true,
          }
        }),
        // Notify founder 2
        supabase.functions.invoke("create-notification", {
          body: {
            userId: story.founder_2_id,
            type: "success_story",
            title: "🎉 História de sucesso publicada!",
            message: `Parabéns! Sua parceria com @${story.founder_1?.username || 'seu parceiro'} foi confirmada!`,
            relatedUserId: story.founder_1_id,
            actionUrl: "/tavern",
            sendEmail: true,
          }
        }),
      ]);
    } else {
      // Partial confirmation - notify the other founder that their partner confirmed
      console.log(`Partial confirmation. Notifying ${otherFounderId} that ${currentFounderId} confirmed.`);
      
      await supabase.functions.invoke("create-notification", {
        body: {
          userId: otherFounderId,
          type: "success_story",
          title: "🏆 Seu parceiro confirmou!",
          message: `@${currentFounder?.username || 'Seu parceiro'} confirmou a parceria! Agora só falta você.`,
          relatedUserId: currentFounderId,
          actionUrl: `/success-confirm?token=${otherToken}`,
          sendEmail: true,
        }
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        status: updatedStory.status,
        fully_confirmed: willBeFullyConfirmed,
        message: willBeFullyConfirmed 
          ? "Parabéns! Ambos confirmaram a parceria. 🎉"
          : "Confirmação registrada! Aguardando confirmação do parceiro.",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in confirm-success-story:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
