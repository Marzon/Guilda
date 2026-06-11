export interface TemplatePhase {
  phase_number: number;
  name: string;
  description: string;
  start_day: number;
  end_day: number;
  icon: string;
  color: string;
  tasks: TemplateTask[];
}

export interface TemplateTask {
  day_number: number;
  title: string;
  description: string;
  deliverable_format: 'text' | 'url' | 'file';
  evaluation_criteria: string;
  recommended_tools: string[];
  recommended_articles: string[];
}

export interface TemplateVideo {
  day_number: number;
  title: string;
  video_url: string;
  description?: string;
}

export const DO_OR_DIE_TEMPLATE: { phases: TemplatePhase[]; videos: TemplateVideo[] } = {
  phases: [
    {
      phase_number: 1,
      name: "O Corte",
      description: "Defina seu problema e solução com clareza brutal. Sem enrolação, sem buzzwords.",
      start_day: 1,
      end_day: 3,
      icon: "scissors",
      color: "#FF0000",
      tasks: [
        {
          day_number: 1,
          title: "O Problema Real",
          description: `Descreva o problema que você resolve em 1 parágrafo.

**Regras:**
- Seja específico, não genérico
- Sem buzzwords (disruptivo, inovador, revolucionário)
- Descreva a dor real de uma pessoa real
- Se você não consegue explicar para sua avó, refaça

**Exemplo ruim:** "Melhoramos a experiência do usuário em plataformas digitais"
**Exemplo bom:** "Donos de restaurantes perdem 3h por dia gerenciando pedidos de delivery em 5 apps diferentes"`,
          deliverable_format: 'text',
          evaluation_criteria: "Problema específico e concreto. Sem jargões. Dor clara e identificável. Persona definida.",
          recommended_tools: ['empathy-map', 'customer-dev'],
          recommended_articles: ['customer-development-entrevistas-validacao'],
        },
        {
          day_number: 2,
          title: "A Solução Focada",
          description: `Como você resolve este problema? Em 1 parágrafo.

**Regras:**
- Foco no core, não nas features secundárias
- O que você faz que ninguém mais faz?
- Se precisar de mais de 30 segundos para explicar, simplifique

**Formato:** "Nós [verbo] para [persona] através de [mecanismo único]"`,
          deliverable_format: 'text',
          evaluation_criteria: "Solução clara e direta. Diferencial identificável. Mecanismo compreensível.",
          recommended_tools: ['business-model', 'lean-canvas'],
          recommended_articles: ['lean-canvas-modelo-negocio-startup'],
        },
        {
          day_number: 3,
          title: "O Cliente Ideal",
          description: `Quem é seu ICP (Ideal Customer Profile)? Seja específico.

**Descreva:**
- Cargo/função exata
- Tamanho da empresa (se B2B)
- Faixa etária e renda (se B2C)
- Onde essa pessoa passa tempo online
- O que ela já tentou para resolver o problema
- Por que as soluções atuais não funcionam para ela`,
          deliverable_format: 'text',
          evaluation_criteria: "ICP bem definido. Características específicas. Comportamentos identificados. Dor validada.",
          recommended_tools: ['empathy-map', 'tam-sam-som'],
          recommended_articles: ['pesquisa-de-mercado-startup-tam-sam-som'],
        },
      ],
    },
    {
      phase_number: 2,
      name: "A Construção Suja",
      description: "Saia do prédio e fale com humanos reais. Chega de teoria, hora da validação.",
      start_day: 4,
      end_day: 7,
      icon: "hammer",
      color: "#FFAA00",
      tasks: [
        {
          day_number: 4,
          title: "10 Cold Calls/Messages",
          description: `Ligue ou mande mensagem para 10 potenciais clientes.

**Regras:**
- NÃO pode ser amigo ou família
- Tem que ser do seu ICP definido no Dia 3
- Grave as ligações ou salve prints das conversas
- Não tente vender nada, apenas entenda o problema

**Perguntas obrigatórias:**
1. Como você resolve [problema] hoje?
2. Quanto tempo/dinheiro você perde com isso?
3. O que você já tentou?

**Entrega:** Resumo das 10 conversas com insights principais`,
          deliverable_format: 'text',
          evaluation_criteria: "10 conversas reais documentadas. Insights específicos. Padrões identificados nas respostas.",
          recommended_tools: ['cold-outreach', 'customer-dev'],
          recommended_articles: ['customer-development-entrevistas-validacao'],
        },
        {
          day_number: 5,
          title: "Landing Page Ugly",
          description: `Crie uma landing page simples para testar interesse.

**Deve conter:**
- Headline com a promessa principal
- 3 bullets com benefícios
- CTA para capturar email
- Zero design elaborado (use Carrd, Notion ou Google Sites)

**O objetivo:** Conseguir emails de pessoas interessadas, não um site bonito.

**Entrega:** URL da landing page`,
          deliverable_format: 'url',
          evaluation_criteria: "Landing page funcional. Proposta clara. CTA presente. Foco em conversão, não em estética.",
          recommended_tools: ['guilda-ia-mvp', 'value-proposition'],
          recommended_articles: ['guilda-ia-mvp-builder-crie-seu-mvp-com-inteligencia-artificial'],
        },
        {
          day_number: 6,
          title: "Tráfego Orgânico",
          description: `Poste em 5 lugares diferentes direcionando para sua landing.

**Opções:**
- LinkedIn (post pessoal contando o problema)
- Reddit (comunidade relevante)
- Grupos de WhatsApp/Telegram
- Twitter/X
- Fórum específico do nicho
- Comentários em posts relacionados

**Entrega:** Links para os 5 posts + quantos visitantes cada gerou`,
          deliverable_format: 'text',
          evaluation_criteria: "5 posts documentados. Métricas de tráfego. Engajamento orgânico. Testes A/B de mensagem.",
          recommended_tools: ['sales-funnel'],
          recommended_articles: ['trafego-organico-canais-gratuitos-clientes'],
        },
        {
          day_number: 7,
          title: "Reunião de Mentoria",
          description: `Apresente seu progresso para um mentor e receba feedback direto.

**Preparação:**
- Revise todas as entregas dos dias 4-6
- Prepare perguntas específicas sobre seus bloqueios
- Tenha métricas prontas (cold calls, landing page, tráfego)

**Durante a reunião:**
- Apresente em 5 minutos o que você fez
- Compartilhe os principais aprendizados
- Peça feedback honesto sobre seu progresso
- Discuta próximos passos

**Entrega:** 
- Resumo da conversa com o mentor
- 3 principais feedbacks recebidos
- Ações que você vai tomar baseado no feedback`,
          deliverable_format: 'text',
          evaluation_criteria: "Reunião realizada. Feedback documentado. Aprendizados claros. Ações definidas.",
          recommended_tools: ['business-health-quiz', 'swot'],
          recommended_articles: ['customer-development-entrevistas-validacao'],
        },
      ],
    },
    {
      phase_number: 3,
      name: "A Ofensiva",
      description: "Hora de vender e validar com dinheiro real. Teoria virou passado.",
      start_day: 8,
      end_day: 14,
      icon: "rocket",
      color: "#00AAFF",
      tasks: [
        {
          day_number: 8,
          title: "MVP Manual",
          description: `Entregue valor para 1 cliente SEM código/produto pronto.

**O conceito:** Faça manualmente o que seu produto faria automaticamente.

**Exemplos:**
- App de delivery → Você leva o pedido de bicicleta
- SaaS de relatórios → Você faz o relatório no Excel
- Marketplace → Você conecta comprador e vendedor via WhatsApp

**Entrega:** Descrição do que você fez + feedback do cliente`,
          deliverable_format: 'text',
          evaluation_criteria: "Valor real entregue. Cliente real atendido. Feedback documentado. Aprendizados claros.",
          recommended_tools: ['mvp-vibecoding', 'guilda-ia-mvp'],
          recommended_articles: ['mvp-primeiros-clientes-traction'],
        },
        {
          day_number: 9,
          title: "Primeira Venda",
          description: `Alguém pagou algo pelo que você oferece.

**Aceito:**
- Venda real com dinheiro
- Pré-venda com compromisso
- Desconto em troca de feedback
- Pagamento simbólico (R$1) para validar intenção

**NÃO aceito:**
- "Pagaria se existisse"
- Amigo comprando para ajudar

**Entrega:** Comprovante da transação + contexto da venda`,
          deliverable_format: 'file',
          evaluation_criteria: "Transação real documentada. Cliente pagante identificado. Processo de venda descrito.",
          recommended_tools: ['proposal-generator', 'markup-calculator'],
          recommended_articles: ['como-precificar-produtos-guia-markup'],
        },
        {
          day_number: 10,
          title: "Feedback Loop",
          description: `Colete feedback estruturado do(s) cliente(s).

**Perguntas obrigatórias:**
1. O que você mais gostou?
2. O que faltou?
3. Você recomendaria? Por quê?
4. Quanto você pagaria por mês/ano?
5. O que faria você parar de usar?

**Entrega:** Respostas compiladas + insights`,
          deliverable_format: 'text',
          evaluation_criteria: "Feedback real de clientes pagantes. Padrões identificados. Melhorias priorizadas.",
          recommended_tools: ['customer-dev'],
          recommended_articles: ['customer-development-entrevistas-validacao'],
        },
        {
          day_number: 11,
          title: "Iteração Rápida",
          description: `Implemente a melhoria mais pedida.

**Baseado no feedback do Dia 10:**
- Qual foi a reclamação/sugestão mais comum?
- O que é possível implementar em 24h?
- Como você vai validar que funcionou?

**Entrega:** O que você mudou + reação do cliente`,
          deliverable_format: 'text',
          evaluation_criteria: "Melhoria implementada. Baseada em feedback real. Resultado documentado.",
          recommended_tools: ['mvp-vibecoding'],
          recommended_articles: ['build-measure-learn-iteracao-rapida-startup'],
        },
        {
          day_number: 12,
          title: "Segunda e Terceira Venda",
          description: `Mais clientes pagantes. Comprove que não foi sorte.

**Objetivo:** Pelo menos 2 novas transações.

**Bônus:** Se conseguir que cliente anterior compre novamente (retenção).

**Entrega:** Comprovantes + como você conseguiu essas vendas`,
          deliverable_format: 'text',
          evaluation_criteria: "Múltiplas vendas documentadas. Processo de venda replicável. Crescimento demonstrado.",
          recommended_tools: ['proposal-generator', 'sales-funnel'],
          recommended_articles: ['replicar-processo-vendas-escalar'],
        },
        {
          day_number: 13,
          title: "Unit Economics",
          description: `Faça as contas básicas do negócio.

**Calcule:**
- CAC (Custo de Aquisição de Cliente)
- LTV (Lifetime Value) estimado
- Margem bruta
- Ticket médio
- Tempo até break-even

**Seja honesto:** Números ruins agora são aceitáveis se você souber como melhorar.

**Entrega:** Planilha ou cálculos com explicações`,
          deliverable_format: 'text',
          evaluation_criteria: "Métricas calculadas corretamente. Premissas explicadas. Viabilidade analisada.",
          recommended_tools: ['unit-economics', 'breakeven-calculator', 'burn-rate-optimizer', 'runway-calculator'],
          recommended_articles: ['unit-economics-metricas-startup'],
        },
        {
          day_number: 14,
          title: "Pitch de 60 Segundos",
          description: `Grave um vídeo de 60 segundos vendendo seu negócio.

**Estrutura:**
1. Problema (10s)
2. Solução (10s)
3. Tração (15s)
4. Modelo de negócio (10s)
5. Ask - o que você precisa (15s)

**Entrega:** Link do vídeo (YouTube não listado, Loom, etc)`,
          deliverable_format: 'url',
          evaluation_criteria: "Pitch claro e convincente. Dentro do tempo. Tração demonstrada. Ask específico.",
          recommended_tools: ['valuation-calculator'],
          recommended_articles: ['term-sheet-guia-definitivo-captacao-investimento'],
        },
      ],
    },
    {
      phase_number: 4,
      name: "O Veredito",
      description: "Análise final e decisão: continuar ou pivotar. Sem meio-termo.",
      start_day: 15,
      end_day: 15,
      icon: "scale",
      color: "#00FF00",
      tasks: [
        {
          day_number: 15,
          title: "Análise Final",
          description: `Momento da verdade. Responda com honestidade brutal:

**1. Validação do Problema**
- O problema existe de verdade? (evidências)
- As pessoas estão dispostas a pagar para resolver?

**2. Validação da Solução**
- Sua solução resolve o problema melhor que as alternativas?
- Clientes voltariam/indicariam?

**3. Tração**
- Quantos clientes pagantes você conseguiu?
- Qual foi a receita total?
- Qual foi a reação espontânea dos clientes?

**4. Capacidade de Execução**
- Você consegue escalar isso?
- Você está animado para fazer isso pelos próximos 5-10 anos?

**5. O Veredito**
- DO: Continue e acelere
- PIVOT: Mude algo fundamental e tente novamente
- DIE: Pare e comece outra coisa

**Entrega:** Análise completa + sua decisão + próximos passos concretos`,
          deliverable_format: 'text',
          evaluation_criteria: "Análise honesta e profunda. Métricas documentadas. Decisão fundamentada. Próximos passos claros.",
          recommended_tools: ['business-health-quiz', 'swot'],
          recommended_articles: ['due-diligence-investidores-checklist-completo'],
        },
      ],
    },
  ],
  videos: [
    { day_number: 0, title: "Bem-vindo ao BuildUP", video_url: "https://youtube.com/shorts/JXGac8gk6JU" },
    { day_number: 1, title: "Dia 1: O Problema Real", video_url: "https://youtube.com/shorts/KPDCgOl2NP0" },
    { day_number: 2, title: "Dia 2: A Solução Focada", video_url: "https://youtube.com/shorts/MMCuYStcIVQ" },
    { day_number: 3, title: "Dia 3: O Cliente Ideal", video_url: "https://youtube.com/shorts/0k5dwD9gikI" },
    { day_number: 4, title: "Dia 4: 10 conversas reais", video_url: "https://youtube.com/shorts/LM6ofGZrSPA" },
    { day_number: 5, title: "Dia 5: Landing Page Ugly", video_url: "https://youtube.com/shorts/3Or7_RNelEw" },
    { day_number: 6, title: "DIA 6 - Tráfego Orgânico", video_url: "https://youtube.com/shorts/63tmiurCKPY" },
    { day_number: 7, title: "Dia 7: Reunião de Mentoria", video_url: "https://youtube.com/shorts/uuqUO4Iy6AQ" },
    { day_number: 8, title: "DIA 8 - MVP Manual", video_url: "https://youtube.com/shorts/ud55de_tdCQ" },
    { day_number: 9, title: "DIA 9 - Primeira Venda", video_url: "https://youtube.com/shorts/ZIEci4gSdDk" },
    { day_number: 10, title: "DIA 10 - Feedback Loop", video_url: "https://youtube.com/shorts/eILuQJnbKHU" },
    { day_number: 11, title: "DIA 11 - Iteração Rápida", video_url: "https://youtube.com/shorts/Td-1_XMubLI" },
    { day_number: 12, title: "DIA 12 - Segunda e Terceira Venda", video_url: "https://youtube.com/shorts/kWOlL440quI" },
    { day_number: 13, title: "DIA 13 - Unit Economics", video_url: "https://youtube.com/shorts/8ZWuodl-3nw" },
    { day_number: 14, title: "DIA 14 - Pitch de 60 Segundos", video_url: "https://youtube.com/shorts/IX54_ayTjss" },
    { day_number: 15, title: "DIA 15 - Análise Final", video_url: "https://youtube.com/shorts/g0-EWDPERos" },
    { day_number: 16, title: "FECHAMENTO", video_url: "https://youtube.com/shorts/KefWIsWNafs" },
  ],
};

export const getTemplatePhase = (phaseNumber: number): TemplatePhase | undefined => {
  return DO_OR_DIE_TEMPLATE.phases.find(p => p.phase_number === phaseNumber);
};

export const getTemplateTask = (dayNumber: number): TemplateTask | undefined => {
  for (const phase of DO_OR_DIE_TEMPLATE.phases) {
    const task = phase.tasks.find(t => t.day_number === dayNumber);
    if (task) return task;
  }
  return undefined;
};

export const getTotalDays = (): number => {
  return DO_OR_DIE_TEMPLATE.phases.reduce((max, phase) => 
    Math.max(max, phase.end_day), 0
  );
};
