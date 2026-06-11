import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { sendBrevoEmail } from "../_shared/brevo.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  type: "application_received" | "application_accepted" | "application_rejected" | "favorite_project_update";
  recipientId: string;
  projectId: string;
  projectTitle: string;
  roleName?: string;
  applicantName?: string;
  updateContent?: string;
  locale?: string;
}

const getEmailContent = (type: string, data: NotificationRequest) => {
  const locale = data.locale || "pt";
  
  const templates: Record<string, Record<string, { subject: string; title: string; body: string; cta: string }>> = {
    application_received: {
      pt: { subject: `Nova candidatura para ${data.projectTitle}`, title: "Nova Candidatura Recebida!", body: `<strong>${data.applicantName}</strong> se candidatou para a vaga de <strong>${data.roleName}</strong> na sua startup <strong>${data.projectTitle}</strong>.`, cta: "Ver Candidatura" },
      en: { subject: `New application for ${data.projectTitle}`, title: "New Application Received!", body: `<strong>${data.applicantName}</strong> applied for the <strong>${data.roleName}</strong> role in your startup <strong>${data.projectTitle}</strong>.`, cta: "View Application" },
      es: { subject: `Nueva candidatura para ${data.projectTitle}`, title: "¡Nueva Candidatura Recibida!", body: `<strong>${data.applicantName}</strong> se postuló para el puesto de <strong>${data.roleName}</strong> en tu startup <strong>${data.projectTitle}</strong>.`, cta: "Ver Candidatura" },
    },
    application_accepted: {
      pt: { subject: `Você foi aceito em ${data.projectTitle}!`, title: "Parabéns! Você foi aceito!", body: `Sua candidatura para <strong>${data.roleName}</strong> na startup <strong>${data.projectTitle}</strong> foi aceita! Você agora faz parte da equipe.`, cta: "Ver Startup" },
      en: { subject: `You've been accepted to ${data.projectTitle}!`, title: "Congratulations! You've been accepted!", body: `Your application for <strong>${data.roleName}</strong> in the startup <strong>${data.projectTitle}</strong> was accepted! You're now part of the team.`, cta: "View Startup" },
      es: { subject: `¡Fuiste aceptado en ${data.projectTitle}!`, title: "¡Felicidades! ¡Fuiste aceptado!", body: `Tu candidatura para <strong>${data.roleName}</strong> en la startup <strong>${data.projectTitle}</strong> fue aceptada. ¡Ahora eres parte del equipo!`, cta: "Ver Startup" },
    },
    application_rejected: {
      pt: { subject: `Atualização sobre sua candidatura em ${data.projectTitle}`, title: "Atualização de Candidatura", body: `Infelizmente, sua candidatura para <strong>${data.roleName}</strong> na startup <strong>${data.projectTitle}</strong> não foi aceita desta vez. Continue buscando oportunidades!`, cta: "Explorar Startups" },
      en: { subject: `Update on your application for ${data.projectTitle}`, title: "Application Update", body: `Unfortunately, your application for <strong>${data.roleName}</strong> in the startup <strong>${data.projectTitle}</strong> wasn't accepted this time. Keep exploring opportunities!`, cta: "Explore Startups" },
      es: { subject: `Actualización sobre tu candidatura en ${data.projectTitle}`, title: "Actualización de Candidatura", body: `Lamentablemente, tu candidatura para <strong>${data.roleName}</strong> en la startup <strong>${data.projectTitle}</strong> no fue aceptada esta vez. ¡Sigue buscando oportunidades!`, cta: "Explorar Startups" },
    },
    favorite_project_update: {
      pt: { subject: `Novidade em ${data.projectTitle}`, title: "Novidade na Startup que Você Favoritou!", body: `A startup <strong>${data.projectTitle}</strong> tem uma nova atualização:<br/><br/>"${data.updateContent}"`, cta: "Ver Startup" },
      en: { subject: `Update from ${data.projectTitle}`, title: "Update from a Startup You Favorited!", body: `The startup <strong>${data.projectTitle}</strong> has a new update:<br/><br/>"${data.updateContent}"`, cta: "View Startup" },
      es: { subject: `Novedad en ${data.projectTitle}`, title: "¡Novedad en la Startup que Favoritaste!", body: `La startup <strong>${data.projectTitle}</strong> tiene una nueva actualización:<br/><br/>"${data.updateContent}"`, cta: "Ver Startup" },
    },
  };

  return templates[type]?.[locale] || templates[type]?.pt;
};

const generateEmailHtml = (content: { title: string; body: string; cta: string }, projectUrl: string) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f3f4f6;">
    <tr><td style="padding: 40px 20px;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e5e7eb;">
        <tr><td style="background: linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%); padding: 24px 40px; text-align: center;"><h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0;">Guilda</h1></td></tr>
        <tr><td style="padding: 32px 40px;">
          <h2 style="color: #1f2937; font-size: 22px; font-weight: 700; margin: 0 0 16px 0;">${content.title}</h2>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">${content.body}</p>
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"><tr><td style="text-align: center;"><a href="${projectUrl}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #9333ea 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 600; font-size: 16px;">${content.cta}</a></td></tr></table>
        </td></tr>
        <tr><td style="background-color: #f9fafb; padding: 20px 40px; border-top: 1px solid #e5e7eb;"><p style="color: #6b7280; font-size: 12px; margin: 0; text-align: center;">© 2024 Guilda - Conectando Builders e Sellers</p></td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
    const data: NotificationRequest = await req.json();

    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(data.recipientId);
    if (userError || !userData?.user?.email) return new Response(JSON.stringify({ error: "User not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const content = getEmailContent(data.type, data);
    if (!content) return new Response(JSON.stringify({ error: "Invalid notification type" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const projectUrl = data.type === "application_rejected" ? "https://guilda.app.br/projects" : `https://guilda.app.br/project/${data.projectId}`;
    
    await sendBrevoEmail({
      to: [{ email: userData.user.email }],
      subject: content.subject,
      htmlContent: generateEmailHtml(content, projectUrl),
      tags: ["application", data.type],
    });

    await supabase.from("notifications").insert({ user_id: data.recipientId, type: data.type, title: content.title, message: content.body.replace(/<[^>]*>/g, '') });

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
