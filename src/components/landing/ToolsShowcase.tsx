import { useNavigate } from "react-router-dom";
import { PieChart, DollarSign, ChevronRight, ArrowRight, Code } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getLocalizedPath } from "@/lib/localizedRoutes";

export const ToolsShowcase = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const tools = [
    { icon: PieChart, title: t('landing.toolsShowcase.equityTitle'), description: t('landing.toolsShowcase.equityDesc'), cta: t('landing.toolsShowcase.equityCta'), path: "/tools/equity-calculator" },
    { icon: DollarSign, title: t('landing.toolsShowcase.valuationTitle'), description: t('landing.toolsShowcase.valuationDesc'), cta: t('landing.toolsShowcase.valuationCta'), path: "/tools/valuation-calculator" },
    { icon: Code, title: t('landing.toolsShowcase.vestingTitle'), description: t('landing.toolsShowcase.vestingDesc'), cta: t('landing.toolsShowcase.vestingCta'), path: "/tools/mvp-vibecoding" },
  ];

  return (
    <section id="ferramentas" className="py-12 sm:py-32 bg-white border-t border-black/5">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 sm:mb-16 gap-4 sm:gap-6">
          <div className="max-w-xl">
            <h2
              className="text-[1.75rem] sm:text-4xl md:text-5xl font-serif font-thin leading-[0.9] tracking-tight text-black mb-2 sm:mb-3"
              style={{ fontFamily: "'Merriweather', 'Georgia', serif" }}
            >
              {t('landing.toolsShowcase.title')}
            </h2>
            <p className="text-[13px] sm:text-[15px] text-gray-500 leading-relaxed">
              {t('landing.toolsShowcase.description')}
            </p>
          </div>
          <button onClick={() => navigate(getLocalizedPath("/tools", lang))} className="text-[#7610DC] font-medium flex items-center gap-1.5 hover:underline transition-colors whitespace-nowrap text-[13px] sm:text-sm">
            {t('landing.toolsShowcase.viewAll')} <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Desktop */}
        <div className="hidden sm:grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <div key={tool.path} onClick={() => navigate(tool.path)} className="bg-white rounded-2xl p-8 border border-black/10 hover:border-[#7610DC]/30 transition-colors duration-300 cursor-pointer group">
              <div className="mb-4"><tool.icon className="w-6 h-6 text-[#7610DC]" /></div>
              <h3 className="text-base font-semibold text-black">{tool.title}</h3>
              <p className="text-[15px] text-gray-500 mt-2 leading-relaxed">{tool.description}</p>
              <div className="flex items-center gap-1 text-sm font-medium text-[#7610DC] mt-4 group-hover:underline transition-colors">
                {tool.cta} <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>

        {/* Mobile */}
        <div className="sm:hidden grid grid-cols-3 gap-2">
          {tools.map((tool) => (
            <div key={tool.path} onClick={() => navigate(tool.path)} className="bg-white rounded-xl p-3 border border-black/10 cursor-pointer flex flex-col items-center justify-center text-center aspect-square">
              <tool.icon className="w-5 h-5 text-[#7610DC]" />
              <h3 className="text-[11px] font-bold text-black mt-2 leading-tight line-clamp-2">{tool.title}</h3>
              <span className="text-[10px] font-medium text-[#7610DC] mt-1.5">{tool.cta}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
