import { 
  Search, Users, Target, TrendingUp, BarChart3, 
  Lightbulb, Rocket, DollarSign, type LucideIcon 
} from 'lucide-react';
import type { Archetype } from '@/types/archetype';

export interface RecommendedTool {
  id: string;
  excludeFor: Archetype[];
}

export interface RecommendedArticle {
  slug: string;
  excludeFor: Archetype[];
}

export interface RecommendationPhase {
  id: string;
  nameKey: string;
  descriptionKey: string;
  icon: LucideIcon;
  colorClass: string;
  bgColorClass: string;
  borderColorClass: string;
  tools: RecommendedTool[];
  articles: RecommendedArticle[];
}

// ==========================================
// COMPANY BUILDING TRACK (with project)
// Based on acceleration framework phases
// ==========================================

export const COMPANY_BUILDING_PHASES: RecommendationPhase[] = [
  {
    id: 'discovery',
    nameKey: 'tools.recommendations.companyBuilding.phase1.name',
    descriptionKey: 'tools.recommendations.companyBuilding.phase1.description',
    icon: Search,
    colorClass: 'text-amber-600',
    bgColorClass: 'bg-amber-50 dark:bg-amber-950/30',
    borderColorClass: 'border-amber-200 dark:border-amber-800',
    tools: [
      { id: 'empathy-map', excludeFor: [] },
      { id: 'customer-dev', excludeFor: [] },
      { id: 'business-model', excludeFor: [] },
    ],
    articles: [
      { slug: 'customer-development-entrevistas-validacao', excludeFor: [] },
      { slug: 'lean-canvas-modelo-negocio-startup', excludeFor: [] },
    ],
  },
  {
    id: 'validation',
    nameKey: 'tools.recommendations.companyBuilding.phase2.name',
    descriptionKey: 'tools.recommendations.companyBuilding.phase2.description',
    icon: Users,
    colorClass: 'text-blue-600',
    bgColorClass: 'bg-blue-50 dark:bg-blue-950/30',
    borderColorClass: 'border-blue-200 dark:border-blue-800',
    tools: [
      { id: 'cold-outreach', excludeFor: ['SELLER'] },
      { id: 'guilda-ia-mvp', excludeFor: ['BUILDER'] },
      { id: 'tam-sam-som', excludeFor: [] },
    ],
    articles: [
      { slug: 'landing-page-startup-conversao', excludeFor: [] },
      { slug: 'trafego-organico-startup-seo', excludeFor: [] },
    ],
  },
  {
    id: 'traction',
    nameKey: 'tools.recommendations.companyBuilding.phase3.name',
    descriptionKey: 'tools.recommendations.companyBuilding.phase3.description',
    icon: TrendingUp,
    colorClass: 'text-green-600',
    bgColorClass: 'bg-green-50 dark:bg-green-950/30',
    borderColorClass: 'border-green-200 dark:border-green-800',
    tools: [
      { id: 'mvp-vibecoding', excludeFor: ['BUILDER'] },
      { id: 'proposal-generator', excludeFor: ['SELLER'] },
      { id: 'markup-calculator', excludeFor: ['SELLER'] },
      { id: 'unit-economics', excludeFor: [] },
    ],
    articles: [
      { slug: 'mvp-minimo-produto-viavel', excludeFor: [] },
      { slug: 'primeiras-vendas-startup', excludeFor: [] },
    ],
  },
  {
    id: 'analysis',
    nameKey: 'tools.recommendations.companyBuilding.phase4.name',
    descriptionKey: 'tools.recommendations.companyBuilding.phase4.description',
    icon: BarChart3,
    colorClass: 'text-purple-600',
    bgColorClass: 'bg-purple-50 dark:bg-purple-950/30',
    borderColorClass: 'border-purple-200 dark:border-purple-800',
    tools: [
      { id: 'business-health-quiz', excludeFor: [] },
      { id: 'valuation-calculator', excludeFor: [] },
      { id: 'runway-calculator', excludeFor: [] },
    ],
    articles: [
      { slug: 'metricas-startup-kpis', excludeFor: [] },
      { slug: 'due-diligence-startup', excludeFor: [] },
    ],
  },
];

// ==========================================
// LEARNING GUIDE TRACK (without project)
// Focused on education and preparation
// ==========================================

export const LEARNING_GUIDE_PHASES: RecommendationPhase[] = [
  {
    id: 'self-knowledge',
    nameKey: 'tools.recommendations.learningGuide.phase1.name',
    descriptionKey: 'tools.recommendations.learningGuide.phase1.description',
    icon: Lightbulb,
    colorClass: 'text-amber-600',
    bgColorClass: 'bg-amber-50 dark:bg-amber-950/30',
    borderColorClass: 'border-amber-200 dark:border-amber-800',
    tools: [
      { id: 'archetype-quiz', excludeFor: [] },
    ],
    articles: [
      { slug: 'builder-vs-seller-startup', excludeFor: [] },
      { slug: 'perfil-empreendedor-startup', excludeFor: [] },
    ],
  },
  {
    id: 'fundamentals',
    nameKey: 'tools.recommendations.learningGuide.phase2.name',
    descriptionKey: 'tools.recommendations.learningGuide.phase2.description',
    icon: Target,
    colorClass: 'text-blue-600',
    bgColorClass: 'bg-blue-50 dark:bg-blue-950/30',
    borderColorClass: 'border-blue-200 dark:border-blue-800',
    tools: [
      { id: 'business-model', excludeFor: [] },
      { id: 'empathy-map', excludeFor: [] },
      { id: 'swot', excludeFor: [] },
    ],
    articles: [
      { slug: 'como-validar-ideia-startup', excludeFor: [] },
      { slug: 'customer-development-entrevistas-validacao', excludeFor: [] },
    ],
  },
  {
    id: 'essential-tools',
    nameKey: 'tools.recommendations.learningGuide.phase3.name',
    descriptionKey: 'tools.recommendations.learningGuide.phase3.description',
    icon: Rocket,
    colorClass: 'text-green-600',
    bgColorClass: 'bg-green-50 dark:bg-green-950/30',
    borderColorClass: 'border-green-200 dark:border-green-800',
    tools: [
      { id: 'equity-calculator', excludeFor: [] },
      { id: 'valuation-calculator', excludeFor: [] },
      { id: 'contract-generator', excludeFor: [] },
    ],
    articles: [
      { slug: 'divisao-equity-cofundadores', excludeFor: [] },
      { slug: 'contrato-socios-startup', excludeFor: [] },
    ],
  },
  {
    id: 'next-steps',
    nameKey: 'tools.recommendations.learningGuide.phase4.name',
    descriptionKey: 'tools.recommendations.learningGuide.phase4.description',
    icon: DollarSign,
    colorClass: 'text-purple-600',
    bgColorClass: 'bg-purple-50 dark:bg-purple-950/30',
    borderColorClass: 'border-purple-200 dark:border-purple-800',
    tools: [
      { id: 'runway-calculator', excludeFor: [] },
      { id: 'unit-economics', excludeFor: [] },
    ],
    articles: [
      { slug: 'como-encontrar-cofundador', excludeFor: [] },
      { slug: 'primeiros-passos-startup', excludeFor: [] },
    ],
  },
];

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

export const getFilteredTools = (
  tools: RecommendedTool[], 
  archetype: Archetype | undefined
): RecommendedTool[] => {
  if (!archetype) return tools;
  return tools.filter(tool => !tool.excludeFor.includes(archetype));
};

export const getFilteredArticles = (
  articles: RecommendedArticle[], 
  archetype: Archetype | undefined
): RecommendedArticle[] => {
  if (!archetype) return articles;
  return articles.filter(article => !article.excludeFor.includes(archetype));
};

export const getUsedToolsFromStorage = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem('recentTools') || '[]');
  } catch {
    return [];
  }
};

export const getUsedToolsCount = (toolIds: string[]): number => {
  const recentTools = getUsedToolsFromStorage();
  return toolIds.filter(id => recentTools.includes(id)).length;
};
