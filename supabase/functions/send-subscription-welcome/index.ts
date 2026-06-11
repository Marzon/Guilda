import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { sendBrevoEmail } from "../_shared/brevo.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  user_email: string;
  user_name: string;
  tier: "ADVENTURER" | "FOUNDER";
  product_type?: "adventurer_pass" | "founder_pass" | "founders_pass";
  locale: string;
}

const getEmailContent = (tier: "ADVENTURER" | "FOUNDER", productType: string | undefined, locale: string, userName: string) => {
  const baseUrl = "https://guilda.app.br";
  const isLifetime = productType === 'founders_pass';
  const isSemestral = productType === 'founder_pass' || productType === 'adventurer_pass';
  
  const content = {
    pt: {
      ADVENTURER: {
        subject: "⚔️ Bem-vindo ao Adventurer Pass, Explorador!",
        title: "Você é um Explorador agora!",
        planName: "Adventurer Pass (6 meses)",
        greeting: `Olá ${userName}!`,
        intro: "Parabéns pela sua decisão de se tornar um Explorador! Sua jornada na Guilda acaba de ficar muito mais emocionante.",
        benefits: [
          "✅ 10 convites por dia para expandir sua rede",
          "✅ Veja quem curtiu seu perfil",
          "✅ Filtros avançados para encontrar o co-founder ideal",
          "✅ Badge exclusivo de Explorador ⚔️",
          "✅ Mensagens diretas ilimitadas"
        ],
        validityNote: "⏰ Seu plano é válido por 6 meses a partir de hoje.",
        tipsTitle: "💡 Dicas para aproveitar ao máximo:",
        tips: [
          "🎯 Use seus 10 convites diários estrategicamente - priorize perfis com habilidades complementares",
          "👀 Verifique regularmente quem curtiu você - pode ser seu próximo co-founder!",
          "🔍 Use os filtros para encontrar Builders se você é Seller, e vice-versa"
        ],
        cta: "Começar a Explorar",
        ctaUrl: `${baseUrl}/tavern`,
        footer: "Boas aventuras!"
      },
      FOUNDER: isLifetime ? {
        subject: "👑 Bem-vindo à Elite dos Fundadores - Acesso Vitalício!",
        title: "Você é um Fundador Vitalício!",
        planName: "Founders Pass (Lifetime)",
        greeting: `Olá ${userName}!`,
        intro: "Você fez a escolha dos verdadeiros visionários! Como Fundador Vitalício, você tem acesso ilimitado à Guilda PARA SEMPRE. Sem renovações, sem preocupações.",
        benefits: [
          "✅ Convites ILIMITADOS - expanda sua rede sem limites",
          "✅ Veja quem curtiu seu perfil",
          "✅ Filtros avançados para encontrar o co-founder ideal",
          "✅ Badge exclusivo de Fundador 👑",
          "✅ Mensagens diretas ilimitadas",
          "✅ Acesso prioritário a novas features",
          "✅ 🎉 ACESSO VITALÍCIO - nunca expira!"
        ],
        validityNote: "🎉 Seu acesso é VITALÍCIO - não precisa renovar nunca!",
        tipsTitle: "💡 Dicas para Fundadores:",
        tips: [
          "🚀 Com convites ilimitados, expanda sua rede agressivamente",
          "🔥 Use o Tavern Board (R$19,90) para destacar seu perfil por 48h",
          "📋 Crie projetos e convide talentos diretamente",
          "🤝 Faça parte da elite de early adopters da Guilda"
        ],
        cta: "Entrar na Guilda",
        ctaUrl: `${baseUrl}/tavern`,
        footer: "Boas conquistas, Fundador!"
      } : {
        subject: "👑 Bem-vindo ao Founder Pass Semestral!",
        title: "Você é um Fundador agora!",
        planName: "Founder Pass (6 meses)",
        greeting: `Olá ${userName}!`,
        intro: "Parabéns por se tornar um Fundador! Você agora tem acesso premium à Guilda pelos próximos 6 meses.",
        benefits: [
          "✅ Convites ILIMITADOS - expanda sua rede sem limites",
          "✅ Veja quem curtiu seu perfil",
          "✅ Filtros avançados para encontrar o co-founder ideal",
          "✅ Badge exclusivo de Fundador 👑",
          "✅ Mensagens diretas ilimitadas",
          "✅ Acesso prioritário a novas features"
        ],
        validityNote: "⏰ Seu plano é válido por 6 meses a partir de hoje.",
        tipsTitle: "💡 Dicas para Fundadores:",
        tips: [
          "🚀 Com convites ilimitados, expanda sua rede agressivamente",
          "🔥 Use o Tavern Board (R$19,90) para destacar seu perfil por 48h",
          "📋 Crie projetos e convide talentos diretamente",
          "💎 Considere o upgrade para Lifetime (R$97) para acesso vitalício!"
        ],
        cta: "Entrar na Guilda",
        ctaUrl: `${baseUrl}/tavern`,
        footer: "Boas conquistas, Fundador!"
      }
    },
    en: {
      ADVENTURER: {
        subject: "⚔️ Welcome to Adventurer Pass, Explorer!",
        title: "You're an Explorer now!",
        planName: "Adventurer Pass (6 months)",
        greeting: `Hello ${userName}!`,
        intro: "Congratulations on your decision to become an Explorer! Your journey in the Guild just got a lot more exciting.",
        benefits: [
          "✅ 10 invites per day to expand your network",
          "✅ See who liked your profile",
          "✅ Advanced filters to find the ideal co-founder",
          "✅ Exclusive Explorer badge ⚔️",
          "✅ Unlimited direct messages"
        ],
        validityNote: "⏰ Your plan is valid for 6 months starting today.",
        tipsTitle: "💡 Tips to make the most of it:",
        tips: [
          "🎯 Use your 10 daily invites strategically - prioritize profiles with complementary skills",
          "👀 Check regularly who liked you - could be your next co-founder!",
          "🔍 Use filters to find Builders if you're a Seller, and vice-versa"
        ],
        cta: "Start Exploring",
        ctaUrl: `${baseUrl}/tavern`,
        footer: "Happy adventures!"
      },
      FOUNDER: isLifetime ? {
        subject: "👑 Welcome to the Founders Elite - Lifetime Access!",
        title: "You're a Lifetime Founder!",
        planName: "Founders Pass (Lifetime)",
        greeting: `Hello ${userName}!`,
        intro: "You made the choice of true visionaries! As a Lifetime Founder, you have unlimited access to the Guild FOREVER. No renewals, no worries.",
        benefits: [
          "✅ UNLIMITED invites - expand your network without limits",
          "✅ See who liked your profile",
          "✅ Advanced filters to find the ideal co-founder",
          "✅ Exclusive Founder badge 👑",
          "✅ Unlimited direct messages",
          "✅ Priority access to new features",
          "✅ 🎉 LIFETIME ACCESS - never expires!"
        ],
        validityNote: "🎉 Your access is LIFETIME - never needs renewal!",
        tipsTitle: "💡 Tips for Founders:",
        tips: [
          "🚀 With unlimited invites, expand your network aggressively",
          "🔥 Use Tavern Board (R$19.90) to highlight your profile for 48h",
          "📋 Create projects and invite talents directly",
          "🤝 Be part of the early adopter elite of the Guild"
        ],
        cta: "Enter the Guild",
        ctaUrl: `${baseUrl}/tavern`,
        footer: "Great conquests, Founder!"
      } : {
        subject: "👑 Welcome to Founder Pass (6 months)!",
        title: "You're a Founder now!",
        planName: "Founder Pass (6 months)",
        greeting: `Hello ${userName}!`,
        intro: "Congratulations on becoming a Founder! You now have premium access to the Guild for the next 6 months.",
        benefits: [
          "✅ UNLIMITED invites - expand your network without limits",
          "✅ See who liked your profile",
          "✅ Advanced filters to find the ideal co-founder",
          "✅ Exclusive Founder badge 👑",
          "✅ Unlimited direct messages",
          "✅ Priority access to new features"
        ],
        validityNote: "⏰ Your plan is valid for 6 months starting today.",
        tipsTitle: "💡 Tips for Founders:",
        tips: [
          "🚀 With unlimited invites, expand your network aggressively",
          "🔥 Use Tavern Board (R$19.90) to highlight your profile for 48h",
          "📋 Create projects and invite talents directly",
          "💎 Consider upgrading to Lifetime (R$97) for forever access!"
        ],
        cta: "Enter the Guild",
        ctaUrl: `${baseUrl}/tavern`,
        footer: "Great conquests, Founder!"
      }
    },
    es: {
      ADVENTURER: {
        subject: "⚔️ ¡Bienvenido al Adventurer Pass, Explorador!",
        title: "¡Ahora eres un Explorador!",
        planName: "Adventurer Pass (6 meses)",
        greeting: `¡Hola ${userName}!`,
        intro: "¡Felicidades por tu decisión de convertirte en Explorador! Tu viaje en el Gremio acaba de volverse mucho más emocionante.",
        benefits: [
          "✅ 10 invitaciones por día para expandir tu red",
          "✅ Ve quién le gustó tu perfil",
          "✅ Filtros avanzados para encontrar al co-fundador ideal",
          "✅ Insignia exclusiva de Explorador ⚔️",
          "✅ Mensajes directos ilimitados"
        ],
        validityNote: "⏰ Tu plan es válido por 6 meses a partir de hoy.",
        tipsTitle: "💡 Consejos para aprovechar al máximo:",
        tips: [
          "🎯 Usa tus 10 invitaciones diarias estratégicamente - prioriza perfiles con habilidades complementarias",
          "👀 Revisa regularmente quién te dio like - ¡podría ser tu próximo co-fundador!",
          "🔍 Usa los filtros para encontrar Builders si eres Seller, y viceversa"
        ],
        cta: "Empezar a Explorar",
        ctaUrl: `${baseUrl}/tavern`,
        footer: "¡Buenas aventuras!"
      },
      FOUNDER: isLifetime ? {
        subject: "👑 ¡Bienvenido a la Élite de Fundadores - Acceso Vitalicio!",
        title: "¡Eres un Fundador Vitalicio!",
        planName: "Founders Pass (Lifetime)",
        greeting: `¡Hola ${userName}!`,
        intro: "¡Hiciste la elección de los verdaderos visionarios! Como Fundador Vitalicio, tienes acceso ilimitado al Gremio PARA SIEMPRE. Sin renovaciones, sin preocupaciones.",
        benefits: [
          "✅ Invitaciones ILIMITADAS - expande tu red sin límites",
          "✅ Ve quién le gustó tu perfil",
          "✅ Filtros avanzados para encontrar al co-fundador ideal",
          "✅ Insignia exclusiva de Fundador 👑",
          "✅ Mensajes directos ilimitados",
          "✅ Acceso prioritario a nuevas funciones",
          "✅ 🎉 ¡ACCESO VITALICIO - nunca expira!"
        ],
        validityNote: "🎉 ¡Tu acceso es VITALICIO - nunca necesita renovación!",
        tipsTitle: "💡 Consejos para Fundadores:",
        tips: [
          "🚀 Con invitaciones ilimitadas, expande tu red agresivamente",
          "🔥 Usa el Tavern Board (R$19,90) para destacar tu perfil por 48h",
          "📋 Crea proyectos e invita talentos directamente",
          "🤝 Sé parte de la élite de early adopters del Gremio"
        ],
        cta: "Entrar al Gremio",
        ctaUrl: `${baseUrl}/tavern`,
        footer: "¡Grandes conquistas, Fundador!"
      } : {
        subject: "👑 ¡Bienvenido al Founder Pass (6 meses)!",
        title: "¡Ahora eres un Fundador!",
        planName: "Founder Pass (6 meses)",
        greeting: `¡Hola ${userName}!`,
        intro: "¡Felicidades por convertirte en Fundador! Ahora tienes acceso premium al Gremio por los próximos 6 meses.",
        benefits: [
          "✅ Invitaciones ILIMITADAS - expande tu red sin límites",
          "✅ Ve quién le gustó tu perfil",
          "✅ Filtros avanzados para encontrar al co-fundador ideal",
          "✅ Insignia exclusiva de Fundador 👑",
          "✅ Mensajes directos ilimitados",
          "✅ Acceso prioritario a nuevas funciones"
        ],
        validityNote: "⏰ Tu plan es válido por 6 meses a partir de hoy.",
        tipsTitle: "💡 Consejos para Fundadores:",
        tips: [
          "🚀 Con invitaciones ilimitadas, expande tu red agresivamente",
          "🔥 Usa el Tavern Board (R$19,90) para destacar tu perfil por 48h",
          "📋 Crea proyectos e invita talentos directamente",
          "💎 ¡Considera el upgrade a Lifetime (R$97) para acceso vitalicio!"
        ],
        cta: "Entrar al Gremio",
        ctaUrl: `${baseUrl}/tavern`,
        footer: "¡Grandes conquistas, Fundador!"
      }
    }
  };

  const localeContent = content[locale as keyof typeof content] || content.en;
  return localeContent[tier];
};

const generateEmailHtml = (emailContent: ReturnType<typeof getEmailContent>, tier: "ADVENTURER" | "FOUNDER", isLifetime: boolean) => {
  const badgeColor = tier === "FOUNDER" ? (isLifetime ? "#F59E0B" : "#EAB308") : "#D97706";
  const badgeEmoji = tier === "FOUNDER" ? "👑" : "⚔️";
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${emailContent.subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0B0E14; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0B0E14; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(180deg, #1a1f2e 0%, #0d1117 100%); border-radius: 16px; border: 1px solid #30363d; overflow: hidden;">
          
          <!-- Header with Badge -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, ${badgeColor}20 0%, transparent 50%);">
              <div style="width: 80px; height: 80px; margin: 0 auto 20px; background: linear-gradient(135deg, ${badgeColor}, ${badgeColor}99); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 40px; line-height: 80px;">
                ${badgeEmoji}
              </div>
              <h1 style="color: #ffffff; font-size: 28px; margin: 0; font-weight: bold;">
                ${emailContent.title}
              </h1>
              <p style="color: ${badgeColor}; font-size: 14px; margin: 10px 0 0; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                ${emailContent.planName}
              </p>
            </td>
          </tr>
          
          <!-- Greeting -->
          <tr>
            <td style="padding: 0 40px 20px;">
              <p style="color: #e6edf3; font-size: 18px; margin: 0;">
                ${emailContent.greeting}
              </p>
            </td>
          </tr>
          
          <!-- Intro -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <p style="color: #8b949e; font-size: 16px; line-height: 1.6; margin: 0;">
                ${emailContent.intro}
              </p>
            </td>
          </tr>
          
          <!-- Validity Note -->
          <tr>
            <td style="padding: 0 40px 20px;">
              <div style="background: ${isLifetime ? '#22c55e20' : '#f59e0b20'}; border: 1px solid ${isLifetime ? '#22c55e40' : '#f59e0b40'}; border-radius: 8px; padding: 12px 16px;">
                <p style="color: ${isLifetime ? '#22c55e' : '#f59e0b'}; font-size: 14px; margin: 0; font-weight: 600;">
                  ${emailContent.validityNote}
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Benefits Box -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <div style="background: #161b22; border: 1px solid #30363d; border-radius: 12px; padding: 24px;">
                <h3 style="color: ${badgeColor}; font-size: 16px; margin: 0 0 16px; text-transform: uppercase; letter-spacing: 1px;">
                  Seus Benefícios
                </h3>
                ${emailContent.benefits.map(b => `
                  <p style="color: #e6edf3; font-size: 15px; margin: 0 0 12px; line-height: 1.5;">
                    ${b}
                  </p>
                `).join('')}
              </div>
            </td>
          </tr>
          
          <!-- Tips Section -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <h3 style="color: #ffffff; font-size: 18px; margin: 0 0 16px;">
                ${emailContent.tipsTitle}
              </h3>
              ${emailContent.tips.map(t => `
                <p style="color: #8b949e; font-size: 14px; margin: 0 0 12px; line-height: 1.6; padding-left: 8px; border-left: 2px solid ${badgeColor};">
                  ${t}
                </p>
              `).join('')}
            </td>
          </tr>
          
          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 40px 40px; text-align: center;">
              <a href="${emailContent.ctaUrl}" style="display: inline-block; background: linear-gradient(135deg, #8B5CF6, #7C3AED); color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; padding: 16px 40px; border-radius: 8px; box-shadow: 0 4px 20px rgba(139, 92, 246, 0.4);">
                ${emailContent.cta}
              </a>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background: #0d1117; border-top: 1px solid #30363d; text-align: center;">
              <p style="color: #8b949e; font-size: 14px; margin: 0 0 8px;">
                ${emailContent.footer}
              </p>
              <p style="color: #6e7681; font-size: 12px; margin: 0;">
                GUILDA - Conectando Builders e Sellers
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
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate service role key authentication
    const authHeader = req.headers.get("Authorization");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!authHeader || !serviceRoleKey) {
      console.error("Missing authorization header or service role key");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    
    const token = authHeader.replace("Bearer ", "");
    if (token !== serviceRoleKey) {
      console.error("Invalid service role key provided");
      return new Response(
        JSON.stringify({ error: "Unauthorized - invalid credentials" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { user_email, user_name, tier, product_type, locale }: WelcomeEmailRequest = await req.json();

    const isLifetime = product_type === 'founders_pass';
    
    console.log(`Sending welcome email to ${user_email} for tier ${tier}, product: ${product_type || 'unknown'}, locale ${locale}, lifetime: ${isLifetime}`);

    const emailContent = getEmailContent(tier, product_type, locale || 'pt', user_name);
    const html = generateEmailHtml(emailContent, tier, isLifetime);

    const result = await sendBrevoEmail({
      to: [{ email: user_email, name: user_name }],
      subject: emailContent.subject,
      htmlContent: html,
      tags: [`welcome-${tier.toLowerCase()}`]
    });

    if (!result.success) {
      console.error("Brevo error:", result.error);
      throw new Error(result.error || "Failed to send email");
    }

    console.log("Welcome email sent successfully:", result.messageId);

    return new Response(JSON.stringify({ success: true, messageId: result.messageId }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-subscription-welcome:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
