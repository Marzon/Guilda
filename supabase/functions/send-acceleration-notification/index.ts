import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AccelerationNotificationRequest {
  type: 'task_approved' | 'task_rejected' | 'status_changed' | 'daily_reminder' | 'program_completed';
  userId: string;
  cohortId: string;
  taskDay?: number;
  feedback?: string;
  newStatus?: string;
  locale?: string;
}

const translations = {
  pt: {
    task_approved: {
      subject: "🎯 Dia {{day}} Aprovado - Continue Avançando!",
      title: "Missão Aprovada!",
      body: "Sua entrega do Dia {{day}} foi aprovada pelo Commander. Você está agora no Dia {{nextDay}} do Protocolo Do or Die.",
      button: "Continuar Missão",
    },
    task_rejected: {
      subject: "⚠️ Entrega Rejeitada - Resubmeta Agora",
      title: "Entrega Precisa de Ajustes",
      body: "Sua entrega do Dia {{day}} foi rejeitada. Leia o feedback abaixo e tente novamente.",
      button: "Resubmeter",
    },
    status_changed: {
      subject: "📊 Status Atualizado no Do or Die",
      title: "Seu Status Mudou",
      body: "Seu status no programa foi atualizado para: {{status}}",
      button: "Ver Progresso",
    },
    daily_reminder: {
      subject: "⏰ Lembrete: Complete sua Missão de Hoje",
      title: "Não Perca Seu Progresso!",
      body: "Você ainda não completou a missão do Dia {{day}}. Complete agora para não ficar para trás.",
      button: "Completar Missão",
    },
    program_completed: {
      subject: "🏆 Parabéns! Você Sobreviveu ao Do or Die!",
      title: "Missão Completa!",
      body: "Você completou todos os 15 dias do Protocolo Do or Die. Sua ideia foi validada pelo Commander.",
      button: "Ver Conquista",
    },
  },
  en: {
    task_approved: {
      subject: "🎯 Day {{day}} Approved - Keep Moving Forward!",
      title: "Mission Approved!",
      body: "Your Day {{day}} submission was approved by the Commander. You're now on Day {{nextDay}} of the Do or Die Protocol.",
      button: "Continue Mission",
    },
    task_rejected: {
      subject: "⚠️ Submission Rejected - Resubmit Now",
      title: "Submission Needs Adjustments",
      body: "Your Day {{day}} submission was rejected. Read the feedback below and try again.",
      button: "Resubmit",
    },
    status_changed: {
      subject: "📊 Status Updated in Do or Die",
      title: "Your Status Changed",
      body: "Your program status was updated to: {{status}}",
      button: "View Progress",
    },
    daily_reminder: {
      subject: "⏰ Reminder: Complete Today's Mission",
      title: "Don't Lose Your Progress!",
      body: "You haven't completed Day {{day}} mission yet. Complete it now to stay on track.",
      button: "Complete Mission",
    },
    program_completed: {
      subject: "🏆 Congratulations! You Survived Do or Die!",
      title: "Mission Complete!",
      body: "You completed all 15 days of the Do or Die Protocol. Your idea was validated by the Commander.",
      button: "View Achievement",
    },
  },
  es: {
    task_approved: {
      subject: "🎯 Día {{day}} Aprobado - ¡Sigue Avanzando!",
      title: "¡Misión Aprobada!",
      body: "Tu entrega del Día {{day}} fue aprobada por el Commander. Ahora estás en el Día {{nextDay}} del Protocolo Do or Die.",
      button: "Continuar Misión",
    },
    task_rejected: {
      subject: "⚠️ Entrega Rechazada - Reenvía Ahora",
      title: "La Entrega Necesita Ajustes",
      body: "Tu entrega del Día {{day}} fue rechazada. Lee el feedback abajo e intenta de nuevo.",
      button: "Reenviar",
    },
    status_changed: {
      subject: "📊 Estado Actualizado en Do or Die",
      title: "Tu Estado Cambió",
      body: "Tu estado en el programa fue actualizado a: {{status}}",
      button: "Ver Progreso",
    },
    daily_reminder: {
      subject: "⏰ Recordatorio: Completa la Misión de Hoy",
      title: "¡No Pierdas Tu Progreso!",
      body: "Aún no completaste la misión del Día {{day}}. Complétala ahora para no quedarte atrás.",
      button: "Completar Misión",
    },
    program_completed: {
      subject: "🏆 ¡Felicitaciones! ¡Sobreviviste al Do or Die!",
      title: "¡Misión Completa!",
      body: "Completaste los 15 días del Protocolo Do or Die. Tu idea fue validada por el Commander.",
      button: "Ver Logro",
    },
  },
};

const APP_URL = "https://theguilda.lovable.app";

function replaceTemplateVars(text: string, vars: Record<string, string | number>): string {
  let result = text;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
  }
  return result;
}

function buildEmailTemplate(
  title: string,
  body: string,
  feedback: string | null,
  buttonText: string,
  buttonUrl: string,
  userName: string
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #1a1a1a; border-radius: 12px; border: 1px solid #333;">
          <tr>
            <td style="padding: 40px; text-align: center;">
              <!-- Logo/Header -->
              <div style="margin-bottom: 24px;">
                <span style="font-size: 32px;">⚔️</span>
              </div>
              
              <!-- Title -->
              <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0 0 16px 0;">
                ${title}
              </h1>
              
              <!-- Greeting -->
              <p style="color: #a3a3a3; font-size: 16px; margin: 0 0 24px 0;">
                Olá, <strong style="color: #ffffff;">${userName}</strong>
              </p>
              
              <!-- Body -->
              <p style="color: #d4d4d4; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                ${body}
              </p>
              
              ${feedback ? `
              <!-- Feedback Box -->
              <div style="background-color: #262626; border-left: 4px solid #f59e0b; padding: 16px; margin: 0 0 24px 0; text-align: left; border-radius: 0 8px 8px 0;">
                <p style="color: #fbbf24; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">
                  Feedback do Commander:
                </p>
                <p style="color: #d4d4d4; font-size: 14px; line-height: 1.5; margin: 0; white-space: pre-wrap;">
                  ${feedback}
                </p>
              </div>
              ` : ''}
              
              <!-- CTA Button -->
              <a href="${buttonUrl}" style="display: inline-block; background-color: #f59e0b; color: #0a0a0a; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px; margin-bottom: 24px;">
                ${buttonText} →
              </a>
              
              <!-- Footer -->
              <p style="color: #525252; font-size: 12px; margin: 24px 0 0 0;">
                Do or Die Protocol • The Guilda
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const brevoApiKey = Deno.env.get("BREVO_API_KEY");
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body: AccelerationNotificationRequest = await req.json();
    const { type, userId, cohortId, taskDay, feedback, newStatus, locale = 'pt' } = body;

    console.log(`Processing acceleration notification: type=${type}, userId=${userId}, taskDay=${taskDay}`);

    // Get user info
    const { data: profile } = await supabase
      .from("profiles")
      .select("username, avatar_url")
      .eq("id", userId)
      .single();

    const { data: authUser } = await supabase.auth.admin.getUserById(userId);
    const userEmail = authUser?.user?.email;
    const userName = profile?.username || userEmail?.split('@')[0] || 'Founder';

    if (!userEmail) {
      console.error("No email found for user:", userId);
      return new Response(
        JSON.stringify({ error: "User email not found" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check email preferences
    const { data: prefs } = await supabase
      .from("email_preferences")
      .select("acceleration_updates")
      .eq("user_id", userId)
      .single();

    if (prefs?.acceleration_updates === false) {
      console.log("User has acceleration updates disabled, skipping email");
      return new Response(
        JSON.stringify({ success: true, skipped: true, reason: "preferences_disabled" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get translations
    const lang = (locale in translations ? locale : 'pt') as keyof typeof translations;
    const t = translations[lang][type];

    if (!t) {
      console.error("Unknown notification type:", type);
      return new Response(
        JSON.stringify({ error: "Unknown notification type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Prepare template variables
    const vars: Record<string, string | number> = {
      day: taskDay || 1,
      nextDay: (taskDay || 1) + 1,
      status: newStatus || '',
    };

    const subject = replaceTemplateVars(t.subject, vars);
    const emailBody = replaceTemplateVars(t.body, vars);
    const buttonText = t.button;
    const buttonUrl = `${APP_URL}/tavern`;

    // Build email HTML
    const htmlContent = buildEmailTemplate(
      t.title,
      emailBody,
      feedback || null,
      buttonText,
      buttonUrl,
      userName
    );

    // Send email via Brevo if configured
    if (brevoApiKey) {
      const emailResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "api-key": brevoApiKey,
        },
        body: JSON.stringify({
          sender: { name: "The Guilda", email: "noreply@theguilda.com" },
          to: [{ email: userEmail, name: userName }],
          subject,
          htmlContent,
        }),
      });

      if (!emailResponse.ok) {
        const errorText = await emailResponse.text();
        console.error("Brevo error:", emailResponse.status, errorText);
        throw new Error(`Email sending failed: ${errorText}`);
      }

      console.log("Email sent successfully to:", userEmail);
    } else {
      console.log("BREVO_API_KEY not configured, skipping email send");
    }

    // Create in-app notification
    const notificationData = {
      user_id: userId,
      type: `acceleration_${type}`,
      title: t.title,
      message: emailBody,
      data: { cohortId, taskDay, feedback, newStatus },
      is_read: false,
    };

    const { error: notifError } = await supabase
      .from("notifications")
      .insert(notificationData);

    if (notifError) {
      console.error("Failed to create notification:", notifError);
    }

    return new Response(
      JSON.stringify({ success: true, emailSent: !!brevoApiKey }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in send-acceleration-notification:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});