import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EvaluationRequest {
  submissionId: string;
  locale?: string; // 'pt', 'en', 'es'
}

const languageInstructions: Record<string, string> = {
  pt: 'IMPORTANTE: Responda SEMPRE em português brasileiro. Todas as suas respostas devem ser em português.',
  en: 'IMPORTANT: ALWAYS respond in English. All your responses must be in English.',
  es: 'IMPORTANTE: Responde SIEMPRE en español. Todas tus respuestas deben ser en español.'
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: EvaluationRequest = await req.json();
    const { submissionId, locale = 'pt' } = body;

    if (!submissionId) {
      throw new Error("Missing submissionId");
    }

    console.log(`Fetching submission ${submissionId}`);

    // Get submission details first
    const { data: submission, error: submissionError } = await supabase
      .from("acceleration_submissions")
      .select("*")
      .eq("id", submissionId)
      .single();

    if (submissionError || !submission) {
      console.error("Submission not found:", submissionError);
      throw new Error("Submission not found");
    }

    const { content, file_url, task_id, cohort_id, user_id } = submission;

    // Parse attachments (supports JSON array or single URL for backward compatibility)
    const parseFileUrls = (fileUrl: string | null): string[] => {
      if (!fileUrl) return [];
      try {
        const parsed = JSON.parse(fileUrl);
        return Array.isArray(parsed) ? parsed : [fileUrl];
      } catch {
        return [fileUrl];
      }
    };

    const attachments = parseFileUrls(file_url);

    console.log(`Evaluating submission ${submissionId} for task ${task_id}`);

    // Get task details
    const { data: task, error: taskError } = await supabase
      .from("acceleration_tasks")
      .select(`
        *,
        phase:acceleration_phases(*)
      `)
      .eq("id", task_id)
      .single();

    if (taskError || !task) {
      console.error("Task not found:", taskError);
      throw new Error("Task not found");
    }

    // Get agent config for this cohort
    const { data: agentConfig, error: configError } = await supabase
      .from("acceleration_agent_config")
      .select("*")
      .eq("cohort_id", cohort_id)
      .eq("is_active", true)
      .maybeSingle();

    if (configError) {
      console.error("Error fetching agent config:", configError);
    }

    // Get knowledge context if configured
    let knowledgeContext = {};
    if (agentConfig?.knowledge_tables?.length > 0) {
      const { data: contextData } = await supabase.rpc("get_agent_knowledge_context", {
        p_cohort_id: cohort_id,
        p_user_id: user_id,
      });
      if (contextData) {
        knowledgeContext = contextData;
      }
    }

    // Get founder archetype analysis
    const { data: archetypeData } = await supabase
      .from("founder_archetype_analysis")
      .select("*")
      .eq("user_id", user_id)
      .eq("cohort_id", cohort_id)
      .maybeSingle();

    // Get active trap alerts for this founder
    const { data: activeTraps } = await supabase
      .from("founder_trap_alerts")
      .select("*")
      .eq("user_id", user_id)
      .eq("cohort_id", cohort_id)
      .eq("resolved", false);

    // Get submission history for pattern analysis
    const { data: submissionHistory } = await supabase
      .from("acceleration_submissions")
      .select("status, submitted_at, content")
      .eq("user_id", user_id)
      .eq("cohort_id", cohort_id)
      .order("submitted_at", { ascending: false })
      .limit(10);

    // Detect traps in current submission
    const trapPatterns = [
      { type: "SYNTHETIC_VALIDATION", pattern: /validei (com IA|com chatgpt|usando IA|gerando)/i },
      { type: "LP_DESERT", pattern: /(criei|fiz|lancei).*(landing page|LP|site|página)/i },
      { type: "MOM_VALIDATION", pattern: /(amigo|colega|mãe|pai|família|conhecido).*(disse|achou|validou|gostou)/i },
      { type: "PREMATURE_SCALE", pattern: /(afiliados|parceiros|automatizar|delegar|contratar|escalar)/i },
      { type: "VANITY_MARKETING", pattern: /(postei|publiquei).*(instagram|linkedin|twitter|redes)/i },
      { type: "FAKE_WORK", pattern: /^(feito|ok|pronto|entregue|concluído)\.?$/i }
    ];

    const detectedTraps = [];
    for (const { type, pattern } of trapPatterns) {
      if (pattern.test(content)) {
        // Only flag PREMATURE_SCALE if before day 10
        if (type === "PREMATURE_SCALE" && task.day_number >= 10) continue;
        // Only flag LP_DESERT if no traffic mentioned
        if (type === "LP_DESERT" && /(tráfego|ads|visitas|leads|cliques)/i.test(content)) continue;
        
        detectedTraps.push(type);
        
        // Save trap alert
        await supabase.from("founder_trap_alerts").insert({
          user_id,
          cohort_id,
          trap_type: type,
          severity: "warning",
          trigger_data: { detected_in_submission: submissionId, day: task.day_number }
        });
      }
    }

    if (detectedTraps.length > 0) {
      console.log(`Detected traps in submission: ${detectedTraps.join(", ")}`);
    }

    // Build system prompt
    const defaultSystemPrompt = `Você é o Sócio Sênior Impaciente da Guilda. Seu trabalho é matar ideias ruins rapidamente para que founders não desperdicem anos de suas vidas.

## AXIOMAS CENTRAIS (Regras Imutáveis)

1. Ação > Intenção: O que o founder diz que vai fazer é irrelevante. Só importa o que foi feito e PROVADO.

2. Venda > Construção: Código, LPs, prompts são zona de conforto. Falar com estranhos e cobrar dinheiro é trabalho real.

3. Prova Material: "Feito" sem print, link ou áudio = NÃO FEITO.

4. Silêncio é Dado Negativo: Sumiço > 24h = falha ou travamento emocional.

## TOM DE VOZ

- Personalidade: Cirúrgico, Frio e Pragmático. Você não é um coach motivacional, você é um auditor de viabilidade. Sua empatia é zero para desculpas e total para resultados.

- Estilo de Resposta (Diagnóstico + Ordem): Padrão Ouro: [Fato que invalida a ideia] + [Comando imediato]. Clareza > Emoção. Não use adjetivos vazios nem sarcasmo gratuito. Use métricas e lógica de mercado.

- Vocabulário: Misto e Técnico. Use a terminologia correta (MVP, CAC, LTV, Co-founder, Burn rate) para demonstrar autoridade, mas mantenha a estrutura da frase em português direto e curto.

- Gatilhos de Extermínio (Resposta Imediata): Se o founder disser "Preciso de investimento para começar": Responda que investimento compra escala, não risco. Ordem: Venda serviço ou produto manual para financiar o MVP (Bootstrap). Se o founder disser "Meu produto é para todo mundo": Responda que quem vende para todos não vende para ninguém. Ordem: Defina um nicho de ataque inicial (Beachhead Market).

## BIBLIOTECA DE ARMADILHAS - DETECTE E CONFRONTE:

- Fuga para o Nicho: Medo de escolher público específico

- Deserto da LP: LP no ar sem tráfego ativo = panfleto no deserto

- Vício no Pivô: Mudar ideia a cada dificuldade (Síndrome do Objeto Brilhante)

- Validação de Mãe: Feedback de amigos ≠ validação. Só vale quem passa o cartão.

- Validação Sintética: Achar que validou porque a IA disse que a ideia é boa.

## RESPOSTAS TÁTICAS:

- "Já validei, vou criar afiliados" → STOP. Você não tem processo, tem sorte. Venda você mesmo +10x.

- "Fiz a tarefa" (sem anexo) → AUDITORIA. Mande o print ou reprovado.

- "Estou ajustando produto/site" → ERRO. Saia do editor. Quantos NÃOs você levou hoje?

- "Mudei o foco para X" → FOCO. Mudou porque testou e falhou, ou porque teve medo? Mostre dados.

- "Postei no Instagram" → OUTBOUND. Like não paga conta. Aborde 10 pessoas no direct.

## ARQUÉTIPOS DE FOUNDERS (Ajuste seu tom):

- BUILDER_ADDICT: Proíba código. Force interação humana. "Saia do editor. Quantos NÃOs hoje?"

- PREMATURE_CEO: Force "do things that don't scale". "Você vendeu você mesmo? Não delegue o que não domina."

- FAKER: Auditoria agressiva. "Cadê o print? Cadê o áudio? Cadê a prova?"

- CYCLOTHYMIC: Cobre consistência, não intensidade. "Herói ontem, sumido hoje. Padrão perigoso."

## SOBRE ANEXOS:
- Quando o founder enviar imagens/prints, considere como prova material válida
- Links externos (Google Docs, Notion, Figma, etc) são documentação complementar válida
- Você não pode "ver" imagens, mas deve assumir boa-fé se o anexo parece relevante para a tarefa
- Só cobre "cadê o print?" se realmente NÃO houver anexos

## ⚠️ REGRA ESPECIAL: DIA 15 - O VEREDITO
No Dia 15 ("Análise Final" / "O Veredito"), o objetivo NÃO é validar se o founder vendeu.
É validar se ele fez uma ANÁLISE HONESTA e tomou uma DECISÃO CONSCIENTE.

**Critérios de aprovação para o Dia 15:**
1. O founder respondeu às 5 seções da análise (Problema, Solução, Tração, Execução, Veredito)?
2. O founder foi HONESTO sobre os resultados (inclusive zero vendas)?
3. O founder tomou uma decisão clara: DO, PIVOT ou DIE?
4. O founder definiu próximos passos concretos?

**IMPORTANTE:** Zero vendas = ideia não validada, mas NÃO invalida a entrega!
- Se o founder admite que não vendeu e escolhe PIVOT ou DIE → APROVE
- Se o founder admite que não vendeu e escolhe DO sem justificativa sólida → QUESTIONE
- A honestidade brutal é mais valiosa que fingir sucesso

O Dia 15 é sobre maturidade empreendedora: saber quando parar ou mudar é tão importante quanto saber quando continuar.

## RECURSOS DA GUILDA - INDIQUE QUANDO RELEVANTE:

Ao identificar gaps ou oportunidades, recomende ferramentas e conteúdos específicos:

**Ferramentas da Guilda (guilda.app.br):**
- Biblioteca: Curadoria de livros essenciais para cada fase da jornada founder
- Taverna: Encontre co-founders e sócios com skills complementares
- Hall de Projetos: Vitrine para seu projeto ganhar visibilidade
- Missões: Sistema gamificado para ganhar XP e badges

**Artigos do Blog (guilda.app.br/blog):**
- Para founders sem validação: Artigos sobre "Primeira Venda" e "Validação de Mercado"
- Para builders viciados: Conteúdos sobre "Customer Development" e "Sair do Código"
- Para quem precisa de sócio: Guias sobre "Como Encontrar Co-founder"
- Para problemas de foco: Artigos sobre "Priorização" e "Síndrome do Objeto Brilhante"

**Quando indicar recursos:**
- Se o founder está travado em um padrão → Indique artigo específico
- Se precisa de skills complementares → Direcione para a Taverna
- Se quer estudar mais → Recomende livro da Biblioteca

## FORMATO DE SAÍDA:

Comece com [APPROVED] ou [REJECTED].

Máximo 3 frases diretas. Sem floreios. Em português.

Se indicar recurso da Guilda, adicione ao final: "📚 Recurso recomendado: [nome/link]"`;

    const systemPrompt = agentConfig?.system_prompt || defaultSystemPrompt;
    const model = agentConfig?.model || "google/gemini-2.5-flash";
    const temperature = agentConfig?.temperature || 0.3;

    // Build user prompt with context
    let userPrompt = `## Tarefa: ${task.title}

Dia: ${task.day_number}
Fase: ${task.phase?.name || "Desconhecida"}

### Descrição da Tarefa:
${task.description}

${task.evaluation_criteria ? `### Critérios Específicos de Avaliação:
${task.evaluation_criteria}

` : ""}### Submissão do Founder:
${content}`;

    // Add attachments to prompt if present
    if (attachments.length > 0) {
      userPrompt += `

### 📎 ANEXOS ENVIADOS (${attachments.length}):
${attachments.map((url: string, i: number) => {
  const fileName = url.split('/').pop()?.split('?')[0] || url;
  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url.toLowerCase());
  const isDoc = /\.(pdf|doc|docx)$/i.test(url.toLowerCase());
  const isExternal = !url.includes('supabase.co');
  
  let type = '📄 Arquivo';
  if (isImage) type = '🖼️ Imagem/Print';
  if (isDoc) type = '📑 Documento';
  if (isExternal) type = '🔗 Link Externo';
  
  return `${i + 1}. ${type}: ${url}`;
}).join('\n')}

⚠️ IMPORTANTE: Considere estes anexos como prova material válida.
- Imagens/prints são evidências visuais - assuma que contêm o que o founder descreve
- Links externos (Google Docs, Figma, Notion) são documentação complementar válida
- NÃO cobre "cadê o print?" se anexos foram enviados`;
    }

    // Add archetype context if available
    if (archetypeData) {
      userPrompt += `

### PERFIL DO FOUNDER (Arquétipo Detectado):
Tipo: ${archetypeData.archetype}
Confiança: ${Math.round(archetypeData.confidence_score * 100)}%
Indicadores: ${JSON.stringify(archetypeData.indicators)}`;
    }

    // Add active traps context
    if (activeTraps && activeTraps.length > 0) {
      userPrompt += `

### ⚠️ ALERTAS DE ARMADILHAS ATIVAS:
${activeTraps.map(t => `- ${t.trap_type} (${t.severity}): ${JSON.stringify(t.trigger_data)}`).join('\n')}`;
    }

    // Add newly detected traps
    if (detectedTraps.length > 0) {
      userPrompt += `

### 🚨 ARMADILHAS DETECTADAS NESTA SUBMISSÃO:
${detectedTraps.join(', ')}
Confronte diretamente sobre esses padrões.`;
    }

    // Add submission history patterns
    if (submissionHistory && submissionHistory.length > 1) {
      const rejectedCount = submissionHistory.filter(s => s.status === 'REJECTED').length;
      const approvedCount = submissionHistory.filter(s => s.status === 'APPROVED').length;
      
      userPrompt += `

### Histórico Recente:
- Submissões aprovadas: ${approvedCount}
- Submissões rejeitadas: ${rejectedCount}`;

      // Detect cyclothymic pattern (check for gaps in submission dates)
      if (submissionHistory.length >= 3) {
        const dates = submissionHistory.map(s => new Date(s.submitted_at));
        let hasGaps = false;
        for (let i = 1; i < dates.length; i++) {
          const daysDiff = (dates[i-1].getTime() - dates[i].getTime()) / (1000 * 60 * 60 * 24);
          if (daysDiff > 2) {
            hasGaps = true;
            break;
          }
        }
        if (hasGaps) {
          userPrompt += `
⚠️ Padrão de inconsistência detectado: gaps de >2 dias entre submissões`;
        }
      }
    }

    // Add knowledge context if available
    if (Object.keys(knowledgeContext).length > 0) {
      userPrompt += `

### Contexto Adicional do Founder:
${JSON.stringify(knowledgeContext, null, 2)}`;
    }

    console.log(`Calling AI with model: ${model}, temperature: ${temperature}`);

    // Call Lovable AI Gateway
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: `${systemPrompt}\n\n${languageInstructions[locale] || languageInstructions['pt']}` },
          { role: "user", content: userPrompt },
        ],
        temperature,
        max_tokens: 500,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please contact support." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error("AI gateway error: " + errorText);
    }

    const aiData = await aiResponse.json();
    const aiFeedback = aiData.choices?.[0]?.message?.content || "";
    
    console.log("AI feedback received:", aiFeedback.substring(0, 100) + "...");

    // Parse the AI response to determine status (supports multiple languages)
    const upperFeedback = aiFeedback.toUpperCase();
    const isApproved = upperFeedback.includes("[APPROVED]") || 
                       upperFeedback.includes("[APROVADO]") || 
                       upperFeedback.includes("[APROBADO]");
    const newStatus = isApproved ? "APPROVED" : "REJECTED";

    // Update the submission with AI feedback
    const { error: updateError } = await supabase
      .from("acceleration_submissions")
      .update({
        status: newStatus,
        ai_feedback: aiFeedback,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", submissionId);

    if (updateError) {
      console.error("Error updating submission:", updateError);
      throw new Error("Failed to update submission");
    }

    // If approved, send notification (progress is updated automatically by database trigger)
    if (isApproved) {
      const nextDay = task.day_number + 1;
      const isCompleted = nextDay > 15;

      // Send notification
      try {
        await fetch(`${supabaseUrl}/functions/v1/send-acceleration-notification`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({
            type: isCompleted ? "program_completed" : "task_approved",
            userId: user_id,
            cohortId: cohort_id,
            taskDay: task.day_number,
            feedback: aiFeedback,
          }),
        });
      } catch (notifError) {
        console.error("Failed to send approval notification:", notifError);
      }
    } else {
      // Task rejected - send notification
      try {
        await fetch(`${supabaseUrl}/functions/v1/send-acceleration-notification`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({
            type: "task_rejected",
            userId: user_id,
            cohortId: cohort_id,
            taskDay: task.day_number,
            feedback: aiFeedback,
          }),
        });
      } catch (notifError) {
        console.error("Failed to send rejection notification:", notifError);
      }
    }

    console.log(`Submission ${submissionId} evaluated: ${newStatus}`);

    return new Response(
      JSON.stringify({
        success: true,
        status: newStatus,
        feedback: aiFeedback,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in evaluate-submission:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
