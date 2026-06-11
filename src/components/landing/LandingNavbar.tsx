import { useState, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useAuth } from "@/hooks/useAuth";
import { PWA_INSTALL_URL } from "@/lib/constants";
import iconPurple from "@/assets/logos/icon-purple.svg";

export const LandingNavbar = memo(function LandingNavbar() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: authData } = useAuth();

  const handleInstallClick = useCallback(() => {
    window.location.href = PWA_INSTALL_URL;
  }, []);

  const handleNavClick = useCallback((href: string, isRoute?: boolean) => {
    setMobileMenuOpen(false);
    if (isRoute) {
      navigate(href);
    } else if (href.startsWith('/#')) {
      if (window.location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
          const element = document.querySelector(href.replace('/', ''));
          element?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        const element = document.querySelector(href.replace('/', ''));
        element?.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      const element = document.querySelector(href);
      element?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [navigate]);

  const handleLogoClick = useCallback(() => {
    if (authData?.user) {
      const isInvestor = authData.profile?.archetype === 'INVESTOR';
      navigate(isInvestor ? "/capital" : "/tavern");
    } else {
      navigate("/");
    }
  }, [navigate, authData]);

  const handleLoginClick = useCallback(() => {
    setMobileMenuOpen(false);
    navigate("/auth");
  }, [navigate]);

  const handleSignupClick = useCallback(() => {
    setMobileMenuOpen(false);
    navigate("/auth?view=signup");
  }, [navigate]);

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(prev => !prev);
  }, []);

  // Mobile menu links
  const mobileLinks = [
    { href: "/#como-funciona", label: t('landing.nav.howItWorks', 'Como Funciona'), isRoute: false },
    { href: "/ferramentas-empreendedores/guilda-ia-mvp", label: "MVP Builder", isRoute: true },
    { href: "/startups", label: "Startups", isRoute: true },
    { href: "/aceleracao", label: t('landing.nav.acceleration', 'Aceleração'), isRoute: true },
    { href: "/vagas", label: t("nav.jobs", "Vagas"), isRoute: true },
    { href: "/builders", label: "Builders", isRoute: true },
    { href: "/sellers", label: "Sellers", isRoute: true },
    { href: "/starters", label: "Starters", isRoute: true },
    { href: "/investors", label: t('landing.nav.investors', 'Investidores'), isRoute: true },
    { href: "/blog", label: "Academy", isRoute: true },
    { href: "/tools", label: t('landing.nav.tools', 'Ferramentas'), isRoute: true },
  ];

  // Desktop dropdown links (secondary routes)
  const desktopDropdownLinks = [
    { href: "/startups", label: "Startups" },
    { href: "/ferramentas-empreendedores", label: "Ferramentas" },
    { href: "/vagas", label: "Vagas" },
    { href: "/blog", label: "Blog" },
    { href: "/success-stories", label: "Histórias" },
    { href: "/pricing", label: "Planos" },
  ];

  return (
    <nav className="fixed w-full z-[1000] bg-[#FFFBF7] shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
      <div className="max-w-7xl mx-auto px-6 xl:px-12">
        <div className="flex justify-between items-center h-16">
          
          {/* Left side - Logo + Nav Links + Hamburger */}
          <div className="flex items-center gap-8 flex-1">
            <div 
              className="flex items-center gap-2 cursor-pointer"
              onClick={handleLogoClick}
            >
              <img 
                src={iconPurple} 
                alt="Guilda" 
                className="w-7 h-7"
              />
              <span className="font-bold text-foreground">Guilda</span>
            </div>
            
            {/* Desktop Nav Links + Hamburger */}
            <div className="hidden md:flex items-center gap-8">
              <button
                onClick={() => handleNavClick("/#como-funciona", false)}
                className="text-sm font-medium text-[#0A0B24] hover:text-[#7610DC] transition-colors"
              >
                {t('landing.nav.howItWorks', 'Como Funciona')}
              </button>
              <button
                onClick={() => navigate("/ferramentas-empreendedores/guilda-ia-mvp")}
                className="text-sm font-medium text-[#0A0B24] hover:text-[#7610DC] transition-colors"
              >
                MVP Builder
              </button>
              
              {/* Desktop Hamburger Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="ml-4 text-[#0A0B24] hover:text-[#7610DC] transition-colors cursor-pointer"
                    aria-label="Menu"
                  >
                    <Menu className="w-6 h-6" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="center"
                  sideOffset={8}
                  className="min-w-[200px] bg-white border border-[#E5E7EB] rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.08)] py-2 z-50"
                >
                  {desktopDropdownLinks.map((link) => (
                    <DropdownMenuItem
                      key={link.href}
                      onClick={() => navigate(link.href)}
                      className="px-5 py-3 text-sm text-[#0A0B24] hover:bg-[#F5F5F5] cursor-pointer focus:bg-[#F5F5F5]"
                    >
                      {link.label}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuItem
                    onClick={handleInstallClick}
                    className="px-5 py-3 text-sm text-[#0A0B24] hover:bg-[#F5F5F5] cursor-pointer focus:bg-[#F5F5F5]"
                  >
                    Baixar App
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Right side - Actions (Desktop only) */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageSelector />
            
            {/* Botão Aceleração - Laranja destacado */}
            <Button
              onClick={() => navigate("/aceleracao")}
              className="bg-[#F97316] hover:bg-[#E5650F] text-white font-semibold text-sm rounded-lg px-5 py-2.5 transition-colors"
            >
              {t('landing.nav.acceleration', 'Aceleração')}
            </Button>
            
            {/* Botão Login - Outline */}
            <Button
              onClick={handleLoginClick}
              variant="outline"
              className="border-[#0A0B24] text-[#0A0B24] hover:bg-[#F5F5F5] font-medium text-sm rounded-lg px-5 py-2.5 transition-colors"
            >
              Login
            </Button>
            
            {/* Botão Criar Perfil - CTA Principal */}
            <Button
              onClick={handleSignupClick}
              className="bg-[#7610DC] hover:bg-[#4308B0] text-white font-semibold text-sm rounded-full px-5 py-2.5 shadow-lg shadow-primary/30 transition-all"
            >
              {t('landing.nav.createProfile', 'Criar Perfil Grátis')}
            </Button>
          </div>

          {/* Mobile Menu Icon */}
          <div className="md:hidden flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleInstallClick}
              className="text-muted-foreground hover:text-primary"
            >
              <Download className="w-5 h-5" />
            </Button>
            <LanguageSelector />
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileMenu}
              className="text-muted-foreground hover:text-primary"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {mobileLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href, link.isRoute)}
                className="block w-full text-left px-4 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-colors"
              >
                {link.label}
              </button>
            ))}
            <div className="flex flex-col gap-2 pt-2 px-4">
              <Button 
                variant="outline" 
                onClick={handleLoginClick}
                className="w-full"
              >
                Login
              </Button>
              <Button
                onClick={handleSignupClick}
                className="w-full"
              >
                {t('landing.nav.createProfile', 'Criar Perfil Grátis')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
});
