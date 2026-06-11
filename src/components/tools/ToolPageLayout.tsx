import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { LucideIcon, Wrench, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LandingDarkNavbar } from '@/components/landing/LandingDarkNavbar';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { InternalNavbar } from '@/components/InternalNavbar';
import { useAuth } from '@/hooks/useAuth';
import { useLogout } from '@/hooks/useLogout';
import { ToolHelpTooltip } from './ToolHelpTooltip';
import { SocialPaymentBanner } from "@/components/monetization/SocialPaymentBanner";

interface ToolPageLayoutProps {
  children: ReactNode;
  toolId: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
}

export const ToolPageLayout = ({ 
  children, 
  toolId, 
  icon: Icon,
  iconColor = 'text-[#7610DC]',
  iconBgColor = 'bg-[#7610DC]/10'
}: ToolPageLayoutProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: authData, isLoading } = useAuth();
  const { logout } = useLogout();
  
  const isLoggedIn = !!authData?.user;

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.history.length > 2 && document.referrer.includes(window.location.origin)) {
      navigate(-1);
    } else {
      navigate('/tools');
    }
  };

  return (
    <div className="min-h-screen bg-white text-black antialiased selection:bg-[#7610DC]/20 flex flex-col overflow-x-hidden">
      {isLoggedIn ? (
        <InternalNavbar
          userId={authData?.user?.id}
          username={authData?.profile?.username}
          avatarUrl={authData?.profile?.avatar_url}
          isPremium={authData?.subscription?.is_premium || false}
          onLogout={logout}
          showSearch={false}
          title={t(`tools.${toolId}.title`)}
          archetype={authData?.profile?.archetype}
        />
      ) : (
        <LandingDarkNavbar />
      )}
      <SocialPaymentBanner />

      {/* Hero Section — flat, white bg */}
      <header className={`${isLoggedIn ? 'pt-20 sm:pt-24' : 'pt-24 sm:pt-32'} pb-12 sm:pb-16 border-b border-black/5`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Back Button */}
          {isLoggedIn && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="mb-4 text-gray-500 hover:text-[#7610DC] -ml-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('common.back', 'Voltar')}
            </Button>
          )}

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 border border-black/10 px-3 py-1 rounded-full text-xs font-semibold text-[#F97316] mb-4">
              <Wrench className="w-3 h-3 flex-shrink-0" />
              {t('tools.hero.badge', '100% Gratuito para Comunidade')}
            </div>
            
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ${iconBgColor} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-7 h-7 sm:w-8 sm:h-8 ${iconColor}`} />
              </div>
              <div className="flex items-center gap-3 min-w-0">
                <h1
                  className="text-[1.75rem] sm:text-3xl md:text-4xl lg:text-5xl font-serif font-thin leading-[0.9] tracking-tight text-black"
                  style={{ fontFamily: "'Merriweather', 'Georgia', serif" }}
                >
                  {t(`tools.${toolId}.title`)}
                </h1>
                <ToolHelpTooltip toolId={toolId} />
              </div>
            </div>
            
            <p className="text-base sm:text-lg text-gray-500 leading-relaxed max-w-2xl">
              {t(`tools.${toolId}.description`)}
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      <LandingFooter />
    </div>
  );
};
