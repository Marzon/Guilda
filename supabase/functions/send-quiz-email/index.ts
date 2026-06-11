import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { sendBrevoEmail } from "../_shared/brevo.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOGO_URL = "https://kcyyelhrxlpjdujmtytm.supabase.co/storage/v1/object/public/email-assets/guilda-logo-dark.png";
const STORAGE_BASE = "https://kcyyelhrxlpjdujmtytm.supabase.co/storage/v1/object/public/quiz-reports";

interface ArchetypeEmailData {
  emoji: string;
  name: string;
  tagline: string;
  color: string;
  idealMatch: string;
  reportLink: string;
  subject: string;
}

const ARCHETYPES: Record<string, ArchetypeEmailData> = {
  mago: {
    emoji: "🧙‍♂️",
    name: "Mago do Código",
    tagline: "Você transforma problemas em código — e código em produto.",
    color: "#7610DC",
    idealMatch: "Paladino de Vendas",
    reportLink: `${STORAGE_BASE}/relatorio-mago.pdf`,
    subject: "Seu perfil: 🧙‍♂️ Mago do Código — relatório completo 🎮",
  },
  arquiteto: {
    emoji: "🏗️",
    name: "Arquiteto Visionário",
    tagline: "Você não constrói features — você projeta sistemas.",
    color: "#4308B0",
    idealMatch: "Estrategista Arcano",
    reportLink: `${STORAGE_BASE}/relatorio-arquiteto.pdf`,
    subject: "Seu perfil: 🏗️ Arquiteto Visionário — relatório completo 🎮",
  },
  paladino: {
    emoji: "⚔️",
    name: "Paladino de Vendas",
    tagline: "Você não espera o mercado vir até você — você vai até ele.",
    color: "#F97316",
    idealMatch: "Mago do Código",
    reportLink: `${STORAGE_BASE}/relatorio-paladino.pdf`,
    subject: "Seu perfil: ⚔️ Paladino de Vendas — relatório completo 🎮",
  },
  estrategista: {
    emoji: "🔮",
    name: "Estrategista Arcano",
    tagline: "Você enxerga o tabuleiro inteiro enquanto outros olham só para a próxima jogada.",
    color: "#D97706",
    idealMatch: "Arquiteto Visionário",
    reportLink: `${STORAGE_BASE}/relatorio-estrategista.pdf`,
    subject: "Seu perfil: 🔮 Estrategista Arcano — relatório completo 🎮",
  },
  ranger: {
    emoji: "🏹",
    name: "Ranger Híbrido",
    tagline: "Você faz o que precisa ser feito — não importa o que seja.",
    color: "#6D28D9",
    idealMatch: "Mago do Código ou Paladino de Vendas",
    reportLink: `${STORAGE_BASE}/relatorio-ranger.pdf`,
    subject: "Seu perfil: 🏹 Ranger Híbrido — relatório completo 🎮",
  },
  comandante: {
    emoji: "👑",
    name: "Comandante da Guilda",
    tagline: "Você não constrói produtos nem fecha deals — você constrói times que fazem os dois.",
    color: "#A728EB",
    idealMatch: "Builder forte + Seller forte",
    reportLink: `${STORAGE_BASE}/relatorio-comandante.pdf`,
    subject: "Seu perfil: 👑 Comandante da Guilda — relatório completo 🎮",
  },
};

function buildEmailHtml(a: ArchetypeEmailData): string {
  return `<!DOCTYPE html>
<html lang="pt-BR" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="color-scheme" content="light dark">
  <title>Seu Perfil de Cofundador — Guilda</title>
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; height: 100% !important; }
    @media only screen and (max-width: 620px) {
      .mobile-full { width: 100% !important; }
      .mobile-padding { padding-left: 20px !important; padding-right: 20px !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background-color:#110C1F; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
<div style="display:none; max-height:0; overflow:hidden; mso-hide:all;">
  Seu arquétipo: ${a.emoji} ${a.name} — "${a.tagline}" &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
</div>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#110C1F;">
  <tr>
    <td align="center" style="padding: 40px 16px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="560" class="mobile-full" style="max-width:560px; width:100%;">
        <!-- Logo -->
        <tr>
          <td align="center" style="padding-bottom: 32px;">
            <img src="${LOGO_URL}" alt="Guilda" width="160" style="display:block; width:160px; height:auto;" />
          </td>
        </tr>
        <!-- Card -->
        <tr>
          <td style="background-color:#1A1230; border-radius:16px; overflow:hidden;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr><td style="height:4px; background-color:${a.color}; font-size:1px; line-height:1px;">&nbsp;</td></tr>
              <!-- Resultado -->
              <tr>
                <td align="center" style="padding: 40px 32px 24px;" class="mobile-padding">
                  <div style="font-size:48px; line-height:1;">${a.emoji}</div>
                  <div style="display:inline-block; background-color:rgba(118,16,220,0.2); border-radius:20px; padding:4px 14px; margin:16px 0 12px;">
                    <span style="color:#A728EB; font-size:11px; font-weight:700; letter-spacing:2px; text-transform:uppercase;">SEU ARQUÉTIPO</span>
                  </div>
                  <h1 style="color:#FFFFFF; font-size:28px; font-weight:800; margin:0 0 8px; line-height:1.2;">${a.name}</h1>
                  <p style="color:${a.color}; font-size:15px; font-style:italic; margin:0; line-height:1.5;">"${a.tagline}"</p>
                </td>
              </tr>
              <tr><td style="padding:0 32px;" class="mobile-padding"><div style="height:1px; background-color:#2A1F3D;"></div></td></tr>
              <!-- Intro -->
              <tr>
                <td style="padding: 24px 32px;" class="mobile-padding">
                  <p style="color:#C4B5D9; font-size:15px; line-height:1.7; margin:0;">
                    Oi! Você fez o Quiz do Cofundador da Guilda e seu resultado ficou pronto.
                  </p>
                  <p style="color:#C4B5D9; font-size:15px; line-height:1.7; margin:16px 0 0;">
                    Preparei um relatório completo com tudo que você precisa para dar o próximo passo:
                  </p>
                </td>
              </tr>
              <!-- Lista -->
              <tr>
                <td style="padding: 0 32px 24px;" class="mobile-padding">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr><td style="padding:6px 0; color:#B8A5D0; font-size:14px;"><span style="color:${a.color}; margin-right:8px;">→</span> Análise detalhada do seu perfil de cofundador</td></tr>
                    <tr><td style="padding:6px 0; color:#B8A5D0; font-size:14px;"><span style="color:${a.color}; margin-right:8px;">→</span> Seus 3 pontos fortes e seu ponto cego principal</td></tr>
                    <tr><td style="padding:6px 0; color:#B8A5D0; font-size:14px;"><span style="color:${a.color}; margin-right:8px;">→</span> O perfil exato do cofundador que complementa você</td></tr>
                    <tr><td style="padding:6px 0; color:#B8A5D0; font-size:14px;"><span style="color:${a.color}; margin-right:8px;">→</span> Checklist de compatibilidade para avaliar sócios</td></tr>
                    <tr><td style="padding:6px 0; color:#B8A5D0; font-size:14px;"><span style="color:${a.color}; margin-right:8px;">→</span> Guia prático: como encontrar o cofundador ideal</td></tr>
                  </table>
                </td>
              </tr>
              <!-- CTA Relatório -->
              <tr>
                <td align="center" style="padding: 0 32px 32px;" class="mobile-padding">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="background-color:#F97316; border-radius:10px;">
                        <a href="${a.reportLink}" target="_blank" style="display:inline-block; padding:14px 36px; color:#FFFFFF; font-size:15px; font-weight:700; text-decoration:none; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
                          Abrir Meu Relatório Completo →
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr><td style="padding:0 32px;" class="mobile-padding"><div style="height:1px; background-color:#2A1F3D;"></div></td></tr>
              <!-- Próximo passo -->
              <tr>
                <td style="padding: 28px 32px;" class="mobile-padding">
                  <h2 style="color:#FFFFFF; font-size:18px; font-weight:700; margin:0 0 12px;">Próximo passo?</h2>
                  <p style="color:#C4B5D9; font-size:14px; line-height:1.6; margin:0 0 8px;">
                    Seu cofundador ideal é um(a) <strong style="color:#FFFFFF;">${a.idealMatch}</strong>.
                  </p>
                  <p style="color:#C4B5D9; font-size:14px; line-height:1.6; margin:0 0 20px;">
                    E ele(a) pode já estar na Guilda. A plataforma conecta Builders e Sellers para formarem times cofundadores — com matching por compatibilidade, não por sorte.
                  </p>
                </td>
              </tr>
              <!-- CTA Guilda -->
              <tr>
                <td align="center" style="padding: 0 32px;" class="mobile-padding">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                      <td style="background: linear-gradient(135deg, #7610DC, #4308B0); border-radius:12px; padding:24px; text-align:center;">
                        <p style="color:#FFFFFF; font-size:16px; font-weight:700; margin:0 0 8px;">Encontre seu ${a.idealMatch}</p>
                        <p style="color:#D4C5E8; font-size:13px; margin:0 0 20px; line-height:1.5;">433 founders. Matching por compatibilidade. 100% grátis.</p>
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
                          <tr>
                            <td style="background-color:#F97316; border-radius:8px;">
                              <a href="https://guilda.app.br?utm_source=email&utm_medium=quiz-result&utm_campaign=quiz-empreendedor" target="_blank" style="display:inline-block; padding:12px 28px; color:#FFFFFF; font-size:14px; font-weight:700; text-decoration:none; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
                                Encontrar Meu Cofundador →
                              </a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <!-- PS -->
              <tr>
                <td style="padding: 28px 32px 36px;" class="mobile-padding">
                  <p style="color:#6B5B80; font-size:13px; line-height:1.6; margin:0;">
                    P.S. — Se quiser ir além do match, a <a href="https://guilda.app.br/aceleracao?utm_source=email&utm_medium=quiz-result&utm_campaign=quiz-empreendedor" target="_blank" style="color:#A728EB; text-decoration:underline;">Aceleração Guilda</a> leva duplas cofundadoras de zero a receita real em 15 dias.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td align="center" style="padding: 32px 16px;">
            <p style="color:#3D2E5A; font-size:12px; margin:0 0 8px;">
              <a href="https://guilda.app.br" target="_blank" style="color:#6B5B80; text-decoration:none;">guilda.app.br</a>
            </p>
            <p style="color:#2A1F3D; font-size:11px; margin:0; line-height:1.5;">
              Você recebeu este email porque fez o Quiz do Cofundador da Guilda.<br>
              <a href="https://guilda.app.br/unsub" target="_blank" style="color:#3D2E5A; text-decoration:underline;">Cancelar inscrição</a>
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
    const { email, arquetipo } = await req.json();

    if (!email || !arquetipo) {
      return new Response(
        JSON.stringify({ error: "email and arquetipo are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const archetype = ARCHETYPES[arquetipo];
    if (!archetype) {
      return new Response(
        JSON.stringify({ error: `Unknown archetype: ${arquetipo}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const html = buildEmailHtml(archetype);

    const result = await sendBrevoEmail({
      to: [{ email }],
      subject: archetype.subject,
      htmlContent: html,
      tags: ["quiz-empreendedor", `arquetipo-${arquetipo}`],
    });

    if (!result.success) {
      console.error("[send-quiz-email] Brevo error:", result.error);
      return new Response(
        JSON.stringify({ error: result.error }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[send-quiz-email] Email sent to ${email} for archetype ${arquetipo}`);
    return new Response(
      JSON.stringify({ success: true, messageId: result.messageId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("[send-quiz-email] Error:", msg);
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
