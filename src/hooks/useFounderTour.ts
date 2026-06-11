import { useState, useCallback, useEffect, useRef } from 'react';
import { driver, DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useLanguage } from './useLanguage';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTourTracking } from './useTourTracking';

const TOUR_COMPLETED_KEY = 'guilda_founder_tour_completed';
const TOUR_SKIPPED_KEY = 'guilda_founder_tour_skipped';
const NEW_USER_KEY = 'guilda_is_new_user';

// Store driver instance outside component to avoid ref issues
let currentDriverInstance: ReturnType<typeof driver> | null = null;

export function useFounderTour() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [isRunning, setIsRunning] = useState(false);
  const [showAutoStartPrompt, setShowAutoStartPrompt] = useState(false);
  const promptTrackedRef = useRef(false);

  // Tour tracking
  const {
    trackPromptShown,
    trackTourStarted,
    trackTourSkipped,
    trackStepViewed,
    trackTourCompleted,
    trackTourAbandoned,
  } = useTourTracking('founder_tour');

  const hasCompletedTour = localStorage.getItem(TOUR_COMPLETED_KEY) === 'true';

  // Check if should auto-start for new users
  const shouldAutoStart = useCallback(() => {
    const isNewUser = localStorage.getItem(NEW_USER_KEY) === 'true';
    const hasCompleted = localStorage.getItem(TOUR_COMPLETED_KEY) === 'true';
    const hasSkipped = localStorage.getItem(TOUR_SKIPPED_KEY) === 'true';
    
    return isNewUser && !hasCompleted && !hasSkipped;
  }, []);

  // Auto-start prompt for new users on /tavern
  useEffect(() => {
    if (location.pathname === '/tavern' && shouldAutoStart()) {
      const timer = setTimeout(() => {
        setShowAutoStartPrompt(true);
        // Track prompt shown only once
        if (!promptTrackedRef.current) {
          promptTrackedRef.current = true;
          trackPromptShown();
        }
      }, 1500); // 1.5s delay to let page load
      return () => clearTimeout(timer);
    }
  }, [location.pathname, shouldAutoStart, trackPromptShown]);

  // Confirm auto-start - start tour
  const confirmAutoStart = useCallback(() => {
    localStorage.removeItem(NEW_USER_KEY);
    setShowAutoStartPrompt(false);
    trackTourStarted(true); // auto_start = true
    // Small delay to close dialog before starting tour
    setTimeout(() => {
      startTourInternal(true);
    }, 100);
  }, [trackTourStarted]);

  // Skip tour
  const skipTour = useCallback(() => {
    localStorage.removeItem(NEW_USER_KEY);
    localStorage.setItem(TOUR_SKIPPED_KEY, 'true');
    setShowAutoStartPrompt(false);
    trackTourSkipped();
  }, [trackTourSkipped]);

  // Helper to wait for element to appear
  const waitForElement = (selector: string, timeout = 2000): Promise<Element | null> => {
    return new Promise((resolve) => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
        return;
      }

      const observer = new MutationObserver(() => {
        const el = document.querySelector(selector);
        if (el) {
          observer.disconnect();
          resolve(el);
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });

      setTimeout(() => {
        observer.disconnect();
        resolve(null);
      }, timeout);
    });
  };

  const startTourInternal = useCallback((alreadyTracked = false) => {
    initializeTour();

    async function initializeTour() {
      setIsRunning(true);
      
      // Detect mobile at runtime to avoid hook issues
      const isMobile = window.innerWidth < 768;
      
      // Track current step for abandonment tracking
      let currentStepIndex = 0;
      let currentStepName = 'welcome';

      // Common steps (work on both devices)
      const commonSteps: DriveStep[] = [
        // Step 1: Welcome
        {
          popover: {
            title: t('founderTour.welcome.title', 'Bem-vindo à Taverna!'),
            description: t('founderTour.welcome.description',
              'Aqui você encontra co-founders para sua startup. Vamos explorar juntos!'),
          },
        },
        // Step 2: Online Counter
        {
          element: '[data-tour="online-counter"]',
          popover: {
            title: t('founderTour.onlineCounter.title', 'Founders Online'),
            description: t('founderTour.onlineCounter.description',
              'Veja quantos founders estão online agora. Conecte-se com quem está disponível!'),
            side: 'bottom',
            align: 'center',
          },
        },
        // Step 3: Hide Viewed Toggle
        {
          element: '[data-tour="hide-viewed"]',
          popover: {
            title: t('founderTour.hideViewed.title', 'Esconder Vistos'),
            description: t('founderTour.hideViewed.description',
              'Ative para esconder perfis que você já visualizou e descobrir novos founders.'),
            side: 'bottom',
            align: 'center',
          },
        },
        // Step 4: Mode Toggle (AI vs Grid)
        {
          element: '[data-tour="mode-toggle"]',
          popover: {
            title: t('founderTour.modeToggle.title', 'Dois Modos de Descoberta'),
            description: t('founderTour.modeToggle.description',
              'Use IA para matches inteligentes ou explore todos os perfis manualmente no modo grade.'),
            side: 'bottom',
            align: 'center',
          },
        },
        // Step 5: Tier Filter
        {
          element: '[data-tour="tier-filter"]',
          popover: {
            title: t('founderTour.tierFilter.title', 'Filtro Aceleração'),
            description: t('founderTour.tierFilter.description',
              'Encontre membros do programa de aceleração com o selo especial.'),
            side: 'bottom',
            align: 'center',
          },
        },
        // Step 6: Profile Card
        {
          element: '[data-tour="founder-card"]',
          popover: {
            title: t('founderTour.profileCard.title', 'Card de Perfil'),
            description: t('founderTour.profileCard.description',
              'Cada card mostra: arquétipo, match score, o que busca e o que oferece. Clique para ver mais.'),
            side: 'top',
            align: 'center',
          },
        },
        // Step 7: Connect Button
        {
          element: '[data-tour="connect-button"]',
          popover: {
            title: t('founderTour.connectButton.title', 'Conectar'),
            description: t('founderTour.connectButton.description',
              'Envie um convite de conexão! Quando aceito, vocês podem conversar diretamente.'),
            side: 'top',
            align: 'center',
          },
        },
      ];

      // Desktop-only: Sidebar step
      const desktopSidebarStep: DriveStep = {
        element: '[data-tour="tavern-sidebar"]',
        popover: {
          title: t('founderTour.sidebar.title', 'Painel Lateral'),
          description: t('founderTour.sidebar.description',
            'Acompanhe candidaturas recebidas, seus projetos e ferramentas usadas recentemente.'),
          side: 'right',
          align: 'start',
        },
      };

      // Desktop navigation steps (InternalNavbar - top navbar)
      const desktopNavSteps: DriveStep[] = [
        {
          element: 'header [data-tour="nav-capital"]',
          popover: {
            title: t('founderTour.navCapital.title', 'Capital'),
            description: t('founderTour.navCapital.description',
              'Conheça investidores buscando startups para investir.'),
            side: 'bottom',
            align: 'center',
          },
        },
        {
          element: 'header [data-tour="nav-startups"]',
          popover: {
            title: t('founderTour.navStartups.title', 'Startups'),
            description: t('founderTour.navStartups.description',
              'Explore startups cadastradas, veja detalhes e vagas em aberto.'),
            side: 'bottom',
            align: 'center',
          },
        },
        {
          element: 'header [data-tour="nav-tools"]',
          popover: {
            title: t('founderTour.navTools.title', 'Ferramentas'),
            description: t('founderTour.navTools.description',
              'Calculadoras, geradores e recursos para founders.'),
            side: 'bottom',
            align: 'center',
          },
        },
        {
          element: 'header [data-tour="nav-notifications"]',
          popover: {
            title: t('founderTour.navNotifications.title', 'Mensagens'),
            description: t('founderTour.navNotifications.description',
              'Receba notificações de conexões e mensagens.'),
            side: 'bottom',
            align: 'center',
          },
        },
        {
          element: 'header [data-tour="nav-jobs"]',
          popover: {
            title: t('founderTour.navJobs.title', 'Vagas'),
            description: t('founderTour.navJobs.description',
              'Encontre ou divulgue vagas de co-founder.'),
            side: 'bottom',
            align: 'center',
          },
        },
      ];

      // Mobile navigation steps (BottomTabBar - bottom bar)
      const mobileNavSteps: DriveStep[] = [
        {
          element: 'nav.fixed.bottom-0 [data-tour="nav-tavern"]',
          popover: {
            title: t('founderTour.navTavern.title', 'Taverna'),
            description: t('founderTour.navTavern.description',
              'Você está aqui! Volte a qualquer momento para encontrar co-founders.'),
            side: 'top',
            align: 'center',
          },
        },
        {
          element: 'nav.fixed.bottom-0 [data-tour="nav-capital"]',
          popover: {
            title: t('founderTour.navCapital.title', 'Capital'),
            description: t('founderTour.navCapital.description',
              'Conheça investidores buscando startups para investir.'),
            side: 'top',
            align: 'center',
          },
        },
        {
          element: 'nav.fixed.bottom-0 [data-tour="nav-startups"]',
          popover: {
            title: t('founderTour.navStartups.title', 'Startups'),
            description: t('founderTour.navStartups.description',
              'Explore startups cadastradas, veja detalhes e vagas em aberto.'),
            side: 'top',
            align: 'center',
          },
        },
        {
          element: 'nav.fixed.bottom-0 [data-tour="nav-tools"]',
          popover: {
            title: t('founderTour.navTools.title', 'Ferramentas'),
            description: t('founderTour.navTools.description',
              'Calculadoras, geradores e recursos para founders.'),
            side: 'top',
            align: 'center',
          },
        },
        {
          element: 'nav.fixed.bottom-0 [data-tour="nav-notifications"]',
          popover: {
            title: t('founderTour.navNotifications.title', 'Notificações'),
            description: t('founderTour.navNotifications.description',
              'Receba alertas de conexões e mensagens.'),
            side: 'top',
            align: 'center',
          },
        },
        {
          element: 'nav.fixed.bottom-0 [data-tour="nav-jobs"]',
          popover: {
            title: t('founderTour.navJobs.title', 'Vagas'),
            description: t('founderTour.navJobs.description',
              'Encontre ou divulgue vagas de co-founder.'),
            side: 'top',
            align: 'center',
          },
        },
      ];

      // Closing step
      const closingStep: DriveStep = {
        popover: {
          title: t('founderTour.getStarted.title', 'Pronto para começar!'),
          description: t('founderTour.getStarted.description',
            'Explore os perfis e envie seu primeiro convite de conexão!'),
        },
      };

      // Combine steps based on device
      const allSteps: DriveStep[] = [
        ...commonSteps,
        ...(isMobile ? [] : [desktopSidebarStep]),
        ...(isMobile ? mobileNavSteps : desktopNavSteps),
        closingStep,
      ];

      // Filter out steps where the element doesn't exist (except for popover-only steps)
      const availableSteps = allSteps.filter(step => {
        if (typeof step.element === 'string') {
          return document.querySelector(step.element) !== null;
        }
        return true; // Popover-only steps are always included
      });

      // If there are few steps, ensure we at least have a meaningful tour
      if (availableSteps.length < 3) {
        availableSteps.push({
          popover: {
            title: t('founderTour.getStarted.title', 'Comece a explorar!'),
            description: t('founderTour.getStarted.description',
              'Navegue pelos founders e envie convites de conexão para construir sua rede.'),
          },
        });
      }

      const driverObj = driver({
        showProgress: true,
        animate: true,
        allowClose: true,
        overlayColor: 'rgba(0, 0, 0, 0.7)',
        stagePadding: 8,
        stageRadius: 8,
        popoverClass: 'founder-tour-popover',
        nextBtnText: t('founderTour.next', 'Próximo'),
        prevBtnText: t('founderTour.prev', 'Anterior'),
        doneBtnText: t('founderTour.done', 'Entendi!'),
        onHighlightStarted: (element, step, options) => {
          // Track step viewed
          currentStepIndex = options.state.activeIndex || 0;
          const stepConfig = availableSteps[currentStepIndex];
          currentStepName = stepConfig?.popover?.title?.toString() || `step_${currentStepIndex}`;
          trackStepViewed(currentStepIndex, currentStepName);
        },
        onDestroyStarted: () => {
          const isComplete = currentStepIndex >= availableSteps.length - 1;
          
          if (isComplete) {
            trackTourCompleted(availableSteps.length);
          } else {
            trackTourAbandoned(currentStepIndex, currentStepName);
          }
          
          localStorage.setItem(TOUR_COMPLETED_KEY, 'true');
          setIsRunning(false);
          driverObj.destroy();
        },
        steps: availableSteps,
      });

      currentDriverInstance = driverObj;
      driverObj.drive();
    }
  }, [t, trackStepViewed, trackTourCompleted, trackTourAbandoned]);

  // Public startTour - handles navigation (manual start from menu)
  const startTour = useCallback(() => {
    trackTourStarted(false); // auto_start = false (manual)
    if (location.pathname !== '/tavern') {
      navigate('/tavern');
      setTimeout(() => {
        startTourInternal(true);
      }, 500);
    } else {
      startTourInternal(true);
    }
  }, [location.pathname, navigate, startTourInternal, trackTourStarted]);

  const resetTour = useCallback(() => {
    localStorage.removeItem(TOUR_COMPLETED_KEY);
    localStorage.removeItem(TOUR_SKIPPED_KEY);
  }, []);

  return {
    startTour,
    resetTour,
    hasCompletedTour,
    isRunning,
    // Auto-start for new users
    showAutoStartPrompt,
    confirmAutoStart,
    skipTour,
  };
}
