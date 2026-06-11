import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PivotAnalysisRequest {
  userId: string;
  cohortId: string;
  submissionId?: string;
  language?: string;
}

interface AnalysisSummary {
  current_value_prop: string;
  main_bottleneck: string;
  growth_score: number;
}

interface OptimizationRecommendation {
  title: string;
  action: string;
  impact: string;
  effort: "Baixo" | "Médio" | "Alto";
}

interface PivotIdea {
  id: number;
  name: string;
  type: string;
  concept: string;
  transformation: string;
  power_reason: string;
  tech_difficulty: number;
  monetization_model: string;
  mvp_7_days: string;
}

interface PivotAnalysisResult {
  analysis_summary: AnalysisSummary;
  optimization_recommendations: OptimizationRecommendation[];
  pivots: PivotIdea[];
}

const DEFAULT_PIVOTER_PROMPT = `# ROLE

Você é o "Pivot Architect" da Guilda, um estrategista de produto sênior especializado em Growth, Product-Market Fit e Modelagem de Negócios Digitais. Sua visão é afiada, direta e orientada a lucro e escala. Você não tem medo de sugerir mudanças radicais.

## AXIOMAS CENTRAIS (Regras Imutáveis)
1. Dados > Opinião: Só vale pivot baseado em evidências (vendas, rejeições, métricas). "Acho que" não conta.
2. Escala > Ego: O melhor pivot pode matar a ideia original. Founders precisam ouvir isso.
3. Simplicidade > Complexidade: Se o pivot precisa de 10 features, está errado. MVP em 7-14 dias ou não vale.
4. Mercado > Produto: Primeiro o problema real, depois a solução. Nunca o contrário.

## TOM DE VOZ
- NÃO USE: "Interessante ideia", "Talvez considere", "Você poderia tentar"
- USE: "Isso não escala porque...", "O mercado paga por X, não por Y", "Mate essa feature", "Seu ICP real é..."
- Objetivo: Clareza brutal que acelera decisões. Cada palavra deve gerar ação.

## ANTI-PADRÕES DE PIVOT (Detecte e Alerte)
- Pivot de Medo: Mudar porque é difícil, não porque os dados mandaram
- Pivot de Ego: Insistir em tecnologia/feature que o mercado não quer
- Pivot Frankenstein: Juntar 3 ideias fracas achando que viram uma forte
- Pivot Infinito: Nunca testar nada porque "ainda está refinando"
- Pivot de Conforto: Fugir para B2B porque tem medo de vender para consumidor (ou vice-versa)

## ARQUÉTIPOS DE NEGÓCIO (Ajuste sua análise)
- SaaS: Foque em MRR, churn, CAC/LTV. Pergunte: "Qual o gatilho de upgrade?"
- Marketplace: Foque em liquidez e chicken-egg. Pergunte: "Quem você traz primeiro?"
- Serviço Produtizado: Foque em margem e escalabilidade. Pergunte: "O que automatiza?"
- Infoproduto: Foque em audiência e conversão. Pergunte: "Qual a transformação prometida?"
- API/Dev Tools: Foque em DX e integração. Pergunte: "Qual o tempo até o Hello World?"

## CRITÉRIOS DE QUALIDADE DO PIVOT
Um pivot BOM tem:
- ICP claro e específico (não "PMEs" ou "startups")
- Proposta de valor em 1 frase
- Modelo de receita definido
- Métrica norte-star identificada
- Próximo passo em 48h

Um pivot RUIM tem:
- Público genérico
- Múltiplas propostas de valor
- "Depois a gente monetiza"
- Dependência de viralização orgânica
- Precisa de investimento para começar

## RECURSOS DA GUILDA - INDIQUE QUANDO RELEVANTE:

Ao identificar gaps ou oportunidades nos pivots, recomende ferramentas e conteúdos específicos:

**Ferramentas da Guilda (guilda.app.br):**
- Biblioteca: Curadoria de livros essenciais para cada fase da jornada founder (Business Model Generation, Lean Startup, etc.)
- Taverna: Encontre co-founders e sócios com skills complementares para executar o pivot
- Hall de Projetos: Vitrine para seu projeto ganhar visibilidade e atrair early adopters
- Missões: Sistema gamificado para estruturar a execução do pivot

**Artigos do Blog (guilda.app.br/blog):**
- Para founders precisando pivotar: Artigos sobre "Product-Market Fit" e "Sinais de Pivot"
- Para definição de ICP: Conteúdos sobre "Customer Discovery" e "Beachhead Market"
- Para modelo de receita: Guias sobre "Monetização" e "Pricing Strategy"
- Para validação rápida: Artigos sobre "MVP em 7 dias" e "Smoke Tests"

**Quando indicar recursos:**
- Se o pivot precisa de skills técnicas → Direcione para a Taverna
- Se o founder precisa estudar o modelo de negócio → Recomende livro da Biblioteca
- Se precisa validar rápido → Indique artigo sobre MVPs

## FORMATO DE SAÍDA (JSON OBRIGATÓRIO)
Responda SEMPRE em JSON válido com esta estrutura exata:

{
  "analysis_summary": {
    "current_value_prop": "string - proposta de valor atual em 1 frase",
    "main_bottleneck": "string - principal gargalo identificado",
    "growth_score": number (0-100) - potencial de crescimento atual
  },
  "optimization_recommendations": [
    {
      "title": "string - nome da otimização",
      "action": "string - ação específica a tomar",
      "impact": "string - impacto esperado",
      "effort": "Baixo" | "Médio" | "Alto"
    }
  ],
  "pivots": [
    {
      "id": number (1-7) - número sequencial do pivot,
      "name": "string - nome criativo do pivot",
      "type": "string - categoria: SaaS, Marketplace, API, Serviço, Infoproduto, B2B2C, etc",
      "concept": "string - descrição do conceito em 2-3 frases",
      "transformation": "string - o que muda em relação ao modelo atual",
      "power_reason": "string - por que esse pivot tem potencial de escala",
      "tech_difficulty": number (1-5) - dificuldade técnica de implementação,
      "monetization_model": "string - modelo de receita (assinatura, transação, freemium, etc)",
      "mvp_7_days": "string - o que fazer nos primeiros 7 dias para validar"
    }
  ],
  "recommended_resources": {
    "tools": ["string - ferramentas da Guilda recomendadas"],
    "articles": ["string - artigos do blog recomendados"],
    "books": ["string - livros da Biblioteca recomendados"]
  }
}

## REGRAS DE BRAINSTORMING (PIVOTS)
- Gere exatamente 7 pivots com TODOS os campos preenchidos
- NUNCA deixe campos vazios ou com valores genéricos
- NUNCA repita o mesmo modelo de negócio em mais de 2 pivots
- Pelo menos 1 pivot deve ser "radical" (muda completamente o negócio)
- Pelo menos 1 pivot deve ser "incremental" (evolução do atual)
- Foque em soluções que 1-2 devs (stack JS/React) prototipem em 7-14 dias
- Varie entre B2B, B2C, B2B2C e Marketplace

IMPORTANTE: Analise ESPECIALMENTE a entrega do Dia 15 (O Veredito) que contém a análise final do founder sobre vendas, validação e decisão (DO, PIVOT ou DIE). Use essas informações para basear seus pivots na realidade do negócio.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { userId, cohortId, submissionId, language = "pt" }: PivotAnalysisRequest = await req.json();

    if (!userId || !cohortId) {
      throw new Error("userId and cohortId are required");
    }

    console.log(`[Pivoter] Starting analysis for user ${userId} in cohort ${cohortId}`);

    // 1. Fetch agent config for Pivoter (if exists)
    const { data: agentConfig } = await supabase
      .from("acceleration_agent_config")
      .select("*")
      .eq("cohort_id", cohortId)
      .eq("agent_type", "PIVOTER")
      .eq("is_active", true)
      .maybeSingle();

    const systemPrompt = agentConfig?.system_prompt || DEFAULT_PIVOTER_PROMPT;
    const model = agentConfig?.model || "google/gemini-2.5-flash";
    const temperature = agentConfig?.temperature || 0.7;

    console.log(`[Pivoter] Using model: ${model}, temp: ${temperature}, custom config: ${!!agentConfig}`);

    // 2. Fetch ALL submissions for this user in this cohort (not just approved)
    // This ensures we see the Day 15 submission even if it was just submitted
    const { data: submissions, error: submissionsError } = await supabase
      .from("acceleration_submissions")
      .select(`
        id,
        content,
        file_url,
        ai_feedback,
        status,
        submitted_at,
        task_id,
        acceleration_tasks!inner (
          id,
          title,
          day_number,
          description,
          phase_id,
          acceleration_phases!inner (
            name,
            phase_number
          )
        )
      `)
      .eq("user_id", userId)
      .eq("cohort_id", cohortId)
      .in("status", ["approved", "APPROVED", "pending", "PENDING"]) // Include pending to catch just-submitted
      .order("submitted_at", { ascending: true });

    if (submissionsError) {
      console.error("[Pivoter] Error fetching submissions:", submissionsError);
      throw submissionsError;
    }

    console.log(`[Pivoter] Found ${submissions?.length || 0} submissions`);

    // 3. Fetch user profile for context
    const { data: profile } = await supabase
      .from("profiles")
      .select("username, bio, main_skills, offering, looking_for")
      .eq("id", userId)
      .maybeSingle();

    // 4. Fetch team data
    const { data: team } = await supabase
      .from("acceleration_teams")
      .select("startup_name, memorandum")
      .eq("cohort_id", cohortId)
      .or(`builder_id.eq.${userId},seller_id.eq.${userId}`)
      .maybeSingle();

    // 5. Fetch user's application for additional context
    const { data: application } = await supabase
      .from("acceleration_applications")
      .select("pitch, bottleneck")
      .eq("user_id", userId)
      .eq("cohort_id", cohortId)
      .maybeSingle();

    // 6. Build context from all submissions
    let contextBuilder = "## CONTEXTO DO FOUNDER E NEGÓCIO\n\n";
    
    if (team?.startup_name) {
      contextBuilder += `**Startup:** ${team.startup_name}\n`;
    }
    if (team?.memorandum) {
      contextBuilder += `**Memorando da Startup:** ${team.memorandum}\n`;
    }
    if (profile?.bio) {
      contextBuilder += `**Sobre o Founder:** ${profile.bio}\n`;
    }
    if (profile?.offering) {
      contextBuilder += `**O que oferece:** ${profile.offering}\n`;
    }
    if (application?.pitch) {
      contextBuilder += `**Pitch original:** ${application.pitch}\n`;
    }
    if (application?.bottleneck) {
      contextBuilder += `**Gargalo identificado na aplicação:** ${application.bottleneck}\n`;
    }
    
    contextBuilder += "\n---\n\n## HISTÓRICO DE ENTREGAS DA ACELERAÇÃO\n\n";

    // Find Day 15 submission specifically (O Veredito)
    const day15Submission = submissions?.find((sub: any) => {
      const task = sub.acceleration_tasks as any;
      return task?.day_number === 15;
    });

    if (day15Submission) {
      contextBuilder += "### ⚠️ ENTREGA DO DIA 15 - O VEREDITO (ANÁLISE CRÍTICA)\n\n";
      contextBuilder += `**Conteúdo da Análise Final:**\n${day15Submission.content}\n`;
      if (day15Submission.file_url) {
        contextBuilder += `**Anexo:** ${day15Submission.file_url}\n`;
      }
      if (day15Submission.ai_feedback) {
        contextBuilder += `**Feedback do Commander:** ${day15Submission.ai_feedback}\n`;
      }
      contextBuilder += "\n---\n\n";
    }

    // Group remaining submissions by phase
    const submissionsByPhase: Record<string, any[]> = {};
    for (const sub of submissions || []) {
      const task = sub.acceleration_tasks as any;
      // Skip day 15 since we already highlighted it
      if (task?.day_number === 15) continue;
      
      const phase = task?.acceleration_phases as any;
      const phaseName = phase?.name || "Sem Fase";
      if (!submissionsByPhase[phaseName]) {
        submissionsByPhase[phaseName] = [];
      }
      submissionsByPhase[phaseName].push(sub);
    }

    for (const [phaseName, phaseSubs] of Object.entries(submissionsByPhase)) {
      contextBuilder += `### ${phaseName}\n\n`;
      for (const sub of phaseSubs) {
        const task = sub.acceleration_tasks as any;
        contextBuilder += `**Dia ${task?.day_number}: ${task?.title}** (${sub.status})\n`;
        contextBuilder += `Entrega: ${sub.content}\n`;
        if (sub.file_url) {
          contextBuilder += `Anexo: ${sub.file_url}\n`;
        }
        if (sub.ai_feedback) {
          contextBuilder += `Feedback: ${sub.ai_feedback}\n`;
        }
        contextBuilder += "\n";
      }
    }

    console.log(`[Pivoter] Built context with ${submissions?.length || 0} submissions, Day 15 found: ${!!day15Submission}`);

    // 7. Call Lovable AI
    const userPrompt = `${contextBuilder}\n\n---\n\nCom base em TODO o histórico acima, especialmente a análise do Dia 15 (O Veredito), faça uma análise completa do negócio e gere:
1. Um resumo da situação atual (analysis_summary)
2. Pelo menos 3 recomendações de otimização rápida (optimization_recommendations)
3. EXATAMENTE 7 pivots estratégicos completos, cada um com TODOS os campos preenchidos (pivots)

IMPORTANTE: Preencha TODOS os campos de cada pivot. Não deixe nenhum campo vazio ou genérico.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${lovableApiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature,
        response_format: { type: "json_object" },
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("[Pivoter] AI API error:", errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: "Rate limit exceeded. Please try again in a few minutes." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ success: false, error: "AI credits exhausted. Please add more credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const rawContent = aiData.choices?.[0]?.message?.content;

    if (!rawContent) {
      throw new Error("No content in AI response");
    }

    console.log("[Pivoter] Raw AI response received, length:", rawContent.length);

    // 8. Parse and validate JSON
    let analysisResult: PivotAnalysisResult;
    try {
      analysisResult = JSON.parse(rawContent);
      
      // Validate structure
      if (!analysisResult.analysis_summary || !analysisResult.optimization_recommendations || !analysisResult.pivots) {
        console.error("[Pivoter] Invalid structure:", Object.keys(analysisResult));
        throw new Error("Invalid analysis structure - missing required fields");
      }
      
      // Ensure we have at least 3 recommendations
      if (analysisResult.optimization_recommendations.length < 3) {
        console.warn("[Pivoter] Less than 3 recommendations returned:", analysisResult.optimization_recommendations.length);
      }
      
      // Validate pivots
      if (analysisResult.pivots.length !== 7) {
        console.warn(`[Pivoter] Expected 7 pivots, got ${analysisResult.pivots.length}`);
      }

      // Validate each pivot has required fields
      for (let i = 0; i < analysisResult.pivots.length; i++) {
        const pivot = analysisResult.pivots[i];
        if (!pivot.name || !pivot.type || !pivot.concept) {
          console.warn(`[Pivoter] Pivot ${i + 1} missing required fields:`, {
            name: !!pivot.name,
            type: !!pivot.type,
            concept: !!pivot.concept
          });
        }
        // Ensure id is set
        if (!pivot.id) {
          pivot.id = i + 1;
        }
      }
      
    } catch (parseError) {
      console.error("[Pivoter] Failed to parse AI response:", parseError);
      console.error("[Pivoter] Raw content preview:", rawContent.substring(0, 500));
      throw new Error("Failed to parse AI response as JSON");
    }

    // 9. Save to database (upsert)
    const { error: upsertError } = await supabase
      .from("acceleration_pivot_analysis")
      .upsert({
        user_id: userId,
        cohort_id: cohortId,
        submission_id: submissionId || null,
        analysis_data: analysisResult,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "user_id,cohort_id",
      });

    if (upsertError) {
      console.error("[Pivoter] Error saving analysis:", upsertError);
      // Don't throw - still return the result even if save fails
    }

    console.log("[Pivoter] Analysis complete and saved successfully");

    return new Response(
      JSON.stringify({
        success: true,
        analysis: analysisResult,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[Pivoter] Error:", errorMessage);
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
