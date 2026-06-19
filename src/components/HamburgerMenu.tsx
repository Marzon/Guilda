import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { User, LogOut, FolderKanban, Shield, Smartphone, Menu, ChevronRight, X, Settings, Crown, Sparkles, Zap, Bell, HelpCircle, Map, Network } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useMatches } from "@/hooks/useMatches";
import { useMyProfileViewers } from "@/hooks/useMyProfileViewers";
import { useNotifications } from "@/hooks/useNotifications";
import { useInvestorTour } from "@/hooks/useInvestorTour";
import { useFounderTour } from "@/hooks/useFounderTour";
import { useAdminOrBatchManager } from "@/hooks/useIsAdmin";

import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface HamburgerMenuProps {
  isPremium: boolean;
  onLogout: () => void;
}

export const HamburgerMenu = ({ isPremium, onLogout }: HamburgerMenuProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: auth } = useAuth();
  const { matches } = useMatches(auth?.user?.id || null);
  const { data: viewersData } = useMyProfileViewers(auth?.user?.id || null, false);
  const { unreadCount: notificationCount } = useNotifications(auth?.user?.id);
  const viewerCount = viewersData?.count || 0;
  const pendingMatchesCount = matches?.filter(m => m.status === 'PENDING' && m.target_id === auth?.user?.id).length || 0;
  const { startTour: startInvestorTour, hasCompletedTour: hasCompletedInvestorTour } = useInvestorTour();
  const { startTour: startFounderTour, hasCompletedTour: hasCompletedFounderTour } = useFounderTour();
  
  const isInvestor = auth?.profile?.archetype === 'INVESTOR';
  
  // Use centralized admin/batch manager hook
  const { isAdmin, isBatchManager } = useAdminOrBatchManager();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAppInstalled, setIsAppInstalled] = useState(false);

  // Detect if app is installed as PWA
  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as any).standalone // iOS Safari
      || document.referrer.includes('android-app://'); // Android TWA
    
    setIsAppInstalled(isStandalone);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const userEmail = auth?.user?.email || '';
  const username = auth?.profile?.username || 'Usuário';
  const avatarUrl = auth?.profile?.avatar_url;

  const handleNavigate = (path: string) => {
    setMenuOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    setMenuOpen(false);
    onLogout();
  };

  // Navigation items removed - now handled by BottomTabBar

  // Settings items - order: Tour Investidor, FAQ, Quem Viu, Conexões, Candidaturas, Notificações, Editar Perfil, Configurações
  const settingsItems: Array<{
    action: () => void;
    icon: typeof Map;
    label: string;
    badge?: string | number;
    premium: boolean;
    pulse?: boolean;
    iconClassName?: string;
    labelClassName?: string;
  }> = [
    // For INVESTORS: show Investor Tour
    ...(isInvestor ? [{
      action: () => {
        setMenuOpen(false);
        startInvestorTour();
      },
      icon: Map,
      label: t("investorTour.menuLabel", "Tour do Investidor"),
      premium: false as const,
      pulse: !hasCompletedInvestorTour,
    }] : []),
    // For non-investors (BUILDER/SELLER): show Founder Tour
    ...(!isInvestor ? [{
      action: () => {
        setMenuOpen(false);
        startFounderTour();
      },
      icon: Map,
      label: t("founderTour.menuLabel", "Tour da Taverna"),
      premium: false as const,
      pulse: !hasCompletedFounderTour,
    }] : []),
    // FAQ - always visible with amber color
    {
      action: () => handleNavigate("/faq"),
      icon: HelpCircle,
      label: t("faq.menuLabel", "FAQ"),
      premium: false as const,
      iconClassName: "text-amber-500",
      labelClassName: "text-amber-600",
    },
    { 
      action: () => handleNavigate("/networking"),
      icon: Network, 
      label: t("networking.menuLabel", "Networking"),
      badge: (viewerCount + pendingMatchesCount) > 0 ? (viewerCount + pendingMatchesCount) : undefined,
      premium: true
    },
    // Hide applications for investors
    ...(auth?.profile?.archetype !== 'INVESTOR' ? [{ 
      action: () => handleNavigate("/vagas"), 
      icon: FolderKanban, 
      label: t("jobs.menuLabel", "Vagas"),
      premium: false
    }] : []),
    { 
      action: () => handleNavigate("/notifications"), 
      icon: Bell, 
      label: t("notifications.title") || "Notificações",
      badge: notificationCount > 0 ? notificationCount : undefined,
      premium: false
    },
    { 
      action: () => handleNavigate("/settings"), 
      icon: Settings, 
      label: t("settings.title") || "Configurações",
      premium: false
    },
  ];

  // Quick actions - hide "Instalar App" if already installed as PWA
  const canAccessAdmin = isAdmin || isBatchManager;
  const quickActions = [
    ...(!isAppInstalled ? [{ action: () => handleNavigate("/install"), icon: Smartphone, label: "Instalar App", premium: true }] : []),
    ...(canAccessAdmin ? [{ action: () => handleNavigate("/admin"), icon: Shield, label: isAdmin ? "Admin" : "Gerenciar Turmas", premium: false }] : []),
  ];

  return (
    <>
      <Button 
        variant="outline" 
        size="icon" 
        onClick={() => setMenuOpen(true)}
        className="h-12 w-12 sm:h-9 sm:w-9 rounded-full bg-white border-slate-200 hover:bg-slate-100"
      >
        <Menu className="w-7 h-7 sm:w-4 sm:h-4" />
      </Button>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="right" className="w-full max-w-[100vw] sm:max-w-sm p-0 bg-background border-l border-border flex flex-col h-[100dvh] max-h-[100dvh] overflow-x-hidden">
          <VisuallyHidden>
            <SheetTitle>Menu</SheetTitle>
          </VisuallyHidden>
          
          {/* Main Menu View */}
          <div className="flex flex-col h-full">
              {/* Enhanced Header with Large Avatar */}
              <div className="p-6 border-b border-border bg-background">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-5 min-w-0 flex-1">
                    {/* Avatar with gradient border */}
                    <div className="relative shrink-0 group">
                      <div className="absolute -inset-0.5 bg-gradient-to-br from-primary to-amber-400 rounded-[18px] opacity-70 blur-sm group-hover:opacity-100 transition duration-300" />
                      {avatarUrl ? (
                        <img 
                          src={avatarUrl} 
                          alt={username} 
                          className="relative w-20 h-20 rounded-2xl object-cover border-2 border-background shadow-lg" 
                        />
                      ) : (
                        <div className="relative w-20 h-20 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xl border-2 border-background shadow-lg">
                          {username?.[0]?.toUpperCase() || "U"}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1 flex flex-col">
                      <p className="text-xl font-bold text-foreground leading-tight truncate">{username}</p>
                      <span className="inline-flex items-center gap-1 mt-2 bg-green-50 dark:bg-green-900/20 text-green-600 text-xs font-bold px-2.5 py-1 rounded-full border border-green-100 dark:border-green-800/50 w-fit">
                        <Crown className="w-3.5 h-3.5" />
                        {t('premium') || 'GRATUITO'}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setMenuOpen(false)} 
                    className="shrink-0 text-muted-foreground hover:text-foreground transition p-1 hover:bg-muted rounded-lg -mr-2 -mt-2"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>




              {/* Menu Items - Enhanced spacing and icons */}
              <div className="flex-1 overflow-y-auto py-2 min-h-0">
                {settingsItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={index}
                      onClick={item.action}
                      className={`w-full px-5 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors group ${
                        item.pulse ? 'animate-pulse-glow bg-primary/5 rounded-lg mx-2' : ''
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={item.pulse ? 'relative' : ''}>
                          <Icon className={`w-[22px] h-[22px] ${item.iconClassName ? item.iconClassName : item.pulse ? 'text-primary' : item.premium ? "text-primary" : "text-muted-foreground"}`} />
                          {item.pulse && (
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-ping" />
                          )}
                        </div>
                        <span className={`text-[15px] font-medium ${item.labelClassName ? item.labelClassName : item.pulse ? 'text-primary' : 'text-foreground'}`}>{item.label}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {item.badge && (typeof item.badge === 'string' || item.badge > 0) && (
                          <span className="bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                            {item.badge}
                          </span>
                        )}
                        <ChevronRight className="w-5 h-5 text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors" />
                      </div>
                    </button>
                  );
                })}
                
                {/* Quick actions with same style */}
                {quickActions.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={`quick-${index}`}
                      onClick={item.action}
                      className="w-full px-5 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <Icon className="w-[22px] h-[22px] text-muted-foreground" />
                        <span className="text-[15px] font-medium text-foreground">{item.label}</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors" />
                    </button>
                  );
                })}
              </div>

              {/* Logout - Enhanced with subtle background */}
              <div className="p-4 pb-safe border-t border-border bg-muted/30 mt-auto shrink-0">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 text-destructive font-medium py-2.5 hover:bg-destructive/10 rounded-xl transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  {t("tavern.logout")}
                </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
