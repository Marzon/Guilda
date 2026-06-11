import { useState, useCallback } from 'react';
import { driver, DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useLanguage } from './useLanguage';
import { useNavigate, useLocation } from 'react-router-dom';

const TOUR_COMPLETED_KEY = 'guilda_investor_tour_completed';

// Store driver instance outside component to avoid ref issues
let currentDriverInstance: ReturnType<typeof driver> | null = null;

export function useInvestorTour() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [isRunning, setIsRunning] = useState(false);

  const hasCompletedTour = localStorage.getItem(TOUR_COMPLETED_KEY) === 'true';

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

  // Helper to close the deal sheet
  const closeDealSheet = () => {
    const closeButton = document.querySelector('[data-tour="deal-sheet"] button[class*="absolute"]') as HTMLButtonElement;
    if (closeButton) {
      closeButton.click();
    } else {
      // Try to find overlay and click it
      const overlay = document.querySelector('[data-vaul-overlay]') as HTMLElement;
      if (overlay) {
        overlay.click();
      }
    }
  };

  const startTour = useCallback(() => {
    // If not on /capital page, navigate there first
    if (location.pathname !== '/capital') {
      navigate('/capital');
      setTimeout(() => {
        initializeTour();
      }, 500);
    } else {
      initializeTour();
    }

    async function initializeTour() {
      setIsRunning(true);
      
      // Detect mobile at runtime to avoid hook issues
      const isMobile = window.innerWidth < 768;
      // Common steps (work on both devices)
      const commonSteps: DriveStep[] = [
        // Step 1: Hero Stats
        {
          element: '[data-tour="hero-stats"]',
          popover: {
            title: t('investorTour.welcome.title', 'Bem-vindo ao Capital!'),
            description: t('investorTour.welcome.description',
              'Aqui você encontra founders e startups buscando investimento.'),
            side: 'bottom',
            align: 'center',
          },
        },
        // Step 2: Filters
        {
          element: '[data-tour="filters"]',
          popover: {
            title: t('investorTour.filters.title', 'Filtre Founders'),
            description: t('investorTour.filters.description',
              'Use os filtros para encontrar startups por estágio, arquétipo, status online e mais.'),
            side: 'bottom',
            align: 'center',
          },
        },
        // Step 3: Pipeline
        {
          element: '[data-tour="pipeline"]',
          popover: {
            title: t('investorTour.pipeline.title', 'Seu Pipeline'),
            description: t('investorTour.pipeline.description',
              'Acompanhe métricas como taxa de conversão, deals ativos e tempo médio de fechamento.'),
            side: 'bottom',
            align: 'center',
          },
        },
        // Step 4: Founder Card
        {
          element: '[data-tour="founder-card"]',
          popover: {
            title: t('investorTour.founderCard.title', 'Cards de Founders'),
            description: t('investorTour.founderCard.description',
              'Cada card mostra um founder, sua startup e se está buscando capital. Clique para salvar no pipeline.'),
            side: 'top',
            align: 'center',
          },
        },
        // Step 5: Quick Tags (only if deal is saved and tags visible)
        {
          element: '[data-tour="quick-tags"]:not(.hidden)',
          popover: {
            title: t('investorTour.tags.title', 'Tags Rápidas'),
            description: t('investorTour.tags.description',
              'Classifique deals rapidamente: Lead, Contato, Docs, Analisando, Fechado ou Passou.'),
            side: 'top',
            align: 'center',
          },
        },
        // Step 6: Details Button - targets the button directly
        {
          element: '[data-tour="deal-details"]',
          popover: {
            title: t('investorTour.dealDetails.title', 'Salvar no Pipeline'),
            description: t('investorTour.dealDetails.description',
              'Clique para salvar o founder no seu pipeline. Depois de salvar, você poderá adicionar notas e tags.'),
            side: 'top',
            align: 'center',
            onNextClick: async () => {
              // Find the button with data-tour="deal-details" - it's on the button directly now
              const detailsBtn = document.querySelector('[data-tour="deal-details"]') as HTMLButtonElement;
              if (detailsBtn) {
                detailsBtn.click();
                // Wait for sheet to open (only if it's the details button opening a sheet)
                const sheet = await waitForElement('[data-tour="deal-sheet"]', 1500);
                if (sheet) {
                  await new Promise(resolve => setTimeout(resolve, 300));
                }
              }
              currentDriverInstance?.moveNext();
            },
          },
        },
        // Step 7: Deal Sheet Content
        {
          element: '[data-tour="deal-sheet"]',
          popover: {
            title: t('investorTour.dealSheet.title', 'Painel de Detalhes'),
            description: t('investorTour.dealSheet.description',
              'Aqui você gerencia tags, prioridade, adiciona notas e acompanha o histórico do deal.'),
            side: 'left',
            align: 'center',
          },
        },
        // Step 8: View Profile/Startup Buttons
        {
          element: '[data-tour="deal-actions"]',
          popover: {
            title: t('investorTour.dealActions.title', 'Ações Rápidas'),
            description: t('investorTour.dealActions.description',
              'Acesse o perfil completo do founder ou veja detalhes da startup diretamente daqui.'),
            side: 'top',
            align: 'center',
            onNextClick: () => {
              // Close the sheet before moving to navigation steps
              closeDealSheet();
              setTimeout(() => {
                currentDriverInstance?.moveNext();
              }, 300);
            },
          },
        },
      ];

      // Desktop navigation steps (InternalNavbar - top navbar)
      const desktopNavSteps: DriveStep[] = [
        {
          element: 'header [data-tour="nav-startups"]',
          popover: {
            title: t('investorTour.navStartups.title', 'Startups'),
            description: t('investorTour.navStartups.description',
              'Explore todas as startups cadastradas, veja detalhes e vagas em aberto.'),
            side: 'bottom',
            align: 'center',
          },
        },
        {
          element: 'header [data-tour="nav-tools"]',
          popover: {
            title: t('investorTour.navTools.title', 'Ferramentas'),
            description: t('investorTour.navTools.description',
              'Acesse calculadoras, geradores e outras ferramentas úteis para análise de deals.'),
            side: 'bottom',
            align: 'center',
          },
        },
        {
          element: 'header [data-tour="nav-notifications"]',
          popover: {
            title: t('investorTour.navNotifications.title', 'Mensagens'),
            description: t('investorTour.navNotifications.description',
              'Receba alertas quando founders responderem ou novos deals surgirem.'),
            side: 'bottom',
            align: 'center',
          },
        },
        {
          element: 'header [data-tour="nav-jobs"]',
          popover: {
            title: t('investorTour.navJobs.title', 'Vagas'),
            description: t('investorTour.navJobs.description',
              'Veja vagas de co-founder em startups buscando time.'),
            side: 'bottom',
            align: 'center',
          },
        },
      ];

      // Mobile navigation steps (BottomTabBar - bottom bar)
      const mobileNavSteps: DriveStep[] = [
        {
          element: 'nav.fixed.bottom-0 [data-tour="nav-capital"]',
          popover: {
            title: t('investorTour.navCapital.title', 'Capital'),
            description: t('investorTour.navCapital.description',
              'Você está aqui! Volte a qualquer momento para ver founders buscando investimento.'),
            side: 'top',
            align: 'center',
          },
        },
        {
          element: 'nav.fixed.bottom-0 [data-tour="nav-startups"]',
          popover: {
            title: t('investorTour.navStartups.title', 'Startups'),
            description: t('investorTour.navStartups.description',
              'Explore todas as startups cadastradas, veja detalhes e vagas em aberto.'),
            side: 'top',
            align: 'center',
          },
        },
        {
          element: 'nav.fixed.bottom-0 [data-tour="nav-tools"]',
          popover: {
            title: t('investorTour.navTools.title', 'Ferramentas'),
            description: t('investorTour.navTools.description',
              'Acesse calculadoras, geradores e outras ferramentas úteis para análise de deals.'),
            side: 'top',
            align: 'center',
          },
        },
        {
          element: 'nav.fixed.bottom-0 [data-tour="nav-notifications"]',
          popover: {
            title: t('investorTour.navNotifications.title', 'Notificações'),
            description: t('investorTour.navNotifications.description',
              'Receba alertas quando founders responderem ou novos deals surgirem.'),
            side: 'top',
            align: 'center',
          },
        },
        {
          element: 'nav.fixed.bottom-0 [data-tour="nav-jobs"]',
          popover: {
            title: t('investorTour.navJobs.title', 'Vagas'),
            description: t('investorTour.navJobs.description',
              'Veja vagas de co-founder em startups buscando time.'),
            side: 'top',
            align: 'center',
          },
        },
      ];

      // Combine steps based on device
      const allSteps: DriveStep[] = [
        ...commonSteps,
        ...(isMobile ? mobileNavSteps : desktopNavSteps),
      ];

      // Filter out steps where the element doesn't exist (except for sheet steps that appear later)
      const sheetSteps = ['[data-tour="deal-sheet"]', '[data-tour="deal-actions"]'];
      const availableSteps = allSteps.filter(step => {
        if (typeof step.element === 'string') {
          // Skip existence check for sheet steps - they'll appear after button click
          if (sheetSteps.includes(step.element)) {
            return true;
          }
          return document.querySelector(step.element) !== null;
        }
        return true;
      });

      // If there are few steps, add a generic closing one
      if (availableSteps.length < 3) {
        availableSteps.push({
          popover: {
            title: t('investorTour.getStarted.title', 'Comece a explorar!'),
            description: t('investorTour.getStarted.description',
              'Navegue pelos founders e salve os mais promissores no seu pipeline para acompanhar.'),
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
        popoverClass: 'investor-tour-popover',
        nextBtnText: t('investorTour.next', 'Próximo'),
        prevBtnText: t('investorTour.prev', 'Anterior'),
        doneBtnText: t('investorTour.done', 'Entendi!'),
        onDestroyStarted: () => {
          // Ensure sheet is closed when tour ends
          closeDealSheet();
          localStorage.setItem(TOUR_COMPLETED_KEY, 'true');
          setIsRunning(false);
          driverObj.destroy();
        },
        steps: availableSteps,
      });

      currentDriverInstance = driverObj;
      driverObj.drive();
    }
  }, [t, navigate, location.pathname]);

  const resetTour = useCallback(() => {
    localStorage.removeItem(TOUR_COMPLETED_KEY);
  }, []);

  return {
    startTour,
    resetTour,
    hasCompletedTour,
    isRunning,
  };
}
