import { useState, useCallback, memo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "@/components/LanguageSelector";
import { CORE_APP_URL } from "@/lib/constants";
import { buildCoreAppUrl } from "@/lib/url-utils";
import iconPurple from "@/assets/logos/icon-purple.svg";

export const LandingDarkNavbar = memo(function LandingDarkNavbar() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = useCallback((href: string, isRoute?: boolean) => {
    setMobileMenuOpen(false);
    if (isRoute) {
      navigate(href);
    } else if (href.startsWith("/#")) {
      const el = document.querySelector(href.replace("/", ""));
      el?.scrollIntoView({ behavior: "smooth" });
    }
  }, [navigate]);

  const handleLogin = useCallback(() => {
    setMobileMenuOpen(false);
    window.location.href = "https://suprema.guilda.app.br/pro";
  }, []);

  const handleSignup = useCallback(() => {
    setMobileMenuOpen(false);
    window.location.href = "https://suprema.guilda.app.br/pro";
  }, []);

  const desktopLinks = [
    { href: "/#como-funciona", label: t("landing.nav.howItWorks", "Como Funciona"), isRoute: false },
    { href: "/quiz-empreendedor", label: "Que tipo de empreendedor é você?", isRoute: true },
    { href: "/ferramentas-empreendedores/guilda-ia-mvp", label: "MVP Builder", isRoute: true },
    { href: "/startups", label: "Startups", isRoute: true },
    { href: "/blog", label: "Blog", isRoute: true },
  ];

  const mobileLinks = [
    ...desktopLinks,
    { href: "/aceleracao", label: t("landing.nav.acceleration", "Aceleração"), isRoute: true },
    { href: "/vagas", label: t("nav.jobs", "Vagas"), isRoute: true },
    { href: "/success-stories", label: "Histórias", isRoute: true },
    { href: "/", label: "Início", isRoute: true },
  ];

  return (
    <nav className="fixed w-full z-50 bg-white border-b border-black/5 h-12 sm:h-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-12 sm:h-14">
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <img src={iconPurple} alt="Guilda" className="w-6 h-6 sm:w-7 sm:h-7" />
            <span className="font-bold text-black text-lg">Guilda</span>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {desktopLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href, link.isRoute)}
                className="text-sm font-medium text-gray-500 hover:text-black transition-colors"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageSelector />
            <button
              onClick={handleLogin}
              className="text-sm font-medium text-gray-500 hover:text-black transition-colors px-4 py-2"
            >
              Login
            </button>
            <Button
              onClick={handleSignup}
              className="bg-[#7610DC] hover:bg-[#7610DC]/90 text-white font-semibold text-sm rounded-xl px-5 py-2.5 transition-colors"
            >
              {t('landing.nav.createProfile')}
            </Button>
          </div>

          {/* Mobile */}
          <div className="md:hidden flex items-center gap-2">
            <LanguageSelector />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen((p) => !p)}
              className="text-gray-500 hover:text-black"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-6 pt-2 space-y-1 bg-white rounded-b-xl -mx-4 px-4 border-b border-black/10">
            {mobileLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href, link.isRoute)}
                className="block w-full text-left px-4 py-3 text-gray-500 hover:text-black hover:bg-gray-50 rounded-lg transition-colors text-sm"
              >
                {link.label}
              </button>
            ))}
            <div className="flex flex-col gap-2 pt-3 px-4">
              <Button
                variant="outline"
                onClick={handleLogin}
                className="w-full border-gray-200 text-black hover:bg-gray-50 bg-transparent rounded-xl"
              >
                Login
              </Button>
              <Button
                onClick={handleSignup}
                className="w-full bg-[#7610DC] hover:bg-[#7610DC]/90 text-white font-semibold rounded-xl"
              >
                {t('landing.nav.createProfile')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
});
