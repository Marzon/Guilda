import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const getStyleDescription = (style: string): string => {
  const styles: Record<string, string> = {
    modern: 'Design moderno e minimalista com muito espaço em branco, tipografia clean, cores neutras com acentos sutis. Inspirado em apps como Linear, Notion, Vercel.',
    startup: 'Design tech/startup com gradientes vibrantes, bordas arredondadas, sombras suaves, dark mode. Inspirado em Stripe, Figma, Discord.',
    professional: 'Design corporativo e profissional com cores sóbrias (azul, cinza), layout estruturado, fonte serif para títulos. Inspirado em Salesforce, LinkedIn.',
    playful: 'Design divertido e colorido com ilustrações, cores vibrantes, animações sutis, bordas arredondadas. Inspirado em Duolingo, Slack.',
  };
  return styles[style] || styles.startup;
};

const getFeatureDescription = (feature: string): string => {
  const features: Record<string, string> = {
    auth: 'Sistema de autenticação completo (login, cadastro, recuperação de senha, perfil do usuário)',
    payments: 'Integração com pagamentos online (checkout, histórico de transações, planos/assinaturas)',
    chat: 'Chat em tempo real entre usuários com indicador de digitação e leitura',
    dashboard: 'Dashboard administrativo com métricas, gráficos e gestão de dados',
    notifications: 'Sistema de notificações push e in-app',
    search: 'Busca avançada com filtros e ordenação',
    upload: 'Upload de arquivos e imagens com preview',
    responsive: 'Layout totalmente responsivo para mobile, tablet e desktop',
  };
  return features[feature] || feature;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { idea, targetAudience, features, style, customFeatures } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY não configurada');
      throw new Error('LOVABLE_API_KEY não configurada');
    }

    // Build features list
    const featuresDescription = (features || [])
      .map((f: string) => `- ${getFeatureDescription(f)}`)
      .join('\n');

    const customFeaturesSection = customFeatures 
      ? `\n\nFUNCIONALIDADES ADICIONAIS: ${customFeatures}`
      : '';

    const systemPrompt = `Você é um especialista em criar prompts para ferramentas de IA que geram código (como Lovable, Cursor, v0, Bolt, etc).

Sua tarefa é transformar a descrição do usuário em um prompt profissional, detalhado e otimizado para criar um MVP completo.

## Diretrizes Obrigatórias:

1. **Estrutura em Markdown** - Use headers, listas e formatação clara
2. **Requisitos Técnicos** - Especifique: React, TypeScript, Tailwind CSS, shadcn/ui
3. **Arquitetura de Páginas** - Liste todas as páginas/rotas necessárias
4. **Componentes** - Descreva os componentes principais que devem ser criados
5. **UX/UI Detalhado** - Cores, tipografia, espaçamentos, animações
6. **Acessibilidade** - Inclua requisitos WCAG 2.1 AA
7. **Responsividade** - Especifique comportamento mobile-first
8. **Estados** - Descreva loading, empty, error states
9. **Foco em MVP** - Mantenha escopo viável, mas funcional
10. **Português Brasileiro** - Todo o texto deve ser em PT-BR

## Formato de Saída:

O prompt deve ter entre 800-1500 palavras e incluir:
- Título do projeto
- Descrição do problema/solução
- Público-alvo
- Funcionalidades detalhadas
- Especificações visuais
- Requisitos técnicos
- Estrutura de páginas
- Considerações de qualidade

Retorne APENAS o prompt otimizado, sem explicações adicionais, introduções ou conclusões suas.`;

    const userPrompt = `Crie um prompt otimizado para MVP com base nestas informações:

## IDEIA/PROBLEMA
${idea}

## PÚBLICO-ALVO
${targetAudience}

## FUNCIONALIDADES SELECIONADAS
${featuresDescription}${customFeaturesSection}

## ESTILO VISUAL
${getStyleDescription(style)}

---

Gere um prompt completo e profissional para criar este MVP. O prompt deve ser detalhado o suficiente para que qualquer ferramenta de IA consiga criar o app completo.`;

    console.log('Calling Lovable AI Gateway...');
    
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Muitas requisições. Aguarde alguns segundos e tente novamente.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Créditos de IA esgotados. Entre em contato com o suporte.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`Lovable AI error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Lovable AI Gateway response received');
    
    const generatedPrompt = data.choices?.[0]?.message?.content;

    if (!generatedPrompt) {
      console.error('Empty response from Lovable AI:', JSON.stringify(data));
      throw new Error('Resposta vazia da IA');
    }

    return new Response(
      JSON.stringify({ prompt: generatedPrompt }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-mvp-prompt:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro ao gerar prompt' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
