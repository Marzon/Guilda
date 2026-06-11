import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { sendBrevoEmail } from "../_shared/brevo.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface RequestBody {
  story_id: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    const { story_id }: RequestBody = await req.json();
    
    if (!story_id) {
      console.error("Missing story_id");
      return new Response(
        JSON.stringify({ error: "story_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing success story: ${story_id}`);

    // Fetch the success story with profile and project details
    const { data: story, error: storyError } = await supabase
      .from("success_stories")
      .select(`
        *,
        founder_1:profiles!success_stories_founder_1_id_fkey(id, username, avatar_url),
        founder_2:profiles!success_stories_founder_2_id_fkey(id, username, avatar_url),
        project:projects(id, title)
      `)
      .eq("id", story_id)
      .single();

    if (storyError || !story) {
      console.error("Story not found:", storyError);
      return new Response(
        JSON.stringify({ error: "Story not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Story found: ${story.id}, project: ${story.project?.title}`);

    // Get email addresses for both founders
    const { data: user1Data, error: user1Error } = await supabase.auth.admin.getUserById(story.founder_1_id);
    const { data: user2Data, error: user2Error } = await supabase.auth.admin.getUserById(story.founder_2_id);

    if (user1Error || user2Error) {
      console.error("Error fetching user emails:", { user1Error, user2Error });
      return new Response(
        JSON.stringify({ error: "Could not fetch user emails" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const email1 = user1Data?.user?.email;
    const email2 = user2Data?.user?.email;

    if (!email1 || !email2) {
      console.error("Missing emails:", { email1, email2 });
      return new Response(
        JSON.stringify({ error: "One or both users don't have email addresses" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Emails found: ${email1}, ${email2}`);

    const projectTitle = story.project?.title || "seu projeto";
    const baseUrl = "https://guilda.co";

    // Email template function
    const createEmailHtml = (
      recipientName: string,
      partnerName: string,
      token: string
    ) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 32px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px;">🏆 Parabéns pela conquista!</h1>
    </div>
    
    <div style="padding: 32px;">
      <p style="font-size: 16px; color: #374151; line-height: 1.6;">
        Olá <strong>${recipientName}</strong>!
      </p>
      
      <p style="font-size: 16px; color: #374151; line-height: 1.6;">
        Notamos que você e <strong>${partnerName}</strong> formaram uma parceria incrível no projeto <strong>${projectTitle}</strong> através da Guilda!
      </p>
      
      <p style="font-size: 16px; color: #374151; line-height: 1.6;">
        Queremos celebrar essa conquista! Confirme sua parceria e compartilhe um breve depoimento sobre como foi encontrar seu co-founder.
      </p>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="${baseUrl}/success-confirm?token=${token}" 
           style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
          ✨ Confirmar Parceria
        </a>
      </div>
      
      <p style="font-size: 14px; color: #6b7280; line-height: 1.6;">
        Sua história pode inspirar outros founders a encontrarem seus parceiros ideais!
      </p>
    </div>
    
    <div style="background: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0; color: #9ca3af; font-size: 12px;">
        Guilda - Onde founders encontram seus co-founders
      </p>
    </div>
  </div>
</body>
</html>
    `;

    // Send emails to both founders
    const emailResults = await Promise.allSettled([
      // Email to founder 1
      sendBrevoEmail({
        to: [{ email: email1, name: story.founder_1?.username || "Founder" }],
        subject: `🏆 Confirme sua parceria com ${story.founder_2?.username || 'seu co-founder'}!`,
        htmlContent: createEmailHtml(
          story.founder_1?.username || "Founder",
          story.founder_2?.username || "seu parceiro",
          story.confirmation_token_1
        ),
        tags: ["success-confirmation"]
      }),
      // Email to founder 2
      sendBrevoEmail({
        to: [{ email: email2, name: story.founder_2?.username || "Founder" }],
        subject: `🏆 Confirme sua parceria com ${story.founder_1?.username || 'seu co-founder'}!`,
        htmlContent: createEmailHtml(
          story.founder_2?.username || "Founder",
          story.founder_1?.username || "seu parceiro",
          story.confirmation_token_2
        ),
        tags: ["success-confirmation"]
      }),
    ]);
    
    const successfulEmails = emailResults.filter(r => r.status === 'fulfilled' && (r.value as { success: boolean }).success).length;
    const failedEmails = emailResults.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !(r.value as { success: boolean }).success));

    if (failedEmails.length > 0) {
      console.error("Some emails failed:", failedEmails);
    }

    console.log(`Emails sent: ${successfulEmails}/2`);

    // Create in-app notifications for both founders
    const notificationResults = await Promise.allSettled([
      // Notification for founder 1
      supabase.functions.invoke("create-notification", {
        body: {
          userId: story.founder_1_id,
          type: "success_story",
          title: `🏆 Você tem uma história de sucesso!`,
          message: `Parece que você e @${story.founder_2?.username || 'seu parceiro'} formaram uma parceria incrível!`,
          relatedUserId: story.founder_2_id,
          actionUrl: `/success-confirm?token=${story.confirmation_token_1}`,
          sendEmail: false, // Email already sent above
        }
      }),
      // Notification for founder 2
      supabase.functions.invoke("create-notification", {
        body: {
          userId: story.founder_2_id,
          type: "success_story",
          title: `🏆 Você tem uma história de sucesso!`,
          message: `Parece que você e @${story.founder_1?.username || 'seu parceiro'} formaram uma parceria incrível!`,
          relatedUserId: story.founder_1_id,
          actionUrl: `/success-confirm?token=${story.confirmation_token_2}`,
          sendEmail: false, // Email already sent above
        }
      }),
    ]);

    const successfulNotifications = notificationResults.filter(r => r.status === 'fulfilled').length;
    console.log(`In-app notifications sent: ${successfulNotifications}/2`);

    // Update the story to mark follow-up as sent
    const { error: updateError } = await supabase
      .from("success_stories")
      .update({ follow_up_sent_at: new Date().toISOString() })
      .eq("id", story_id);

    if (updateError) {
      console.error("Error updating follow_up_sent_at:", updateError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        emails_sent: successfulEmails,
        emails_failed: failedEmails.length,
        notifications_sent: successfulNotifications,
        message: `Confirmation emails sent to ${successfulEmails} founders, notifications to ${successfulNotifications}`
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error: unknown) {
    console.error("Error in trigger-success-confirmations:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
