import { Users, Rocket, UsersRound, Zap, DollarSign } from "lucide-react";

export interface BlogHub {
  slug: string;
  title: { pt: string; en: string; es: string };
  description: { pt: string; en: string; es: string };
  introText: { pt: string; en: string; es: string };
  childSlugs: string[];
  ctaLabel: { pt: string; en: string; es: string };
  ctaLink: string;
  icon: typeof Users;
  relatedTools: { label: string; path: string }[];
}

export const blogHubs: BlogHub[] = [
  {
    slug: "cofundador",
    title: {
      pt: "Guia Completo: Como Encontrar e Escolher o Co-Fundador Ideal",
      en: "Complete Guide: How to Find and Choose the Ideal Co-Founder",
      es: "Guía Completa: Cómo Encontrar y Elegir al Co-Fundador Ideal",
    },
    description: {
      pt: "Tudo sobre sociedade, vesting, equity e como encontrar o sócio certo para sua startup.",
      en: "Everything about partnership, vesting, equity and how to find the right partner for your startup.",
      es: "Todo sobre sociedad, vesting, equity y cómo encontrar el socio ideal para tu startup.",
    },
    introText: {
      pt: "Encontrar o co-fundador certo é uma das decisões mais importantes na vida de uma startup. Estudos mostram que conflitos entre sócios são a principal causa de fracasso em empresas early-stage. Nesta página, reunimos nossos melhores artigos sobre como avaliar, negociar e formalizar uma sociedade de sucesso — desde a divisão de equity até contratos de vesting.",
      en: "Finding the right co-founder is one of the most important decisions in a startup's life. Studies show that conflicts between partners are the main cause of failure in early-stage companies. On this page, we've gathered our best articles on how to evaluate, negotiate and formalize a successful partnership — from equity splits to vesting contracts.",
      es: "Encontrar al co-fundador adecuado es una de las decisiones más importantes en la vida de una startup. Los estudios muestran que los conflictos entre socios son la principal causa de fracaso en empresas early-stage. En esta página, reunimos nuestros mejores artículos sobre cómo evaluar, negociar y formalizar una sociedad exitosa.",
    },
    childSlugs: [
      "builder-ou-seller-cofundador",
      "como-encontrar-cofundador-startup",
      "plataformas-encontrar-cofundador",
      "como-encontrar-cofounder-ideal",
      "erros-fatais-sociedade-startup",
      "como-dividir-participacao-societaria-startup",
      "vesting-acoes-cofundadores-guia-completo",
      "stock-options-guia-completo-startups",
      "networking-empreendedores-guia-pratico",
    ],
    ctaLabel: {
      pt: "Encontrar meu Sócio",
      en: "Find my Co-Founder",
      es: "Encontrar mi Socio",
    },
    ctaLink: "/auth?view=signup",
    icon: Users,
    relatedTools: [
      { label: "Calculadora de Equity", path: "/ferramentas-empreendedores/equity-calculator" },
      { label: "Simulador de Cap Table", path: "/ferramentas-empreendedores/cap-table" },
      { label: "Gerador de Contrato", path: "/ferramentas-empreendedores/contract-generator" },
    ],
  },
  {
    slug: "mvp",
    title: {
      pt: "Guia Completo: Como Construir e Validar seu MVP",
      en: "Complete Guide: How to Build and Validate your MVP",
      es: "Guía Completa: Cómo Construir y Validar tu MVP",
    },
    description: {
      pt: "Aprenda a construir, validar e lançar seu Produto Mínimo Viável com metodologias comprovadas.",
      en: "Learn how to build, validate and launch your Minimum Viable Product with proven methodologies.",
      es: "Aprende a construir, validar y lanzar tu Producto Mínimo Viable con metodologías probadas.",
    },
    introText: {
      pt: "Construir um MVP não é apenas criar uma versão simplificada do seu produto — é um processo estratégico de validação que pode economizar meses de trabalho e milhares de reais. Aqui você encontra desde metodologias lean até ferramentas práticas para transformar sua ideia em um produto real, testado e validado pelo mercado.",
      en: "Building an MVP isn't just about creating a simplified version of your product — it's a strategic validation process that can save months of work and thousands of dollars. Here you'll find everything from lean methodologies to practical tools for turning your idea into a real, market-tested product.",
      es: "Construir un MVP no es solo crear una versión simplificada de tu producto — es un proceso estratégico de validación que puede ahorrarte meses de trabajo y miles de dólares. Aquí encontrarás desde metodologías lean hasta herramientas prácticas.",
    },
    childSlugs: [
      "guilda-ia-mvp-builder-crie-seu-mvp-com-inteligencia-artificial",
      "mvp-lean-startup-construir-rapido",
      "mvp-validacao-ideias-guia-completo",
      "como-validar-ideia-startup-sem-dinheiro",
      "validar-ideia-startup-sem-dinheiro",
      "mvp-primeiros-clientes-traction",
      "customer-development-entrevistas-validacao",
      "lean-canvas-modelo-negocio-startup",
      "build-measure-learn-iteracao-rapida-startup",
      "pesquisa-de-mercado-startup-tam-sam-som",
    ],
    ctaLabel: {
      pt: "Começar Aceleração",
      en: "Start Acceleration",
      es: "Comenzar Aceleración",
    },
    ctaLink: "/aceleracao",
    icon: Rocket,
    relatedTools: [
      { label: "GuildaIA MVP Builder", path: "/ferramentas-empreendedores/guilda-ia-mvp" },
      { label: "Business Model Canvas", path: "/ferramentas-empreendedores/business-model" },
      { label: "TAM SAM SOM", path: "/ferramentas-empreendedores/tam-sam-som" },
      { label: "Customer Development", path: "/ferramentas-empreendedores/customer-dev" },
    ],
  },
  {
    slug: "time-startup",
    title: {
      pt: "Guia Completo: Como Montar o Time Ideal para sua Startup",
      en: "Complete Guide: How to Build the Ideal Team for your Startup",
      es: "Guía Completa: Cómo Montar el Equipo Ideal para tu Startup",
    },
    description: {
      pt: "Estratégias para montar, gerenciar e reter talentos no ambiente de startup.",
      en: "Strategies for building, managing and retaining talent in the startup environment.",
      es: "Estrategias para montar, gestionar y retener talentos en el entorno startup.",
    },
    introText: {
      pt: "O time é o ativo mais valioso de uma startup early-stage. Investidores apostam em pessoas antes de apostar em ideias. Nesta seção, exploramos como identificar os perfis certos, quanto pagar, como criar cultura de alta performance e evitar os erros mais comuns na gestão de equipes fundadoras.",
      en: "The team is the most valuable asset of an early-stage startup. Investors bet on people before betting on ideas. In this section, we explore how to identify the right profiles, compensation strategies, creating high-performance culture and avoiding common team management mistakes.",
      es: "El equipo es el activo más valioso de una startup early-stage. Los inversores apuestan por personas antes que por ideas. En esta sección, exploramos cómo identificar los perfiles correctos, cuánto pagar y cómo crear cultura de alto rendimiento.",
    },
    childSlugs: [
      "cultura-startup-times-alta-performance",
      "cultura-startup-gestao-equipes",
      "quanto-pagar-primeiro-funcionario-startup",
      "builder-ou-seller-cofundador",
    ],
    ctaLabel: {
      pt: "Encontrar meu Sócio",
      en: "Find my Co-Founder",
      es: "Encontrar mi Socio",
    },
    ctaLink: "/auth?view=signup",
    icon: UsersRound,
    relatedTools: [
      { label: "Calculadora de Equity", path: "/ferramentas-empreendedores/equity-calculator" },
      { label: "Guia de Recrutamento", path: "/ferramentas-empreendedores/recruiting-guide" },
      { label: "Quiz de Arquétipo", path: "/ferramentas-empreendedores/archetype-quiz" },
    ],
  },
  {
    slug: "aceleracao",
    title: {
      pt: "Guia Completo: Aceleração de Startups — Vale a Pena?",
      en: "Complete Guide: Startup Acceleration — Is It Worth It?",
      es: "Guía Completa: Aceleración de Startups — ¿Vale la Pena?",
    },
    description: {
      pt: "Entenda como funcionam programas de aceleração, métricas essenciais e como se preparar.",
      en: "Understand how acceleration programs work, essential metrics and how to prepare.",
      es: "Entiende cómo funcionan los programas de aceleración, métricas esenciales y cómo prepararte.",
    },
    introText: {
      pt: "Programas de aceleração podem ser o catalisador que sua startup precisa para sair do zero ao one. Mas como escolher o programa certo? Quais métricas acompanhar? Nesta seção, reunimos conteúdos sobre growth hacking, métricas SaaS e unit economics — tudo que você precisa saber para aproveitar ao máximo uma aceleração.",
      en: "Acceleration programs can be the catalyst your startup needs to go from zero to one. But how to choose the right program? Which metrics to track? In this section, we've gathered content on growth hacking, SaaS metrics and unit economics.",
      es: "Los programas de aceleración pueden ser el catalizador que tu startup necesita para ir de cero a uno. ¿Pero cómo elegir el programa correcto? ¿Qué métricas seguir? En esta sección, reunimos contenido sobre growth hacking, métricas SaaS y unit economics.",
    },
    childSlugs: [
      "aceleracao-startups-vale-a-pena",
      "growth-hacking-startups-iniciantes",
      "metricas-saas-startup-acompanhar",
      "metricas-saas-guia-completo",
      "unit-economics-metricas-startup",
    ],
    ctaLabel: {
      pt: "Aplicar para Aceleração",
      en: "Apply for Acceleration",
      es: "Aplicar para Aceleración",
    },
    ctaLink: "/aceleracao/aplicar",
    icon: Zap,
    relatedTools: [
      { label: "Unit Economics", path: "/ferramentas-empreendedores/unit-economics" },
      { label: "Burn Rate Optimizer", path: "/ferramentas-empreendedores/burn-rate-optimizer" },
      { label: "Runway Calculator", path: "/ferramentas-empreendedores/runway-calculator" },
    ],
  },
  {
    slug: "fundraising",
    title: {
      pt: "Guia Completo: Fundraising e Captação de Investimento para Startups",
      en: "Complete Guide: Fundraising and Investment for Startups",
      es: "Guía Completa: Fundraising y Captación de Inversión para Startups",
    },
    description: {
      pt: "Do pitch deck ao term sheet: tudo sobre captar investimento para sua startup.",
      en: "From pitch deck to term sheet: everything about raising investment for your startup.",
      es: "Del pitch deck al term sheet: todo sobre captar inversión para tu startup.",
    },
    introText: {
      pt: "Captar investimento é uma das jornadas mais desafiadoras para founders. Cada rodada tem suas particularidades, desde anjo até Series A. Nesta seção, cobrimos desde como montar um pitch deck matador até como negociar term sheets, entender due diligence e escolher entre bootstrapping e investimento externo.",
      en: "Raising investment is one of the most challenging journeys for founders. Each round has its particularities, from angel to Series A. In this section, we cover everything from building a killer pitch deck to negotiating term sheets, understanding due diligence and choosing between bootstrapping and external investment.",
      es: "Captar inversión es uno de los caminos más desafiantes para founders. Cada ronda tiene sus particularidades, desde ángel hasta Series A. En esta sección, cubrimos desde cómo montar un pitch deck hasta negociar term sheets.",
    },
    childSlugs: [
      "due-diligence-investidores-checklist-completo",
      "pitch-deck-investidores-modelo",
      "pitch-deck-captacao-investimento-guia",
      "pitch-deck-apresentacao-investidores",
      "investimento-anjo-guia-completo",
      "venture-capital-como-funciona",
      "mna-fusoes-aquisicoes-startups",
      "term-sheet-guia-completo-captacao",
      "bootstrapping-vs-investimento-qual-escolher",
      "trafego-organico-canais-gratuitos-clientes",
      "replicar-processo-vendas-escalar",
    ],
    ctaLabel: {
      pt: "Ver ferramentas gratuitas",
      en: "See free tools",
      es: "Ver herramientas gratuitas",
    },
    ctaLink: "/ferramentas-empreendedores",
    icon: DollarSign,
    relatedTools: [
      { label: "Calculadora de Valuation", path: "/ferramentas-empreendedores/valuation-calculator" },
      { label: "Simulador de Cap Table", path: "/ferramentas-empreendedores/cap-table" },
      { label: "Guia de Data Room", path: "/ferramentas-empreendedores/dataroom-guide" },
    ],
  },
];

export const HUB_SLUGS = blogHubs.map(h => h.slug);

export const getHubBySlug = (slug: string): BlogHub | undefined =>
  blogHubs.find(h => h.slug === slug);

export const isHubSlug = (slug: string): boolean =>
  HUB_SLUGS.includes(slug);
