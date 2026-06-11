// Founder progress tracking hook - simplified version (progress bar removed)
import { useMemo } from 'react';
import { useAuth } from './useAuth';
import { useMyProjects } from './useMyProjects';
import { useMatches } from './useMatches';
import { ROUTES } from '@/lib/routes';

export interface GuideItem {
  id: string;
  moduleId: string;
  titleKey: string;
  descriptionKey: string;
  route?: string;
  autoDetect?: boolean;
}

export interface GuideModule {
  id: string;
  titleKey: string;
  iconKey: string;
  items: GuideItem[];
}

export const founderGuideModules: GuideModule[] = [
  // 1. Instalar o App
  {
    id: 'installing-app',
    titleKey: 'founderGuide.modules.installingApp.title',
    iconKey: '📱',
    items: [
      {
        id: 'install-pwa',
        moduleId: 'installing-app',
        titleKey: 'founderGuide.modules.installingApp.items.installPwa.title',
        descriptionKey: 'founderGuide.modules.installingApp.items.installPwa.description',
        route: ROUTES.install,
      },
      {
        id: 'enable-push',
        moduleId: 'installing-app',
        titleKey: 'founderGuide.modules.installingApp.items.enablePush.title',
        descriptionKey: 'founderGuide.modules.installingApp.items.enablePush.description',
        autoDetect: true,
      },
      {
        id: 'configure-email',
        moduleId: 'installing-app',
        titleKey: 'founderGuide.modules.installingApp.items.configureEmail.title',
        descriptionKey: 'founderGuide.modules.installingApp.items.configureEmail.description',
      },
    ],
  },
  // 2. Primeiros Passos
  {
    id: 'getting-started',
    titleKey: 'founderGuide.modules.gettingStarted.title',
    iconKey: '🏠',
    items: [
      {
        id: 'complete-profile',
        moduleId: 'getting-started',
        titleKey: 'founderGuide.modules.gettingStarted.items.completeProfile.title',
        descriptionKey: 'founderGuide.modules.gettingStarted.items.completeProfile.description',
        route: ROUTES.profile,
        autoDetect: true,
      },
      {
        id: 'define-archetype',
        moduleId: 'getting-started',
        titleKey: 'founderGuide.modules.gettingStarted.items.defineArchetype.title',
        descriptionKey: 'founderGuide.modules.gettingStarted.items.defineArchetype.description',
        autoDetect: true,
      },
      {
        id: 'create-project',
        moduleId: 'getting-started',
        titleKey: 'founderGuide.modules.gettingStarted.items.createProject.title',
        descriptionKey: 'founderGuide.modules.gettingStarted.items.createProject.description',
        route: ROUTES.createProject,
        autoDetect: true,
      },
      {
        id: 'publish-role',
        moduleId: 'getting-started',
        titleKey: 'founderGuide.modules.gettingStarted.items.publishRole.title',
        descriptionKey: 'founderGuide.modules.gettingStarted.items.publishRole.description',
        autoDetect: true,
      },
    ],
  },
  // 3. Recursos Premium
  {
    id: 'premium-features',
    titleKey: 'founderGuide.modules.premiumFeatures.title',
    iconKey: '💎',
    items: [
      {
        id: 'know-plans',
        moduleId: 'premium-features',
        titleKey: 'founderGuide.modules.premiumFeatures.items.knowPlans.title',
        descriptionKey: 'founderGuide.modules.premiumFeatures.items.knowPlans.description',
        route: ROUTES.pricing,
      },
      {
        id: 'ai-match',
        moduleId: 'premium-features',
        titleKey: 'founderGuide.modules.premiumFeatures.items.aiMatch.title',
        descriptionKey: 'founderGuide.modules.premiumFeatures.items.aiMatch.description',
        route: ROUTES.tavern,
      },
      {
        id: 'premium-contacts',
        moduleId: 'premium-features',
        titleKey: 'founderGuide.modules.premiumFeatures.items.premiumContacts.title',
        descriptionKey: 'founderGuide.modules.premiumFeatures.items.premiumContacts.description',
        route: ROUTES.connections,
      },
    ],
  },
  // 4. Encontre seu Cofounder
  {
    id: 'finding-cofounder',
    titleKey: 'founderGuide.modules.findingCofounder.title',
    iconKey: '🔍',
    items: [
      {
        id: 'browse-tavern',
        moduleId: 'finding-cofounder',
        titleKey: 'founderGuide.modules.findingCofounder.items.browseTavern.title',
        descriptionKey: 'founderGuide.modules.findingCofounder.items.browseTavern.description',
      },
      {
        id: 'send-first-match',
        moduleId: 'finding-cofounder',
        titleKey: 'founderGuide.modules.findingCofounder.items.sendFirstMatch.title',
        descriptionKey: 'founderGuide.modules.findingCofounder.items.sendFirstMatch.description',
        autoDetect: true,
      },
      {
        id: 'start-conversation',
        moduleId: 'finding-cofounder',
        titleKey: 'founderGuide.modules.findingCofounder.items.startConversation.title',
        descriptionKey: 'founderGuide.modules.findingCofounder.items.startConversation.description',
        autoDetect: true,
      },
      {
        id: 'analyze-compatibility',
        moduleId: 'finding-cofounder',
        titleKey: 'founderGuide.modules.findingCofounder.items.analyzeCompatibility.title',
        descriptionKey: 'founderGuide.modules.findingCofounder.items.analyzeCompatibility.description',
        autoDetect: false,
      },
    ],
  },
  // 5. Networking Avançado
  {
    id: 'advanced-networking',
    titleKey: 'founderGuide.modules.advancedNetworking.title',
    iconKey: '🤝',
    items: [
      {
        id: 'make-introduction',
        moduleId: 'advanced-networking',
        titleKey: 'founderGuide.modules.advancedNetworking.items.makeIntroduction.title',
        descriptionKey: 'founderGuide.modules.advancedNetworking.items.makeIntroduction.description',
      },
      {
        id: 'react-profile',
        moduleId: 'advanced-networking',
        titleKey: 'founderGuide.modules.advancedNetworking.items.reactProfile.title',
        descriptionKey: 'founderGuide.modules.advancedNetworking.items.reactProfile.description',
        route: ROUTES.tavern,
      },
      {
        id: 'view-viewers',
        moduleId: 'advanced-networking',
        titleKey: 'founderGuide.modules.advancedNetworking.items.viewViewers.title',
        descriptionKey: 'founderGuide.modules.advancedNetworking.items.viewViewers.description',
        route: ROUTES.profileViewers,
      },
    ],
  },
  // 6. Ferramentas Essenciais
  {
    id: 'essential-tools',
    titleKey: 'founderGuide.modules.essentialTools.title',
    iconKey: '🛠️',
    items: [
      {
        id: 'equity-calculator',
        moduleId: 'essential-tools',
        titleKey: 'founderGuide.modules.essentialTools.items.equityCalculator.title',
        descriptionKey: 'founderGuide.modules.essentialTools.items.equityCalculator.description',
        route: ROUTES.tools.equityCalculator,
      },
      {
        id: 'cap-table',
        moduleId: 'essential-tools',
        titleKey: 'founderGuide.modules.essentialTools.items.capTable.title',
        descriptionKey: 'founderGuide.modules.essentialTools.items.capTable.description',
        route: ROUTES.tools.capTable,
      },
      {
        id: 'valuation',
        moduleId: 'essential-tools',
        titleKey: 'founderGuide.modules.essentialTools.items.valuation.title',
        descriptionKey: 'founderGuide.modules.essentialTools.items.valuation.description',
        route: ROUTES.tools.valuationCalculator,
      },
      {
        id: 'contract-generator',
        moduleId: 'essential-tools',
        titleKey: 'founderGuide.modules.essentialTools.items.contractGenerator.title',
        descriptionKey: 'founderGuide.modules.essentialTools.items.contractGenerator.description',
        route: ROUTES.tools.contractGenerator,
      },
    ],
  },
  // 7. Planejando sua Startup
  {
    id: 'planning-startup',
    titleKey: 'founderGuide.modules.planningStartup.title',
    iconKey: '🚀',
    items: [
      {
        id: 'business-canvas',
        moduleId: 'planning-startup',
        titleKey: 'founderGuide.modules.planningStartup.items.businessCanvas.title',
        descriptionKey: 'founderGuide.modules.planningStartup.items.businessCanvas.description',
        route: ROUTES.tools.businessModel,
      },
      {
        id: 'tam-sam-som',
        moduleId: 'planning-startup',
        titleKey: 'founderGuide.modules.planningStartup.items.tamSamSom.title',
        descriptionKey: 'founderGuide.modules.planningStartup.items.tamSamSom.description',
        route: ROUTES.tools.tamSamSom,
      },
      {
        id: 'swot-analysis',
        moduleId: 'planning-startup',
        titleKey: 'founderGuide.modules.planningStartup.items.swotAnalysis.title',
        descriptionKey: 'founderGuide.modules.planningStartup.items.swotAnalysis.description',
        route: ROUTES.tools.swot,
      },
      {
        id: 'customer-development',
        moduleId: 'planning-startup',
        titleKey: 'founderGuide.modules.planningStartup.items.customerDevelopment.title',
        descriptionKey: 'founderGuide.modules.planningStartup.items.customerDevelopment.description',
        route: ROUTES.tools.customerDev,
      },
    ],
  },
  // 8. Preparando para Investimento
  {
    id: 'preparing-investment',
    titleKey: 'founderGuide.modules.preparingInvestment.title',
    iconKey: '💼',
    items: [
      {
        id: 'runway-calculator',
        moduleId: 'preparing-investment',
        titleKey: 'founderGuide.modules.preparingInvestment.items.runwayCalculator.title',
        descriptionKey: 'founderGuide.modules.preparingInvestment.items.runwayCalculator.description',
        route: ROUTES.tools.runwayCalculator,
      },
      {
        id: 'data-room',
        moduleId: 'preparing-investment',
        titleKey: 'founderGuide.modules.preparingInvestment.items.dataRoom.title',
        descriptionKey: 'founderGuide.modules.preparingInvestment.items.dataRoom.description',
        route: ROUTES.tools.dataroomGuide,
      },
      {
        id: 'unit-economics',
        moduleId: 'preparing-investment',
        titleKey: 'founderGuide.modules.preparingInvestment.items.unitEconomics.title',
        descriptionKey: 'founderGuide.modules.preparingInvestment.items.unitEconomics.description',
        route: ROUTES.tools.unitEconomics,
      },
      {
        id: 'burn-rate',
        moduleId: 'preparing-investment',
        titleKey: 'founderGuide.modules.preparingInvestment.items.burnRate.title',
        descriptionKey: 'founderGuide.modules.preparingInvestment.items.burnRate.description',
        route: ROUTES.tools.burnRateOptimizer,
      },
    ],
  },
  // 9. Aprendizado
  {
    id: 'learning',
    titleKey: 'founderGuide.modules.learning.title',
    iconKey: '📚',
    items: [
      {
        id: 'read-blog',
        moduleId: 'learning',
        titleKey: 'founderGuide.modules.learning.items.readBlog.title',
        descriptionKey: 'founderGuide.modules.learning.items.readBlog.description',
        route: ROUTES.blog,
      },
      {
        id: 'archetype-quiz',
        moduleId: 'learning',
        titleKey: 'founderGuide.modules.learning.items.archetypeQuiz.title',
        descriptionKey: 'founderGuide.modules.learning.items.archetypeQuiz.description',
        route: ROUTES.tools.archetypeQuiz,
      },
      {
        id: 'knowledge-roadmap',
        moduleId: 'learning',
        titleKey: 'founderGuide.modules.learning.items.knowledgeRoadmap.title',
        descriptionKey: 'founderGuide.modules.learning.items.knowledgeRoadmap.description',
        route: ROUTES.tools.knowledgeRoadmap,
      },
    ],
  },
];

/**
 * Simplified founder progress hook.
 * Progress bar feature has been removed - this hook now only exports 
 * the guide modules for use in FAQ and returns static values.
 */
export function useFounderProgress() {
  const authQuery = useAuth();
  const authData = authQuery.data;
  const profile = authData?.profile;
  const userId = authData?.user?.id || null;
  
  const { ownedProjects } = useMyProjects();
  const matchesData = useMatches(userId);

  // Auto-detect completed items based on user data (kept for potential future use)
  const autoDetectedItems = useMemo(() => {
    const items: string[] = [];
    
    if (!profile) return items;

    if (profile.bio && profile.avatar_url) {
      items.push('complete-profile');
    }

    if (profile.archetype) {
      items.push('define-archetype');
    }

    if (ownedProjects && ownedProjects.length > 0) {
      items.push('create-project');
      
      const hasRoles = ownedProjects.some(p => 
        (p._count?.openRoles ?? 0) > 0 || (p._count?.members ?? 0) > 0
      );
      if (hasRoles) {
        items.push('publish-role');
      }
    }

    items.push('browse-tavern');

    const isPushEnabled = localStorage.getItem("push_prompt_completed") === "true";
    if (isPushEnabled) {
      items.push('enable-push');
    }

    if (matchesData.matches && matchesData.matches.length > 0) {
      items.push('send-first-match');
      
      const hasAccepted = matchesData.matches.some(m => m.status === 'ACCEPTED');
      if (hasAccepted) {
        items.push('start-conversation');
      }
    }

    return items;
  }, [profile, ownedProjects, matchesData.matches]);

  const totalItems = founderGuideModules.reduce((acc, m) => acc + m.items.length, 0);
  const progress = Math.round((autoDetectedItems.length / totalItems) * 100);

  // Simplified return - progress bar is always hidden
  return {
    modules: founderGuideModules,
    completedItems: autoDetectedItems,
    progress,
    moduleProgress: {} as Record<string, { completed: number; total: number }>,
    nextItem: null,
    completeItem: () => Promise.resolve(),
    isItemComplete: (itemId: string) => autoDetectedItems.includes(itemId),
    isComplete: progress === 100,
    isLoading: false,
    // Progress bar always hidden - feature removed
    isProgressBarVisible: false,
    founderGuideComplete: progress === 100,
  };
}
