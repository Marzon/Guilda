// Centralized routes for the entire application
// This ensures consistency between navigation and progress tracking

export const ROUTES = {
  // Auth
  auth: '/auth',
  
  // Programs
  aceleracao: '/aceleracao',
  accelerationEnroll: '/aceleracao/inscrever',
  accelerationApplication: '/aceleracao/aplicar',
  startupCanvas: '/aceleracao/construcao',
  
  // Core pages
  tavern: '/tavern',
  profile: '/profile',
  settings: '/settings',
  messages: '/messages',
  
  // Projects
  createProject: '/create-project',
  createProjectAdvanced: '/create-project/advanced',
  projects: '/projects',
  projectDetail: (id: string) => `/projeto/${id}`,
  
  // Navigation pages
  pricing: '/pricing',
  connections: '/conexoes',
  profileViewers: '/quem-viu',
  founderGuide: '/faq', // Legacy - redirects to FAQ
  faq: '/faq',
  myApplications: '/minhas-candidaturas',
  blog: '/blog',
  jobs: '/vagas',
  jobDetail: (id: string) => `/vagas/${id}`,
  install: '/install',
  notifications: '/notifications',
  admin: '/admin',
  
  // Blog Hubs (Pillar Pages)
  blogHubs: {
    cofundador: '/blog/cofundador',
    mvp: '/blog/mvp',
    timeStartup: '/blog/time-startup',
    aceleracao: '/blog/aceleracao',
    fundraising: '/blog/fundraising',
  },
  
  // Tools base path
  toolsBase: '/ferramentas-empreendedores',
  
  // All tool pages - used by founder guide and navigation
  tools: {
    equityCalculator: '/ferramentas-empreendedores/equity-calculator',
    capTable: '/ferramentas-empreendedores/cap-table',
    valuationCalculator: '/ferramentas-empreendedores/valuation-calculator',
    contractGenerator: '/ferramentas-empreendedores/contract-generator',
    businessModel: '/ferramentas-empreendedores/business-model',
    tamSamSom: '/ferramentas-empreendedores/tam-sam-som',
    swot: '/ferramentas-empreendedores/swot',
    customerDev: '/ferramentas-empreendedores/customer-dev',
    runwayCalculator: '/ferramentas-empreendedores/runway-calculator',
    dataroomGuide: '/ferramentas-empreendedores/dataroom-guide',
    unitEconomics: '/ferramentas-empreendedores/unit-economics',
    burnRateOptimizer: '/ferramentas-empreendedores/burn-rate-optimizer',
    archetypeQuiz: '/ferramentas-empreendedores/archetype-quiz',
    knowledgeRoadmap: '/ferramentas-empreendedores/knowledge-roadmap',
    // Seller tools
    markupCalculator: '/ferramentas-empreendedores/markup-calculator',
    cardFeeSimulator: '/ferramentas-empreendedores/card-fee-simulator',
    breakevenCalculator: '/ferramentas-empreendedores/breakeven-calculator',
    roiCalculator: '/ferramentas-empreendedores/roi-calculator',
    proposalGenerator: '/ferramentas-empreendedores/proposal-generator',
    businessHealthQuiz: '/ferramentas-empreendedores/business-health-quiz',
    companyOpeningChecklist: '/ferramentas-empreendedores/company-opening-checklist',
    empathyMap: '/ferramentas-empreendedores/empathy-map',
    lgpdGuide: '/ferramentas-empreendedores/lgpd-guide',
    recruitingGuide: '/ferramentas-empreendedores/recruiting-guide',
    mvpVibecoding: '/ferramentas-empreendedores/mvp-vibecoding',
    guildaIaMvp: '/ferramentas-empreendedores/guilda-ia-mvp',
    coldOutreach: '/ferramentas-empreendedores/cold-outreach',
    quizEmpreendedor: '/quiz-empreendedor',
  },
} as const;
