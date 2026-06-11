import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { sendBrevoEmail } from "../_shared/brevo.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CalculationEmailRequest {
  email: string;
  tool_name: string;
  calculation_data: Record<string, unknown>;
  locale: string;
}

// Translations for email content
const translations: Record<string, Record<string, string>> = {
  pt: {
    greeting: "Olá!",
    intro: "Aqui estão os resultados do seu cálculo:",
    runwayTitle: "Calculadora de Runway",
    valuationTitle: "Calculadora de Valuation",
    captableTitle: "Simulador de Cap Table",
    equityTitle: "Calculadora de Equity",
    currentBalance: "Saldo Atual",
    burnRate: "Burn Rate Mensal",
    runwayMonths: "Meses de Runway",
    netBurn: "Burn Líquido",
    revenue: "Receita Mensal",
    method: "Método",
    estimatedValue: "Valuation Estimado",
    shareholder: "Sócio",
    shares: "Ações",
    percentage: "Participação",
    totalShares: "Total de Ações",
    founder: "Fundador",
    weights: "Pesos Utilizados",
    distribution: "Divisão Sugerida",
    idea: "Ideia",
    execution: "Execução",
    investment: "Investimento",
    expertise: "Expertise",
    ctaTitle: "Quer salvar seus cálculos?",
    ctaDescription: "Crie uma conta gratuita para salvar cálculos ilimitados e exportar PDFs profissionais.",
    ctaButton: "Criar Conta Grátis",
    footer: "Você recebeu este email porque solicitou os resultados de uma calculadora do Guilda.",
    exploreMore: "Explore mais ferramentas gratuitas em",
    runwaySubject: "Seu cálculo de Runway está pronto! 📊",
    valuationSubject: "Seu cálculo de Valuation está pronto! 💰",
    captableSubject: "Seu Cap Table está pronto! 📈",
    equitySubject: "Sua divisão de Equity está pronta! ⚖️",
    genericSubject: "Seus resultados de cálculo estão prontos!",
    status: "Status",
    critical: "Crítico",
    attention: "Atenção",
    healthy: "Saudável",
  },
  en: {
    greeting: "Hello!",
    intro: "Here are the results of your calculation:",
    runwayTitle: "Runway Calculator",
    valuationTitle: "Valuation Calculator",
    captableTitle: "Cap Table Simulator",
    equityTitle: "Equity Calculator",
    currentBalance: "Current Balance",
    burnRate: "Monthly Burn Rate",
    runwayMonths: "Runway Months",
    netBurn: "Net Burn",
    revenue: "Monthly Revenue",
    method: "Method",
    estimatedValue: "Estimated Valuation",
    shareholder: "Shareholder",
    shares: "Shares",
    percentage: "Ownership",
    totalShares: "Total Shares",
    founder: "Founder",
    weights: "Weights Used",
    distribution: "Suggested Distribution",
    idea: "Idea",
    execution: "Execution",
    investment: "Investment",
    expertise: "Expertise",
    ctaTitle: "Want to save your calculations?",
    ctaDescription: "Create a free account to save unlimited calculations and export professional PDFs.",
    ctaButton: "Create Free Account",
    footer: "You received this email because you requested calculation results from Guilda.",
    exploreMore: "Explore more free tools at",
    runwaySubject: "Your Runway calculation is ready! 📊",
    valuationSubject: "Your Valuation calculation is ready! 💰",
    captableSubject: "Your Cap Table is ready! 📈",
    equitySubject: "Your Equity distribution is ready! ⚖️",
    genericSubject: "Your calculation results are ready!",
    status: "Status",
    critical: "Critical",
    attention: "Attention",
    healthy: "Healthy",
  },
  es: {
    greeting: "¡Hola!",
    intro: "Aquí están los resultados de tu cálculo:",
    runwayTitle: "Calculadora de Runway",
    valuationTitle: "Calculadora de Valuación",
    captableTitle: "Simulador de Cap Table",
    equityTitle: "Calculadora de Equity",
    currentBalance: "Saldo Actual",
    burnRate: "Burn Rate Mensual",
    runwayMonths: "Meses de Runway",
    netBurn: "Burn Neto",
    revenue: "Ingreso Mensual",
    method: "Método",
    estimatedValue: "Valuación Estimada",
    shareholder: "Socio",
    shares: "Acciones",
    percentage: "Participación",
    totalShares: "Total de Acciones",
    founder: "Fundador",
    weights: "Pesos Utilizados",
    distribution: "Distribución Sugerida",
    idea: "Idea",
    execution: "Ejecución",
    investment: "Inversión",
    expertise: "Experiencia",
    ctaTitle: "¿Quieres guardar tus cálculos?",
    ctaDescription: "Crea una cuenta gratuita para guardar cálculos ilimitados y exportar PDFs profesionales.",
    ctaButton: "Crear Cuenta Gratis",
    footer: "Recibiste este email porque solicitaste los resultados de una calculadora de Guilda.",
    exploreMore: "Explora más herramientas gratuitas en",
    runwaySubject: "¡Tu cálculo de Runway está listo! 📊",
    valuationSubject: "¡Tu cálculo de Valuación está listo! 💰",
    captableSubject: "¡Tu Cap Table está listo! 📈",
    equitySubject: "¡Tu distribución de Equity está lista! ⚖️",
    genericSubject: "¡Tus resultados de cálculo están listos!",
    status: "Estado",
    critical: "Crítico",
    attention: "Atención",
    healthy: "Saludable",
  },
};

function getT(locale: string): Record<string, string> {
  return translations[locale] || translations.en;
}

function formatCurrency(value: number, locale: string): string {
  const currency = locale === 'pt' ? 'BRL' : locale === 'es' ? 'USD' : 'USD';
  const symbol = locale === 'pt' ? 'R$' : '$';
  return `${symbol} ${value.toLocaleString(locale === 'pt' ? 'pt-BR' : locale === 'es' ? 'es-ES' : 'en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function getSubject(toolName: string, t: Record<string, string>): string {
  switch (toolName) {
    case 'runway': return t.runwaySubject;
    case 'valuation': return t.valuationSubject;
    case 'captable': return t.captableSubject;
    case 'equity': return t.equitySubject;
    default: return t.genericSubject;
  }
}

function getToolTitle(toolName: string, t: Record<string, string>): string {
  switch (toolName) {
    case 'runway': return t.runwayTitle;
    case 'valuation': return t.valuationTitle;
    case 'captable': return t.captableTitle;
    case 'equity': return t.equityTitle;
    default: return toolName;
  }
}

function generateRunwayContent(data: Record<string, unknown>, t: Record<string, string>, locale: string): string {
  const balance = Number(data.currentBalance || data.balance || 0);
  const expenses = Number(data.monthlyExpenses || data.expenses || 0);
  const revenue = Number(data.monthlyRevenue || data.revenue || 0);
  const netBurn = expenses - revenue;
  const runwayMonths = netBurn > 0 ? Math.floor(balance / netBurn) : Infinity;
  
  let statusLabel = t.healthy;
  let statusColor = '#10B981';
  if (runwayMonths < 6) {
    statusLabel = t.critical;
    statusColor = '#EF4444';
  } else if (runwayMonths < 12) {
    statusLabel = t.attention;
    statusColor = '#F59E0B';
  }

  return `
    <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <div style="font-size: 48px; font-weight: bold; color: #8B5CF6;">${runwayMonths === Infinity ? '∞' : runwayMonths}</div>
        <div style="color: #9CA3AF; font-size: 14px;">${t.runwayMonths}</div>
        <div style="display: inline-block; background: ${statusColor}22; color: ${statusColor}; padding: 4px 12px; border-radius: 20px; margin-top: 8px; font-size: 12px;">
          ${statusLabel}
        </div>
      </div>
      <table style="width: 100%; border-collapse: collapse;">
        <tr style="border-bottom: 1px solid #374151;">
          <td style="padding: 12px 0; color: #9CA3AF;">${t.currentBalance}</td>
          <td style="padding: 12px 0; color: #FFFFFF; text-align: right; font-weight: 500;">${formatCurrency(balance, locale)}</td>
        </tr>
        <tr style="border-bottom: 1px solid #374151;">
          <td style="padding: 12px 0; color: #9CA3AF;">${t.burnRate}</td>
          <td style="padding: 12px 0; color: #EF4444; text-align: right; font-weight: 500;">-${formatCurrency(expenses, locale)}</td>
        </tr>
        <tr style="border-bottom: 1px solid #374151;">
          <td style="padding: 12px 0; color: #9CA3AF;">${t.revenue}</td>
          <td style="padding: 12px 0; color: #10B981; text-align: right; font-weight: 500;">+${formatCurrency(revenue, locale)}</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; color: #9CA3AF;">${t.netBurn}</td>
          <td style="padding: 12px 0; color: #F59E0B; text-align: right; font-weight: 500;">${formatCurrency(netBurn, locale)}</td>
        </tr>
      </table>
    </div>
  `;
}

function generateValuationContent(data: Record<string, unknown>, t: Record<string, string>, locale: string): string {
  const method = String(data.method || 'DCF');
  const valuation = Number(data.valuation || data.estimatedValue || 0);

  return `
    <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <div style="font-size: 36px; font-weight: bold; color: #10B981;">${formatCurrency(valuation, locale)}</div>
        <div style="color: #9CA3AF; font-size: 14px;">${t.estimatedValue}</div>
      </div>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 12px 0; color: #9CA3AF;">${t.method}</td>
          <td style="padding: 12px 0; color: #8B5CF6; text-align: right; font-weight: 500;">${method}</td>
        </tr>
      </table>
    </div>
  `;
}

function generateCapTableContent(data: Record<string, unknown>, t: Record<string, string>): string {
  const shareholders = (data.shareholders || data.founders || []) as Array<{ name: string; shares?: number; percentage?: number }>;
  const totalShares = Number(data.totalShares || shareholders.reduce((sum, s) => sum + (s.shares || 0), 0));

  let tableRows = '';
  shareholders.forEach((sh, idx) => {
    const pct = sh.percentage || (sh.shares && totalShares ? ((sh.shares / totalShares) * 100).toFixed(1) : '0');
    tableRows += `
      <tr style="border-bottom: 1px solid #374151;">
        <td style="padding: 12px 0; color: #FFFFFF;">${sh.name || `${t.founder} ${idx + 1}`}</td>
        <td style="padding: 12px 0; color: #9CA3AF; text-align: center;">${sh.shares?.toLocaleString() || '-'}</td>
        <td style="padding: 12px 0; color: #8B5CF6; text-align: right; font-weight: 500;">${pct}%</td>
      </tr>
    `;
  });

  return `
    <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="border-bottom: 2px solid #374151;">
            <th style="padding: 12px 0; color: #9CA3AF; text-align: left; font-weight: 500;">${t.shareholder}</th>
            <th style="padding: 12px 0; color: #9CA3AF; text-align: center; font-weight: 500;">${t.shares}</th>
            <th style="padding: 12px 0; color: #9CA3AF; text-align: right; font-weight: 500;">${t.percentage}</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
        <tfoot>
          <tr>
            <td style="padding: 12px 0; color: #FFFFFF; font-weight: bold;">${t.totalShares}</td>
            <td style="padding: 12px 0; color: #FFFFFF; text-align: center; font-weight: bold;">${totalShares.toLocaleString()}</td>
            <td style="padding: 12px 0; color: #8B5CF6; text-align: right; font-weight: bold;">100%</td>
          </tr>
        </tfoot>
      </table>
    </div>
  `;
}

function generateEquityContent(data: Record<string, unknown>, t: Record<string, string>): string {
  const founders = (data.founders || data.shareholders || []) as Array<{ name: string; percentage?: number; equity?: number }>;
  const weights = data.weights as Record<string, number> || {};

  let foundersRows = '';
  founders.forEach((f, idx) => {
    const pct = f.percentage || f.equity || 0;
    foundersRows += `
      <tr style="border-bottom: 1px solid #374151;">
        <td style="padding: 12px 0; color: #FFFFFF;">${f.name || `${t.founder} ${idx + 1}`}</td>
        <td style="padding: 12px 0; color: #8B5CF6; text-align: right; font-weight: 500;">${Number(pct).toFixed(1)}%</td>
      </tr>
    `;
  });

  let weightsHtml = '';
  if (Object.keys(weights).length > 0) {
    weightsHtml = `
      <div style="margin-bottom: 20px;">
        <div style="color: #9CA3AF; font-size: 12px; margin-bottom: 8px;">${t.weights}</div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          ${weights.idea ? `<span style="background: #8B5CF622; color: #8B5CF6; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${t.idea}: ${weights.idea}%</span>` : ''}
          ${weights.execution ? `<span style="background: #10B98122; color: #10B981; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${t.execution}: ${weights.execution}%</span>` : ''}
          ${weights.investment ? `<span style="background: #F59E0B22; color: #F59E0B; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${t.investment}: ${weights.investment}%</span>` : ''}
          ${weights.expertise ? `<span style="background: #EF444422; color: #EF4444; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${t.expertise}: ${weights.expertise}%</span>` : ''}
        </div>
      </div>
    `;
  }

  return `
    <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
      ${weightsHtml}
      <div style="color: #9CA3AF; font-size: 12px; margin-bottom: 8px;">${t.distribution}</div>
      <table style="width: 100%; border-collapse: collapse;">
        <tbody>
          ${foundersRows}
        </tbody>
      </table>
    </div>
  `;
}

function generateEmailHtml(
  toolName: string,
  data: Record<string, unknown>,
  locale: string
): string {
  const t = getT(locale);
  const toolTitle = getToolTitle(toolName, t);
  
  let contentHtml = '';
  switch (toolName) {
    case 'runway':
      contentHtml = generateRunwayContent(data, t, locale);
      break;
    case 'valuation':
      contentHtml = generateValuationContent(data, t, locale);
      break;
    case 'captable':
      contentHtml = generateCapTableContent(data, t);
      break;
    case 'equity':
      contentHtml = generateEquityContent(data, t);
      break;
    default:
      contentHtml = `<pre style="background: #1a1a2e; padding: 16px; border-radius: 8px; color: #9CA3AF; overflow-x: auto;">${JSON.stringify(data, null, 2)}</pre>`;
  }

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${toolTitle}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0B0E14; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0B0E14; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">
          <!-- Header -->
          <tr>
            <td style="text-align: center; padding-bottom: 32px;">
              <div style="font-size: 32px; font-weight: bold; color: #8B5CF6; letter-spacing: 4px;">GUILDA</div>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="background: linear-gradient(135deg, #111827 0%, #1F2937 100%); border-radius: 16px; padding: 32px; border: 1px solid #374151;">
              <h1 style="margin: 0 0 8px 0; font-size: 24px; color: #FFFFFF;">${t.greeting}</h1>
              <p style="margin: 0 0 24px 0; color: #9CA3AF; font-size: 16px;">${t.intro}</p>
              
              <div style="background: #8B5CF622; border-left: 4px solid #8B5CF6; padding: 12px 16px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
                <div style="color: #8B5CF6; font-weight: 600; font-size: 14px;">${toolTitle}</div>
              </div>
              
              ${contentHtml}
              
              <!-- CTA Section -->
              <div style="background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); border-radius: 12px; padding: 24px; text-align: center; margin-top: 24px;">
                <h3 style="margin: 0 0 8px 0; color: #FFFFFF; font-size: 18px;">${t.ctaTitle}</h3>
                <p style="margin: 0 0 16px 0; color: #E9D5FF; font-size: 14px;">${t.ctaDescription}</p>
                <a href="https://guilda.app.br/auth" style="display: inline-block; background: #FFFFFF; color: #7C3AED; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                  ${t.ctaButton}
                </a>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding-top: 32px; text-align: center;">
              <p style="margin: 0 0 8px 0; color: #6B7280; font-size: 12px;">
                ${t.exploreMore} <a href="https://guilda.app.br/tools" style="color: #8B5CF6; text-decoration: none;">guilda.app.br/tools</a>
              </p>
              <p style="margin: 0; color: #4B5563; font-size: 11px;">${t.footer}</p>
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

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 5; // Max 5 emails per time window
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

function checkRateLimit(key: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const record = rateLimitMap.get(key);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1, resetIn: RATE_LIMIT_WINDOW };
  }
  
  if (record.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0, resetIn: record.resetTime - now };
  }
  
  record.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX - record.count, resetIn: record.resetTime - now };
}

const handler = async (req: Request): Promise<Response> => {
  console.log("[send-calculation-results] Function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, tool_name, calculation_data, locale = 'en' }: CalculationEmailRequest = await req.json();

    console.log("[send-calculation-results] Processing:", { email, tool_name, locale });

    if (!email || !tool_name) {
      throw new Error("Missing required fields: email and tool_name");
    }

    // Rate limiting by email address
    const emailRateLimit = checkRateLimit(`email:${email.toLowerCase()}`);
    if (!emailRateLimit.allowed) {
      console.log(`[send-calculation-results] Rate limit exceeded for email: ${email}`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Rate limit exceeded. Please try again later.",
          resetIn: Math.ceil(emailRateLimit.resetIn / 1000 / 60) // minutes
        }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Rate limiting by IP address
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                     req.headers.get("cf-connecting-ip") || 
                     "unknown";
    if (clientIP !== "unknown") {
      const ipRateLimit = checkRateLimit(`ip:${clientIP}`);
      if (!ipRateLimit.allowed) {
        console.log(`[send-calculation-results] Rate limit exceeded for IP: ${clientIP}`);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Rate limit exceeded. Please try again later.",
            resetIn: Math.ceil(ipRateLimit.resetIn / 1000 / 60)
          }),
          { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    console.log(`[send-calculation-results] Rate limit OK - email remaining: ${emailRateLimit.remaining}`);

    const t = getT(locale);
    const subject = getSubject(tool_name, t);
    const htmlContent = generateEmailHtml(tool_name, calculation_data || {}, locale);

    // Send email via Brevo
    const result = await sendBrevoEmail({
      to: [{ email }],
      subject,
      htmlContent,
      tags: [`calculation-${tool_name}`]
    });

    if (!result.success) {
      throw new Error(`Email error: ${result.error}`);
    }

    console.log("Email sent successfully via Brevo");

    // Update sent_at in email_leads table
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      // First, find the most recent lead that hasn't been sent
      const { data: leadToUpdate, error: selectError } = await supabase
        .from("email_leads")
        .select("id")
        .eq("email", email)
        .eq("tool_name", tool_name)
        .is("sent_at", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (selectError) {
        console.error("Error finding lead to update:", selectError);
      } else if (leadToUpdate) {
        // Now update by specific ID
        const { error: updateError } = await supabase
          .from("email_leads")
          .update({ sent_at: new Date().toISOString() })
          .eq("id", leadToUpdate.id);

        if (updateError) {
          console.error("Error updating sent_at:", updateError);
        } else {
          console.log("Updated sent_at for lead:", leadToUpdate.id);
        }
      } else {
        console.log("No matching lead found to update");
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-calculation-results:", errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
