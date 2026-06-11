import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { sendBrevoEmail } from "../_shared/brevo.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TestimonialEmailInput {
  testimonial_id: string;
  user_id: string;
  quote: string;
  partner_username?: string;
  partner_avatar_url?: string;
  project_title?: string;
}

serve(async (req: Request) => {
  console.log("[send-testimonial-published] Function invoked");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const input: TestimonialEmailInput = await req.json();
    
    console.log("[send-testimonial-published] Input:", JSON.stringify(input));
    
    // Get user profile and email
    const { data: userData } = await supabase.auth.admin.getUserById(input.user_id);
    if (!userData?.user?.email) {
      throw new Error("User email not found");
    }
    
    const { data: profile } = await supabase
      .from("profiles")
      .select("username, avatar_url, archetype")
      .eq("id", input.user_id)
      .single();
    
    if (!profile) {
      throw new Error("Profile not found");
    }
    
    const username = profile.username;
    const userEmail = userData.user.email;
    const userAvatar = profile.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(username)}`;
    const userArchetype = profile.archetype;
    
    // Truncate quote for card display
    const shortQuote = input.quote.length > 200 ? input.quote.substring(0, 200) + "..." : input.quote;
    
    // Generate HTML card for testimonial
    const testimonialCardHtml = generateTestimonialCard({
      username,
      userAvatar,
      userArchetype,
      partnerUsername: input.partner_username,
      partnerAvatar: input.partner_avatar_url,
      projectTitle: input.project_title,
      quote: shortQuote,
    });
    
    const emailHtml = generateEmailHtml({
      username,
      testimonialCard: testimonialCardHtml,
    });
    
    // Send email via Brevo
    const result = await sendBrevoEmail({
      to: [{ email: userEmail, name: username }],
      subject: "💜 Obrigado por compartilhar sua história!",
      htmlContent: emailHtml,
      tags: ["testimonial-published"]
    });
    
    if (!result.success) {
      throw new Error(`Brevo error: ${result.error}`);
    }
    
    console.log("[send-testimonial-published] Email sent successfully to", userEmail);
    
    return new Response(
      JSON.stringify({ success: true, email: userEmail }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[send-testimonial-published] Error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

interface CardData {
  username: string;
  userAvatar: string;
  userArchetype: string;
  partnerUsername?: string;
  partnerAvatar?: string;
  projectTitle?: string;
  quote: string;
}

function generateTestimonialCard(data: CardData): string {
  const archetypeColor = data.userArchetype === "BUILDER" ? "#06b6d4" : "#f97316";
  const archetypeLabel = data.userArchetype === "BUILDER" ? "Builder" : "Seller";
  
  let partnerSection = "";
  if (data.partnerUsername) {
    const partnerAvatarUrl = data.partnerAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.partnerUsername)}`;
    partnerSection = `
      <td style="padding-left: 12px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td style="color: #9ca3af; font-size: 12px; padding-right: 8px;">com</td>
            <td>
              <img src="${partnerAvatarUrl}" alt="${data.partnerUsername}" 
                style="width: 28px; height: 28px; border-radius: 50%; border: 2px solid #e5e7eb;" />
            </td>
            <td style="padding-left: 6px; color: #374151; font-size: 13px; font-weight: 500;">
              @${data.partnerUsername}
            </td>
          </tr>
        </table>
      </td>
    `;
  }
  
  const projectBadge = data.projectTitle 
    ? `<span style="display: inline-block; background-color: #f3e8ff; color: #7c3aed; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 500; margin-top: 8px;">🚀 ${data.projectTitle}</span>`
    : "";
  
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" 
      style="background: linear-gradient(135deg, #faf5ff 0%, #f0f9ff 100%); border-radius: 16px; border: 1px solid #e5e7eb; overflow: hidden;">
      <tr>
        <td style="padding: 20px;">
          <!-- Quote -->
          <p style="color: #374151; font-size: 15px; line-height: 1.6; font-style: italic; margin: 0 0 16px 0;">
            "${data.quote}"
          </p>
          
          <!-- User info -->
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td>
                <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td>
                      <img src="${data.userAvatar}" alt="${data.username}" 
                        style="width: 44px; height: 44px; border-radius: 50%; border: 3px solid ${archetypeColor}; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />
                    </td>
                    <td style="padding-left: 12px; vertical-align: middle;">
                      <p style="margin: 0; color: #111827; font-size: 15px; font-weight: 700;">@${data.username}</p>
                      <span style="display: inline-block; background-color: ${archetypeColor}; color: white; padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 600; margin-top: 2px;">${archetypeLabel}</span>
                    </td>
                    ${partnerSection}
                  </tr>
                </table>
              </td>
            </tr>
            ${projectBadge ? `<tr><td style="padding-top: 12px;">${projectBadge}</td></tr>` : ""}
          </table>
        </td>
      </tr>
    </table>
  `;
}

interface EmailData {
  username: string;
  testimonialCard: string;
}

function generateEmailHtml(data: EmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f3f4f6;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e5e7eb;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%); padding: 24px 40px; text-align: center;">
              <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0;">Guilda</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 32px 40px;">
              <h2 style="color: #1f2937; font-size: 22px; font-weight: 700; margin: 0 0 8px 0;">
                💜 Obrigado por compartilhar sua história!
              </h2>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Olá, <strong>${data.username}</strong>!<br><br>
                Seu depoimento foi aprovado e publicado! Agora outros founders podem se inspirar na sua história.
              </p>
              
              <p style="color: #6b7280; font-size: 14px; font-weight: 600; margin: 0 0 12px 0;">Confira como ficou:</p>
              
              <!-- Testimonial Card -->
              ${data.testimonialCard}
              
              <!-- CTA -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 28px;">
                <tr>
                  <td style="text-align: center;">
                    <a href="https://theguilda.lovable.app/success-stories" 
                      style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #9333ea 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 600; font-size: 16px;">
                      Ver na página de sucesso
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #6b7280; font-size: 14px; margin: 24px 0 0 0; text-align: center;">
                Obrigado por fazer parte da comunidade! 💜
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px 40px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 12px; margin: 0; text-align: center;">© 2024 Guilda. Todos os direitos reservados.</p>
              <p style="color: #9ca3af; font-size: 11px; margin: 8px 0 0 0; text-align: center;">
                <a href="https://theguilda.lovable.app/settings" style="color: #7c3aed; text-decoration: underline;">Gerenciar preferências de email</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
