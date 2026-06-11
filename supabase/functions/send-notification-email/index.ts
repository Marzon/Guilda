import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { sendBrevoEmail } from "../_shared/brevo.ts";

const APP_URL = "https://guilda.app.br";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationEmailRequest {
  userId: string;
  type: 'match_request' | 'match_accepted' | 'new_message' | 'daily_summary' | 'project_invite' | 'welcome' | 'inactivity_reminder' | 'founder_introduction';
  title: string;
  message: string;
  senderName?: string;
  senderUsername?: string;
  projectName?: string;
  roleName?: string;
  introducedName?: string;
  recipientName?: string;
  locale?: string;
  notificationId?: string;
}

const translations = {
  pt: {
    match_request: {
      subject: (name: string) => `${name} quer se conectar com você!`,
      title: "Novo Convite de Match!",
      greeting: "Olá",
      message: (senderName: string, senderUsername: string) => `<strong>${senderName}</strong> (@${senderUsername}) enviou um convite de match para você na Guilda!`,
      button: "Ver Convite"
    },
    match_accepted: {
      subject: (name: string) => `${name} aceitou seu convite!`,
      title: "Match Confirmado!",
      greeting: "Olá",
      message: (senderName: string, senderUsername: string) => `<strong>${senderName}</strong> (@${senderUsername}) aceitou seu convite de match! Agora vocês podem conversar e colaborar juntos.`,
      button: "Iniciar Conversa"
    },
    new_message: {
      subject: (name: string) => `Nova mensagem de ${name}`,
      title: "Nova Mensagem",
      greeting: "Olá",
      message: (senderName: string) => `<strong>${senderName}</strong> te enviou uma nova mensagem:`,
      button: "Responder"
    },
    project_invite: {
      subject: (name: string) => `${name} te convidou para uma startup!`,
      title: "Convite de Startup",
      greeting: "Olá",
      message: (senderName: string, projectName: string, roleName: string) => `<strong>${senderName}</strong> te convidou para participar da startup <strong>${projectName}</strong> como <strong>${roleName}</strong>!`,
      button: "Ver Convite"
    },
    welcome: {
      subject: "Bem-vindo à Guilda!",
      title: "Bem-vindo à Guilda!",
      greeting: "Olá",
      message: "Seja bem-vindo à Guilda! Complete seu perfil e comece a fazer matches com outros aventureiros.",
      tips: "<li>Complete seu perfil com suas habilidades</li><li>Explore a Tavern para conhecer outros Builders e Sellers</li><li>Crie ou participe de startups incríveis</li>",
      button: "Completar Perfil"
    },
    inactivity_reminder: {
      subject: "Sentimos sua falta na Guilda!",
      title: "Sentimos sua falta!",
      greeting: "Olá",
      message: "Faz um tempo que você não aparece na Tavern. Veja o que está acontecendo:",
      button: "Voltar para a Guilda"
    },
    founder_introduction: {
      subject: (name: string) => `${name} está te apresentando para alguém!`,
      title: "Nova Apresentação de Founder!",
      greeting: "Olá",
      message: (senderName: string, introducedName: string, recipientName: string, isRecipient: boolean) => 
        isRecipient 
          ? `<strong>${senderName}</strong> está te apresentando para <strong>${introducedName}</strong>! Esta é uma oportunidade de conhecer um potencial parceiro de negócios.`
          : `<strong>${senderName}</strong> está te apresentando para <strong>${recipientName}</strong>! Esta é uma oportunidade de conhecer um potencial parceiro de negócios.`,
      button: "Ver Apresentação"
    },
    footer: "Esta é uma notificação automática da Guilda."
  },
  en: {
    match_request: {
      subject: (name: string) => `${name} wants to connect with you!`,
      title: "New Match Request!",
      greeting: "Hello",
      message: (senderName: string, senderUsername: string) => `<strong>${senderName}</strong> (@${senderUsername}) sent you a match request on Guilda!`,
      button: "View Request"
    },
    match_accepted: {
      subject: (name: string) => `${name} accepted your request!`,
      title: "Match Confirmed!",
      greeting: "Hello",
      message: (senderName: string, senderUsername: string) => `<strong>${senderName}</strong> (@${senderUsername}) accepted your match request! You can now chat and collaborate together.`,
      button: "Start Conversation"
    },
    new_message: {
      subject: (name: string) => `New message from ${name}`,
      title: "New Message",
      greeting: "Hello",
      message: (senderName: string) => `<strong>${senderName}</strong> sent you a new message:`,
      button: "Reply"
    },
    project_invite: {
      subject: (name: string) => `${name} invited you to a project!`,
      title: "Project Invitation",
      greeting: "Hello",
      message: (senderName: string, projectName: string, roleName: string) => `<strong>${senderName}</strong> invited you to join the <strong>${projectName}</strong> project as <strong>${roleName}</strong>!`,
      button: "View Invitation"
    },
    welcome: {
      subject: "Welcome to Guilda!",
      title: "Welcome to Guilda!",
      greeting: "Hello",
      message: "Welcome to Guilda! Complete your profile and start matching with other adventurers.",
      tips: "<li>Complete your profile with your skills</li><li>Explore the Tavern to meet other Builders and Sellers</li><li>Create or join amazing projects</li>",
      button: "Complete Profile"
    },
    inactivity_reminder: {
      subject: "We miss you at Guilda!",
      title: "We miss you!",
      greeting: "Hello",
      message: "It's been a while since you visited the Tavern. See what's happening:",
      button: "Back to Guilda"
    },
    founder_introduction: {
      subject: (name: string) => `${name} is introducing you to someone!`,
      title: "New Founder Introduction!",
      greeting: "Hello",
      message: (senderName: string, introducedName: string, recipientName: string, isRecipient: boolean) => 
        isRecipient 
          ? `<strong>${senderName}</strong> is introducing you to <strong>${introducedName}</strong>! This is an opportunity to meet a potential business partner.`
          : `<strong>${senderName}</strong> is introducing you to <strong>${recipientName}</strong>! This is an opportunity to meet a potential business partner.`,
      button: "View Introduction"
    },
    footer: "This is an automatic notification from Guilda."
  },
  es: {
    match_request: {
      subject: (name: string) => `¡${name} quiere conectar contigo!`,
      title: "¡Nueva Solicitud de Match!",
      greeting: "Hola",
      message: (senderName: string, senderUsername: string) => `<strong>${senderName}</strong> (@${senderUsername}) te envió una solicitud de match en Guilda!`,
      button: "Ver Solicitud"
    },
    match_accepted: {
      subject: (name: string) => `¡${name} aceptó tu solicitud!`,
      title: "¡Match Confirmado!",
      greeting: "Hola",
      message: (senderName: string, senderUsername: string) => `<strong>${senderName}</strong> (@${senderUsername}) aceptó tu solicitud de match! Ahora pueden chatear y colaborar juntos.`,
      button: "Iniciar Conversación"
    },
    new_message: {
      subject: (name: string) => `Nuevo mensaje de ${name}`,
      title: "Nuevo Mensaje",
      greeting: "Hola",
      message: (senderName: string) => `<strong>${senderName}</strong> te envió un nuevo mensaje:`,
      button: "Responder"
    },
    project_invite: {
      subject: (name: string) => `¡${name} te invitó a un proyecto!`,
      title: "Invitación de Proyecto",
      greeting: "Hola",
      message: (senderName: string, projectName: string, roleName: string) => `<strong>${senderName}</strong> te invitó a participar en el proyecto <strong>${projectName}</strong> como <strong>${roleName}</strong>!`,
      button: "Ver Invitación"
    },
    welcome: {
      subject: "¡Bienvenido a Guilda!",
      title: "¡Bienvenido a Guilda!",
      greeting: "Hola",
      message: "¡Bienvenido a Guilda! Completa tu perfil y comienza a hacer matches con otros aventureros.",
      tips: "<li>Completa tu perfil con tus habilidades</li><li>Explora la Taberna para conocer otros Builders y Sellers</li><li>Crea o únete a proyectos increíbles</li>",
      button: "Completar Perfil"
    },
    inactivity_reminder: {
      subject: "¡Te extrañamos en Guilda!",
      title: "¡Te extrañamos!",
      greeting: "Hola",
      message: "Hace tiempo que no visitas la Taberna. Mira qué está pasando:",
      button: "Volver a Guilda"
    },
    founder_introduction: {
      subject: (name: string) => `¡${name} te está presentando a alguien!`,
      title: "¡Nueva Presentación de Founder!",
      greeting: "Hola",
      message: (senderName: string, introducedName: string, recipientName: string, isRecipient: boolean) => 
        isRecipient 
          ? `<strong>${senderName}</strong> te está presentando a <strong>${introducedName}</strong>! Esta es una oportunidad de conocer a un potencial socio de negocios.`
          : `<strong>${senderName}</strong> te está presentando a <strong>${recipientName}</strong>! Esta es una oportunidad de conocer a un potencial socio de negocios.`,
      button: "Ver Presentación"
    },
    footer: "Esta es una notificación automática de Guilda."
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { 
      userId, 
      type, 
      title, 
      message, 
      senderName, 
      senderUsername,
      projectName,
      roleName,
      introducedName,
      recipientName,
      locale = 'pt',
      notificationId
    }: NotificationEmailRequest = await req.json();

    console.log("Sending notification email:", { userId, type, title, locale, notificationId });

    // Get user email
    const { data: authUser, error: authError } = await supabaseClient.auth.admin.getUserById(userId);
    
    if (authError || !authUser?.user?.email) {
      console.error("Error getting user email:", authError);
      return new Response(
        JSON.stringify({ error: "User not found or no email" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const userEmail = authUser.user.email;

    // Get user profile for name
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("username")
      .eq("id", userId)
      .single();

    const userName = profile?.username || "Aventureiro";

    // Check email preferences before sending
    const { data: emailPrefs } = await supabaseClient
      .from("email_preferences")
      .select("*")
      .eq("user_id", userId)
      .single();

    const prefMapping: Record<string, string> = {
      match_request: 'match_request',
      match_accepted: 'match_accepted',
      new_message: 'new_message',
      project_invite: 'project_invite',
      weekly_summary: 'weekly_summary',
      inactivity_reminder: 'inactivity_reminder',
      founder_introduction: 'match_request',
    };

    const prefField = prefMapping[type];
    
    if (emailPrefs && prefField && !(emailPrefs as any)[prefField]) {
      console.log(`Email type ${type} disabled for user ${userId}, skipping`);
      return new Response(
        JSON.stringify({ success: true, skipped: true, reason: "User preference disabled" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const t = translations[locale as keyof typeof translations] || translations.pt;

    let emailHtml = "";
    let subject = "";
    let buttonUrl = `${APP_URL}`;
    let buttonText = "";

    switch (type) {
      case "match_request":
        subject = t.match_request.subject(senderName || "");
        buttonUrl = `${APP_URL}/matches`;
        buttonText = t.match_request.button;
        emailHtml = buildEmailTemplate(
          t.match_request.title,
          t.match_request.greeting,
          userName,
          t.match_request.message(senderName || "", senderUsername || "") + `<p style="margin-top: 16px; color: #4b5563;">${message}</p>`,
          buttonUrl,
          buttonText,
          t.footer
        );
        break;

      case "match_accepted":
        subject = t.match_accepted.subject(senderName || "");
        buttonUrl = `${APP_URL}/chat`;
        buttonText = t.match_accepted.button;
        emailHtml = buildEmailTemplate(
          t.match_accepted.title,
          t.match_accepted.greeting,
          userName,
          t.match_accepted.message(senderName || "", senderUsername || ""),
          buttonUrl,
          buttonText,
          t.footer
        );
        break;

      case "new_message":
        subject = t.new_message.subject(senderName || "");
        buttonUrl = `${APP_URL}/chat`;
        buttonText = t.new_message.button;
        const messagePreview = message.substring(0, 200) + (message.length > 200 ? "..." : "");
        emailHtml = buildEmailTemplate(
          t.new_message.title,
          t.new_message.greeting,
          userName,
          t.new_message.message(senderName || "") + `<blockquote style="border-left: 4px solid #7c3aed; padding-left: 16px; margin: 20px 0; color: #374151; background-color: #f3f4f6; padding: 16px; border-radius: 0 8px 8px 0;">${messagePreview}</blockquote>`,
          buttonUrl,
          buttonText,
          t.footer
        );
        break;

      case "project_invite":
        subject = t.project_invite.subject(senderName || "");
        buttonUrl = `${APP_URL}/projects`;
        buttonText = t.project_invite.button;
        emailHtml = buildEmailTemplate(
          t.project_invite.title,
          t.project_invite.greeting,
          userName,
          t.project_invite.message(senderName || "", projectName || "", roleName || "") + `<p style="margin-top: 16px; color: #4b5563;">${message}</p>`,
          buttonUrl,
          buttonText,
          t.footer
        );
        break;

      case "welcome":
        subject = t.welcome.subject;
        buttonUrl = `${APP_URL}/profile`;
        buttonText = t.welcome.button;
        emailHtml = buildEmailTemplate(
          t.welcome.title,
          t.welcome.greeting,
          userName,
          `<p style="color: #4b5563;">${t.welcome.message}</p><ul style="margin: 20px 0; color: #4b5563;">${t.welcome.tips}</ul>`,
          buttonUrl,
          buttonText,
          t.footer
        );
        break;

      case "inactivity_reminder":
        subject = t.inactivity_reminder.subject;
        buttonUrl = `${APP_URL}/tavern`;
        buttonText = t.inactivity_reminder.button;
        emailHtml = buildEmailTemplate(
          t.inactivity_reminder.title,
          t.inactivity_reminder.greeting,
          userName,
          `<p style="color: #4b5563;">${t.inactivity_reminder.message}</p><p style="color: #4b5563;">${message}</p>`,
          buttonUrl,
          buttonText,
          t.footer
        );
        break;

      case "daily_summary":
        subject = locale === 'pt' ? `Seu resumo diário na Guilda` : 
                  locale === 'es' ? `Tu resumen diario en Guilda` : 
                  `Your daily summary on Guilda`;
        buttonUrl = `${APP_URL}`;
        buttonText = locale === 'pt' ? "Acessar Guilda" : 
                     locale === 'es' ? "Acceder a Guilda" : 
                     "Access Guilda";
        emailHtml = buildEmailTemplate(
          locale === 'pt' ? "Resumo Diário" : locale === 'es' ? "Resumen Diario" : "Daily Summary",
          t.match_request.greeting,
          userName,
          `<p style="color: #4b5563;">${message}</p>`,
          buttonUrl,
          buttonText,
          t.footer
        );
        break;

      case "founder_introduction":
        const introTranslations = t.founder_introduction as any;
        subject = introTranslations.subject(senderName || "");
        buttonUrl = `${APP_URL}/messages`;
        buttonText = introTranslations.button;
        const isRecipient = recipientName === userName;
        emailHtml = buildEmailTemplate(
          introTranslations.title,
          introTranslations.greeting,
          userName,
          introTranslations.message(senderName || "", introducedName || "", recipientName || "", isRecipient),
          buttonUrl,
          buttonText,
          t.footer
        );
        break;

      default:
        subject = title;
        buttonUrl = `${APP_URL}`;
        buttonText = "Ver na Guilda";
        emailHtml = buildEmailTemplate(
          title,
          "Olá",
          userName,
          `<p style="color: #4b5563;">${message}</p>`,
          buttonUrl,
          buttonText,
          t.footer
        );
    }

    const result = await sendBrevoEmail({
      to: [{ email: userEmail, name: userName }],
      subject,
      htmlContent: emailHtml,
      tags: [`notification-${type}`]
    });

    if (!result.success) {
      throw new Error(result.error || "Failed to send email");
    }

    // Update notification sent_email flag if notificationId provided
    if (notificationId) {
      await supabaseClient
        .from("notifications")
        .update({ sent_email: true })
        .eq("id", notificationId);
    }

    console.log(`Email sent successfully to ${userEmail}`);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-notification-email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

function buildEmailTemplate(
  title: string,
  greeting: string,
  userName: string,
  content: string,
  buttonUrl: string,
  buttonText: string,
  footer: string
): string {
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
          
          <!-- Body -->
          <tr>
            <td style="padding: 32px 40px;">
              <h2 style="color: #1f2937; font-size: 22px; font-weight: 700; margin: 0 0 16px 0;">
                ${title}
              </h2>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 24px; margin: 0 0 16px 0;">
                ${greeting} <strong style="color: #1f2937;">${userName}</strong>,
              </p>
              
              <div style="color: #4b5563; font-size: 16px; line-height: 24px; margin: 0 0 24px 0;">
                ${content}
              </div>
              
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align: center;">
                    <a href="${buttonUrl}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #9333ea 100%); color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 12px;">
                      ${buttonText}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px 40px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 13px; line-height: 20px; margin: 0; text-align: center;">
                ${footer}
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin: 8px 0 0 0; text-align: center;">
                <a href="${APP_URL}/settings" style="color: #7c3aed; text-decoration: underline;">Gerenciar preferências de email</a>
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

serve(handler);
