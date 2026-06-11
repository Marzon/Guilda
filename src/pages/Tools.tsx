import { useState, useMemo, useCallback, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Calculator, TrendingDown, FileText, HelpCircle, DollarSign, 
  TrendingUp, PieChart, Scissors, LayoutGrid, Target, Users, Grid3X3, 
  BookOpen, Shield, UserPlus, FolderOpen, Sparkles, Flame,
  ArrowRight, Percent, Scale, Rocket, Wrench, Table, CheckCircle,
  LucideIcon, CreditCard, Activity, ClipboardCheck, ShoppingBag, Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TabsContent } from '@/components/ui/tabs';
import { LandingDarkNavbar } from '@/components/landing/LandingDarkNavbar';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { InternalNavbar } from '@/components/InternalNavbar';
import { usePlatformStats } from '@/hooks/usePlatformStats';
import { useAuth } from '@/hooks/useAuth';
import { useLogout } from '@/hooks/useLogout';
import { useMyProjects } from '@/hooks/useMyProjects';
import { SocialPaymentBanner } from "@/components/monetization/SocialPaymentBanner";
import { RecommendationsTab } from '@/components/tools/RecommendationsTab';
import { ToolsTabs } from '@/components/tools/ToolsTabs';
import type { Archetype } from '@/types/archetype';

// ==========================================
// CONSTANTS
// ==========================================

interface Category {
  id: string;
  icon: LucideIcon;
}

interface Tool {
  id: string;
  icon: LucideIcon;
  path: string;
  category: string;
  featured: boolean;
  isNew: boolean;
}

interface SecondaryTool {
  id: string;
  icon: LucideIcon;
  type: string;
  path: string;
}

const CATEGORIES: Category[] = [
  { id: 'all', icon: LayoutGrid },
  { id: 'sales', icon: ShoppingBag },
  { id: 'financial', icon: PieChart },
  { id: 'legal', icon: Scale },
  { id: 'team', icon: Users },
  { id: 'growth', icon: Rocket },
];

const TOOLS: Tool[] = [
  { id: 'cold-outreach', icon: Send, path: '/tools/cold-outreach', category: 'sales', featured: true, isNew: true },
  { id: 'guilda-ia-mvp', icon: Sparkles, path: '/tools/guilda-ia-mvp', category: 'growth', featured: true, isNew: true },
  { id: 'knowledge-roadmap', icon: BookOpen, path: '/tools/knowledge-roadmap', category: 'growth', featured: true, isNew: true },
  { id: 'mvp-vibecoding', icon: Sparkles, path: '/tools/mvp-vibecoding', category: 'growth', featured: false, isNew: true },
  { id: 'markup-calculator', icon: Calculator, path: '/tools/markup-calculator', category: 'sales', featured: true, isNew: true },
  { id: 'card-fee-simulator', icon: CreditCard, path: '/tools/card-fee-simulator', category: 'sales', featured: false, isNew: true },
  { id: 'business-health-quiz', icon: Activity, path: '/tools/business-health-quiz', category: 'sales', featured: true, isNew: true },
  { id: 'breakeven-calculator', icon: TrendingUp, path: '/tools/breakeven-calculator', category: 'financial', featured: false, isNew: true },
  { id: 'roi-calculator', icon: Target, path: '/tools/roi-calculator', category: 'financial', featured: false, isNew: true },
  { id: 'proposal-generator', icon: FileText, path: '/tools/proposal-generator', category: 'sales', featured: false, isNew: true },
  { id: 'company-opening-checklist', icon: ClipboardCheck, path: '/tools/company-opening-checklist', category: 'legal', featured: false, isNew: true },
  { id: 'equity-calculator', icon: Percent, path: '/tools/equity-calculator', category: 'team', featured: true, isNew: false },
  { id: 'valuation-calculator', icon: DollarSign, path: '/tools/valuation-calculator', category: 'financial', featured: true, isNew: false },
  { id: 'contract-generator', icon: FileText, path: '/tools/contract-generator', category: 'legal', featured: false, isNew: false },
  { id: 'runway-calculator', icon: TrendingDown, path: '/tools/runway-calculator', category: 'financial', featured: false, isNew: false },
  { id: 'unit-economics', icon: Calculator, path: '/tools/unit-economics', category: 'financial', featured: false, isNew: false },
  { id: 'cap-table', icon: PieChart, path: '/tools/cap-table', category: 'team', featured: false, isNew: false },
  { id: 'burn-rate-optimizer', icon: Scissors, path: '/tools/burn-rate-optimizer', category: 'financial', featured: false, isNew: false },
  { id: 'archetype-quiz', icon: HelpCircle, path: '/tools/archetype-quiz', category: 'team', featured: false, isNew: false },
  { id: 'business-model', icon: LayoutGrid, path: '/tools/business-model', category: 'growth', featured: false, isNew: false },
  { id: 'tam-sam-som', icon: Target, path: '/tools/tam-sam-som', category: 'growth', featured: false, isNew: false },
  { id: 'empathy-map', icon: Users, path: '/tools/empathy-map', category: 'growth', featured: false, isNew: false },
  { id: 'swot', icon: Grid3X3, path: '/tools/swot', category: 'growth', featured: false, isNew: false },
  { id: 'customer-dev', icon: BookOpen, path: '/tools/customer-dev', category: 'growth', featured: false, isNew: false },
  { id: 'lgpd-guide', icon: Shield, path: '/tools/lgpd-guide', category: 'legal', featured: false, isNew: false },
  { id: 'recruiting-guide', icon: UserPlus, path: '/tools/recruiting-guide', category: 'team', featured: false, isNew: false },
  { id: 'dataroom-guide', icon: FolderOpen, path: '/tools/dataroom-guide', category: 'legal', featured: false, isNew: false },
];

const SECONDARY_TOOLS: SecondaryTool[] = [
  { id: 'contract-generator', icon: FileText, type: 'Template PDF', path: '/tools/contract-generator' },
  { id: 'cap-table', icon: Table, type: 'Planilha', path: '/tools/cap-table' },
  { id: 'recruiting-guide', icon: UserPlus, type: 'Framework', path: '/tools/recruiting-guide' },
  { id: 'dataroom-guide', icon: FolderOpen, type: 'Checklist', path: '/tools/dataroom-guide' },
];

// ==========================================
// MEMOIZED SUB-COMPONENTS
// ==========================================

interface CategoryButtonProps {
  category: Category;
  isActive: boolean;
  onClick: (id: string) => void;
  label: string;
}

const CategoryButton = memo(function CategoryButton({ category, isActive, onClick, label }: CategoryButtonProps) {
  const Icon = category.icon;
  const handleClick = useCallback(() => onClick(category.id), [onClick, category.id]);

  return (
    <button
      onClick={handleClick}
      className={`flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-sm font-medium transition-colors whitespace-nowrap ${
        isActive 
          ? 'bg-[#7610DC] text-white' 
          : 'bg-white border border-gray-200 text-gray-500 hover:border-[#7610DC]/30 hover:text-[#7610DC]'
      }`}
    >
      <Icon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
      {label}
    </button>
  );
});

interface FeaturedToolCardProps {
  tool: Tool;
  onNavigate: (path: string) => void;
  title: string;
  description: string;
  cta: string;
}

const FeaturedToolCard = memo(function FeaturedToolCard({ tool, onNavigate, title, description, cta }: FeaturedToolCardProps) {
  const Icon = tool.icon;
  const handleClick = useCallback(() => onNavigate(tool.path), [onNavigate, tool.path]);

  return (
    <div
      onClick={handleClick}
      className="group relative bg-white rounded-2xl border border-black/10 p-1 hover:border-[#7610DC]/30 transition-colors cursor-pointer"
    >
      <div className="absolute top-4 right-4 bg-[#7610DC]/10 text-[#7610DC] text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">
        Top Pick
      </div>
      <div className="p-6">
        <div className="w-12 h-12 bg-[#7610DC] rounded-xl flex items-center justify-center mb-6 text-white">
          <Icon className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold text-black mb-2">{title}</h3>
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">{description}</p>
        
        {tool.id === 'equity-calculator' && (
          <div className="bg-gray-50 rounded-xl p-3 mb-6 border border-black/5">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>CTO (Builder)</span>
              <span className="font-bold text-[#7610DC]">45%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3">
              <div className="bg-[#7610DC] h-1.5 rounded-full" style={{ width: '45%' }} />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>CEO (Seller)</span>
              <span className="font-bold text-[#F97316]">55%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-[#F97316] h-1.5 rounded-full" style={{ width: '55%' }} />
            </div>
          </div>
        )}

        <button className="w-full py-3 bg-white border-2 border-gray-200 text-black font-bold rounded-xl hover:border-[#7610DC] hover:text-[#7610DC] transition-colors flex justify-center items-center gap-2">
          {cta}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
});

interface RegularToolCardProps {
  tool: Tool;
  onNavigate: (path: string) => void;
  title: string;
  description: string;
  useNowLabel: string;
  newBadge: string;
}

const RegularToolCard = memo(function RegularToolCard({ tool, onNavigate, title, description, useNowLabel, newBadge }: RegularToolCardProps) {
  const Icon = tool.icon;
  const handleClick = useCallback(() => onNavigate(tool.path), [onNavigate, tool.path]);

  return (
    <div
      onClick={handleClick}
      className="group relative bg-white rounded-2xl border border-black/10 p-6 hover:border-[#7610DC]/30 transition-colors cursor-pointer"
    >
      {tool.isNew && (
        <div className="absolute top-4 right-4 bg-[#F97316]/10 text-[#F97316] text-xs font-bold px-2 py-1 rounded">
          {newBadge}
        </div>
      )}
      <div className="w-10 h-10 bg-[#7610DC]/10 rounded-xl flex items-center justify-center mb-4 text-[#7610DC]">
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-lg font-bold text-black mb-2 group-hover:text-[#7610DC] transition-colors">
        {title}
      </h3>
      <p className="text-gray-500 text-sm mb-4 leading-relaxed line-clamp-2">
        {description}
      </p>
      <span className="text-[#7610DC] font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
        {useNowLabel} <ArrowRight className="w-4 h-4" />
      </span>
    </div>
  );
});

interface SecondaryToolLinkProps {
  tool: SecondaryTool;
  title: string;
}

const SecondaryToolLink = memo(function SecondaryToolLink({ tool, title }: SecondaryToolLinkProps) {
  const Icon = tool.icon;
  return (
    <Link
      to={tool.path}
      className="flex items-center gap-4 p-4 bg-white border border-black/10 rounded-2xl hover:border-[#7610DC]/30 transition-colors group"
    >
      <div className="bg-gray-50 p-2 rounded-xl text-gray-400 group-hover:text-[#7610DC] group-hover:bg-[#7610DC]/10 transition-colors">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h4 className="font-bold text-sm text-black">{title}</h4>
        <p className="text-xs text-gray-400">{tool.type}</p>
      </div>
    </Link>
  );
});

// ==========================================
// TAB CONTENT
// ==========================================

interface NovidadesContentProps {
  activeCategory: string;
  handleCategoryChange: (id: string) => void;
  handleNavigate: (path: string) => void;
  featuredTools: Tool[];
  regularTools: Tool[];
  useNowLabel: string;
  newBadge: string;
  isLoggedIn: boolean;
  platformStats: any;
  t: any;
}

const NovidadesContent = memo(function NovidadesContent({
  activeCategory, handleCategoryChange, handleNavigate,
  featuredTools, regularTools, useNowLabel, newBadge,
  isLoggedIn, platformStats, t,
}: NovidadesContentProps) {
  return (
    <>
      {/* Category Filters - Sticky */}
      <div className="bg-white border-b border-black/5 sticky top-12 sm:top-14 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-3 sm:flex sm:overflow-x-auto py-3 sm:py-4 gap-2 sm:gap-3 sm:no-scrollbar">
            {CATEGORIES.map((category) => (
              <CategoryButton
                key={category.id}
                category={category}
                isActive={activeCategory === category.id}
                onClick={handleCategoryChange}
                label={t(`tools.categories.${category.id}`, category.id)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className={`max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-16 ${isLoggedIn ? 'pb-28 lg:pb-16' : ''}`}>
        
        {/* GuildaIA MVP Builder - Featured Banner — flat */}
        <div 
          onClick={() => handleNavigate('/tools/guilda-ia-mvp')}
          className="group relative mb-10 sm:mb-16 overflow-hidden rounded-2xl lg:rounded-[2rem] bg-[#7610DC] p-6 sm:p-8 cursor-pointer hover:bg-[#7610DC]/95 transition-colors"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-2xl flex items-center justify-center">
                <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 text-white text-xs font-bold rounded-full uppercase tracking-wide">
                  <Sparkles className="w-3 h-3 flex-shrink-0" />
                  {t('tools.guilda-ia-mvp.badge', 'Nova Ferramenta')}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#F97316] text-white text-xs font-bold rounded-full">
                  Beta
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                {t('tools.guilda-ia-mvp.title', 'GuildaIA MVP Builder')}
              </h2>
              <p className="text-white/80 text-sm sm:text-base max-w-2xl leading-relaxed">
                {t('tools.guilda-ia-mvp.description', 'Transforme sua ideia em um MVP funcional em minutos. Descreva sua startup e deixe a IA criar seu app.')}
              </p>
            </div>
            
            <div className="flex-shrink-0 w-full sm:w-auto">
              <div className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-[#7610DC] font-bold rounded-xl">
                {t('tools.guilda-ia-mvp.cta', 'Criar meu MVP')}
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Featured Tools */}
        {featuredTools.filter(tool => tool.id !== 'guilda-ia-mvp').length > 0 && (
          <div className="mb-10 sm:mb-16">
            <h2 className="text-xl sm:text-2xl font-bold text-black mb-6 sm:mb-8 flex items-center gap-2">
              <Flame className="text-[#F97316] fill-[#F97316] w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
              {t('tools.sections.essentials', 'Essenciais para começar')}
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {featuredTools.filter(tool => tool.id !== 'guilda-ia-mvp').map((tool) => (
                <FeaturedToolCard
                  key={tool.id}
                  tool={tool}
                  onNavigate={handleNavigate}
                  title={t(`tools.${tool.id}.title`)}
                  description={t(`tools.${tool.id}.description`)}
                  cta={t(`tools.${tool.id}.cta`, useNowLabel)}
                />
              ))}

              {/* Special Dark Card for MVP Vibecoding */}
              <div
                onClick={() => handleNavigate('/tools/mvp-vibecoding')}
                className="group relative bg-black rounded-2xl border border-black p-6 hover:border-[#7610DC]/50 transition-colors overflow-hidden cursor-pointer"
              >
                <div className="absolute top-4 right-4 bg-[#F97316] text-white text-xs font-bold px-2 py-1 rounded">
                  {newBadge}
                </div>
                
                <div className="w-12 h-12 bg-[#F97316] rounded-xl flex items-center justify-center mb-6 text-white">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {t('tools.mvp-vibecoding.title')}
                </h3>
                <p className="text-white/60 text-sm mb-6 leading-relaxed">
                  {t('tools.mvp-vibecoding.description')}
                </p>
                <button className="w-full py-3 bg-[#7610DC] text-white font-bold rounded-xl hover:bg-[#7610DC]/90 transition-colors flex justify-center items-center gap-2">
                  {t('tools.mvp-vibecoding.cta', 'Começar Guia')}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Regular Tools Grid */}
        {regularTools.length > 0 && (
          <div className="mb-10 sm:mb-16">
            <h2 className="text-lg sm:text-xl font-bold text-black mb-4 sm:mb-6">
              {t('tools.sections.allTools', 'Todas as Ferramentas')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {regularTools.map((tool) => (
                <RegularToolCard
                  key={tool.id}
                  tool={tool}
                  onNavigate={handleNavigate}
                  title={t(`tools.${tool.id}.title`)}
                  description={t(`tools.${tool.id}.description`)}
                  useNowLabel={useNowLabel}
                  newBadge={newBadge}
                />
              ))}
            </div>
          </div>
        )}

        {/* Secondary Section: Templates */}
        <div className="mb-10 sm:mb-16">
          <h2 className="text-lg sm:text-xl font-bold text-black mb-4 sm:mb-6">
            {t('tools.sections.templates', 'Templates & Documentos')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {SECONDARY_TOOLS.map((tool) => (
              <SecondaryToolLink
                key={tool.id}
                tool={tool}
                title={t(`tools.${tool.id}.title`)}
              />
            ))}
          </div>
        </div>

        {/* Final CTA — flat */}
        <div className="bg-[#7610DC] rounded-2xl lg:rounded-[2rem] p-6 sm:p-8 md:p-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8">
            <div className="max-w-xl text-center lg:text-left">
              <h2
                className="text-xl sm:text-2xl md:text-3xl font-serif font-thin leading-[0.9] tracking-tight text-white mb-3 sm:mb-4"
                style={{ fontFamily: "'Merriweather', 'Georgia', serif" }}
              >
                {t('tools.ctaSection.title', 'Está faltando um Co-founder para usar tudo isso?')}
              </h2>
              <p className="text-white/80 text-base sm:text-lg">
                {t('tools.ctaSection.description', 'As ferramentas ajudam, mas é o time que constrói. Junte-se à Guilda e encontre o sócio ideal.')}
              </p>
            </div>
            
            <div className="border border-white/20 p-2 rounded-2xl w-full sm:w-auto">
              <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white rounded-xl mb-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#7610DC] rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base flex-shrink-0">
                  JD
                </div>
                <div className="text-left min-w-0 flex-1">
                  <div className="text-sm font-bold text-black truncate">João D. (Builder)</div>
                  <div className="text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 flex-shrink-0" />
                    {t('tools.ctaSection.justJoined', 'Acabou de entrar')}
                  </div>
                </div>
                <Button 
                  size="sm" 
                  className="ml-2 sm:ml-4 flex-shrink-0 bg-[#7610DC] hover:bg-[#7610DC]/90 text-white rounded-xl"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNavigate('/auth?view=signup');
                  }}
                >
                  {t('tools.ctaSection.connect', 'Conectar')}
                </Button>
              </div>
              <div className="text-center">
                <Link to="/tavern" className="text-sm text-white/60 hover:text-white underline">
                  {t('tools.ctaSection.seeMore', 'Ver mais {{count}} perfis').replace('{{count}}', String(platformStats.data?.total_profiles || 1402))}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
});

// ==========================================
// MAIN COMPONENT
// ==========================================

const Tools = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: auth } = useAuth();
  const { logout } = useLogout();
  const platformStats = usePlatformStats();
  const { allProjects } = useMyProjects();
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeTab, setActiveTab] = useState<'novidades' | 'recommendations'>('novidades');
  
  const isLoggedIn = !!auth?.user;
  const hasProjects = allProjects.length > 0;
  const projectStatus = allProjects[0]?.status;

  const handleNavigate = useCallback((path: string) => navigate(path), [navigate]);
  const handleCategoryChange = useCallback((categoryId: string) => setActiveCategory(categoryId), []);

  const filteredTools = useMemo(() => {
    return TOOLS.filter(tool => activeCategory === 'all' || tool.category === activeCategory);
  }, [activeCategory]);

  const featuredTools = useMemo(() => filteredTools.filter(tool => tool.featured), [filteredTools]);
  const regularTools = useMemo(() => filteredTools.filter(tool => !tool.featured), [filteredTools]);

  const schemaJson = useMemo(() => JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": t('tools.pageTitle'),
    "description": t('tools.pageDescription'),
    "itemListElement": TOOLS.map((tool, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "SoftwareApplication",
        "name": t(`tools.${tool.id}.title`),
        "description": t(`tools.${tool.id}.description`),
        "url": `https://guilda.app.br${tool.path}`,
        "applicationCategory": "BusinessApplication",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "BRL" }
      }
    }))
  }), [t]);

  const useNowLabel = t('tools.useNow');
  const newBadge = t('tools.badges.new', 'NOVO');

  return (
    <>
      <Helmet>
        <title>{t('tools.pageTitle')} | Guilda</title>
        <meta name="description" content={t('tools.pageDescription')} />
        <meta name="keywords" content="ferramentas startup, calculadora equity, contrato sócios, runway calculator, quiz empreendedor" />
        <link rel="canonical" href="https://www.guilda.app.br/ferramentas-empreendedores" />
        <script type="application/ld+json">{schemaJson}</script>
      </Helmet>

      <div className="min-h-screen bg-white text-black antialiased selection:bg-[#7610DC]/20">
        {isLoggedIn ? (
          <InternalNavbar
            userId={auth?.user?.id}
            username={auth?.profile?.username}
            avatarUrl={auth?.profile?.avatar_url}
            isPremium={auth?.subscription?.is_premium || false}
            onLogout={logout}
            showSearch={false}
            title={t('tools.pageTitle')}
            archetype={auth?.profile?.archetype}
          />
        ) : (
          <LandingDarkNavbar />
        )}
        <SocialPaymentBanner />

        {/* Hero Section — flat, no gradients */}
        {!isLoggedIn && (
          <header className="pt-24 sm:pt-32 pb-12 sm:pb-16 border-b border-black/5">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
              <div className="max-w-3xl">
                <p className="text-[#7610DC] font-medium text-sm uppercase tracking-wider mb-2">
                  {t('tools.hero.badge', 'Ferramentas Gratuitas')}
                </p>
                <h1
                  className="text-[1.75rem] sm:text-4xl md:text-5xl lg:text-6xl font-serif font-thin leading-[0.9] tracking-tight text-black mb-4"
                  style={{ fontFamily: "'Merriweather', 'Georgia', serif" }}
                >
                  {t('tools.hero.titlePart1', 'O Arsenal do')}{' '}
                  <span className="text-[#7610DC]">
                    {t('tools.hero.titlePart2', 'Fundador')}
                  </span>
                </h1>
                
                <p className="text-sm sm:text-lg text-gray-500 leading-relaxed max-w-2xl">
                  {t('tools.hero.description', 'Pare de adivinhar. Use nossas calculadoras e templates para estruturar o equity, valuation e runway da sua startup com precisão de VC.')}
                </p>
              </div>
            </div>
          </header>
        )}

        {/* Tabs Section */}
        <div className={`bg-white ${isLoggedIn ? 'pt-20 sm:pt-24' : 'pt-6'}`}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <ToolsTabs activeTab={activeTab} onTabChange={setActiveTab}>
              <TabsContent value="novidades" className="mt-0">
                <NovidadesContent
                  activeCategory={activeCategory}
                  handleCategoryChange={handleCategoryChange}
                  handleNavigate={handleNavigate}
                  featuredTools={featuredTools}
                  regularTools={regularTools}
                  useNowLabel={useNowLabel}
                  newBadge={newBadge}
                  isLoggedIn={isLoggedIn}
                  platformStats={platformStats}
                  t={t}
                />
              </TabsContent>
              
              <TabsContent value="recommendations" className="mt-0">
                <main className={`max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-16 ${isLoggedIn ? 'pb-28 lg:pb-16' : ''}`}>
                  <RecommendationsTab 
                    archetype={auth?.profile?.archetype as Archetype | undefined}
                    hasProjects={hasProjects}
                    projectStatus={projectStatus}
                  />
                </main>
              </TabsContent>
            </ToolsTabs>
          </div>
        </div>

        <div className={isLoggedIn ? 'hidden lg:block' : ''}>
          <LandingFooter />
        </div>
      </div>
    </>
  );
};

export default Tools;
