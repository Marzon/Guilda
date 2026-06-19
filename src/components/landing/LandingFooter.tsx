import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getLocalizedPath } from "@/lib/localizedRoutes";
import { PWA_INSTALL_URL } from "@/lib/constants";
import iconPurple from "@/assets/logos/icon-purple.svg";

export const LandingFooter = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const columns = [
    {
      title: t('landing.footer.col.product', 'Produto'),
      links: [
        { label: t('landing.footer.plans', 'Planos'), path: "/" },
        { label: t('nav.jobs', 'Vagas'), path: "/vagas" },
        { label: "Startups", path: "/startups" },
        { label: "Manifesto", path: "/manifesto" },
      ],
    },
    {
      title: t('landing.footer.col.resources', 'Recursos'),
      links: [
        { label: t('landing.footer.tools', 'Ferramentas'), path: getLocalizedPath("/tools", lang) },
        { label: "Blog", path: "/blog" },
        { label: t('landing.footer.successStories', 'Histórias'), path: "/success-stories" },
        { label: t('pwa.downloadApp', 'Baixar App'), path: "https://play.google.com/store/apps/details?id=com.theguilda.app", isExternal: true },
      ],
    },
    {
      title: t('landing.footer.col.archetypes', 'Arquétipos'),
      links: [
        { label: "Builders", path: "/builders" },
        { label: "Sellers", path: "/sellers" },
        { label: "Starters", path: "/starters" },
        { label: t('landing.footer.investors', 'Investidores'), path: "/investors" },
      ],
    },
    {
      title: t('landing.footer.col.legal', 'Legal'),
      links: [
        { label: t('landing.footer.privacy', 'Privacidade'), path: "/privacy" },
        { label: t('landing.footer.terms', 'Termos'), path: "/terms" },
      ],
    },
  ];

  const SocialIcons = () => (
    <div className="flex items-center gap-3">
      <a href="https://www.linkedin.com/company/guilda-app-br" target="_blank" rel="noopener noreferrer" className="text-[hsl(0,0%,55%)] hover:text-primary transition-colors" aria-label="LinkedIn">
        <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
      </a>
      <a href="https://www.instagram.com/guilda.app.br" target="_blank" rel="noopener noreferrer" className="text-[hsl(0,0%,55%)] hover:text-primary transition-colors" aria-label="Instagram">
        <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
      </a>
    </div>
  );

  return (
    <footer className="dark-cta-section border-t border-[hsl(268,89%,46%,0.15)] max-md:border-t-0 py-16 sm:py-20 max-md:py-6 max-md:px-4">
      <div className="max-w-7xl mx-auto px-4 max-md:px-0">

        {/* Mobile: Logo row with social icons */}
        <div className="md:hidden flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <img src={iconPurple} alt="Guilda" className="w-5 h-5 brightness-150" />
            <span className="font-bold text-[hsl(0,0%,98%)] text-sm">Guilda</span>
            <span className="hidden text-[11px] text-[hsl(0,0%,50%)] ml-1">
              {t('landing.footer.tagline', 'Onde empreendedores se encontram para construir o futuro.')}
            </span>
          </div>
          <SocialIcons />
        </div>

        {/* Mobile: 2-col compact grid */}
        <div className="md:hidden grid grid-cols-2 gap-x-6 gap-y-3">
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="font-bold text-[11px] uppercase tracking-[0.5px] text-[hsl(0,0%,85%)] mb-1">{col.title}</h4>
              <ul>
                {col.links.map((link) => (
                  <li key={link.path} className="leading-[1.5]">
                    {link.isExternal ? (
                      <a href={link.path} target="_blank" rel="noopener noreferrer" className="text-[11px] text-[rgba(255,255,255,0.6)] hover:text-primary transition-colors">
                        {link.label}
                      </a>
                    ) : (
                      <button onClick={() => navigate(link.path)} className="text-[11px] text-[rgba(255,255,255,0.6)] hover:text-primary transition-colors">
                        {link.label}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Mobile: Bottom bar */}
        <div className="md:hidden mt-4 pt-3 border-t border-[hsl(0,0%,100%,0.08)] text-[10px] text-[hsl(0,0%,45%)]">
          © 2025 Guilda Inc. {t('landing.footer.madeBy', 'Feito por Builders.')}
        </div>

        {/* Desktop layout */}
        <div className="hidden md:block">
          <div className="flex gap-12">
            {/* Left: Logo + tagline */}
            <div className="w-[30%] shrink-0">
              <div className="flex items-center gap-2 cursor-pointer mb-3" onClick={() => navigate("/")}>
                <img src={iconPurple} alt="Guilda" className="w-7 h-7 brightness-150" />
                <span className="font-bold text-[hsl(0,0%,98%)]">Guilda</span>
              </div>
              <p className="text-[13px] text-[rgba(255,255,255,0.5)] leading-relaxed max-w-[250px]">
                {t('landing.footer.tagline', 'Onde empreendedores se encontram para construir o futuro.')}
              </p>
            </div>
            {/* Right: 5-col links */}
            <div className="flex-1 grid grid-cols-5 gap-8">
              {columns.map((col) => (
                <div key={col.title}>
                  <h4 className="font-semibold text-sm text-[hsl(0,0%,85%)] mb-4">{col.title}</h4>
                  <ul className="space-y-3">
                    {col.links.map((link) => (
                      <li key={link.path}>
                        {link.isExternal ? (
                          <a href={link.path} target="_blank" rel="noopener noreferrer" className="text-sm text-[hsl(0,0%,55%)] hover:text-primary transition-colors">
                            {link.label}
                          </a>
                        ) : (
                          <button onClick={() => navigate(link.path)} className="text-sm text-[hsl(0,0%,55%)] hover:text-primary transition-colors">
                            {link.label}
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <div>
                <h4 className="font-semibold text-sm text-[hsl(0,0%,85%)] mb-4">{t('landing.footer.col.community', 'Comunidade')}</h4>
                <ul className="space-y-3">
                  <li><a href="https://www.linkedin.com/company/guilda-app-br" target="_blank" rel="noopener noreferrer" className="text-sm text-[hsl(0,0%,55%)] hover:text-primary transition-colors">LinkedIn</a></li>
                  <li><a href="https://www.instagram.com/guilda.app.br" target="_blank" rel="noopener noreferrer" className="text-sm text-[hsl(0,0%,55%)] hover:text-primary transition-colors">Instagram</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-6 border-t border-[hsl(0,0%,100%,0.08)] text-sm text-[hsl(0,0%,45%)]">
            © 2025 Guilda Inc. {t('landing.footer.madeBy', 'Feito por Builders.')}
          </div>
        </div>
      </div>
    </footer>
  );
};
