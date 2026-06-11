import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/hooks/useLanguage";
import { Code, Megaphone, Palette, Zap, Sparkles, TrendingUp, Handshake, Target, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import type { Archetype } from "@/types/archetype";

interface Stats {
  code: number;
  design: number;
  marketing: number;
}

interface ProfileDetailsSubStepProps {
  archetype: Archetype | null;
  bio: string;
  setBio: (value: string) => void;
  stats: Stats;
  setStats: (value: Stats) => void;
}

// Builder presets (technical)
const BUILDER_PRESETS = {
  fullstack: { code: 80, design: 40, marketing: 20 },
  frontend: { code: 60, design: 70, marketing: 20 },
  backend: { code: 90, design: 10, marketing: 10 },
  designer: { code: 20, design: 90, marketing: 30 },
  growth: { code: 20, design: 30, marketing: 90 },
  balanced: { code: 50, design: 50, marketing: 50 },
} as const;

// Seller presets (business-focused)
const SELLER_PRESETS = {
  sales: { code: 10, design: 20, marketing: 90 },
  growth: { code: 20, design: 30, marketing: 80 },
  strategy: { code: 15, design: 25, marketing: 85 },
  marketing: { code: 20, design: 40, marketing: 70 },
} as const;

// Starter preset (auto-balanced)
const STARTER_PRESET = { code: 50, design: 50, marketing: 50 };

type BuilderPresetKey = keyof typeof BUILDER_PRESETS;
type SellerPresetKey = keyof typeof SELLER_PRESETS;

interface PresetOption {
  key: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

export const ProfileDetailsSubStep = ({
  archetype,
  bio,
  setBio,
  stats,
  setStats,
}: ProfileDetailsSubStepProps) => {
  const { t } = useLanguage();
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [showAllPresets, setShowAllPresets] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const isInvestor = archetype === "INVESTOR";
  const isSeller = archetype === "SELLER";
  const isStarter = archetype === "STARTER";
  const isBuilder = archetype === "BUILDER";

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-select balanced for STARTER
  useEffect(() => {
    if (isStarter && !selectedPreset) {
      setSelectedPreset('balanced');
      setStats(STARTER_PRESET);
    }
  }, [isStarter, selectedPreset, setStats]);

  // Builder presets options
  const builderPresetOptions: PresetOption[] = [
    { key: "fullstack", label: t('onboarding.presetFullstack', 'Full-Stack Dev'), icon: <Code className="w-4 h-4" />, description: t('onboarding.presetFullstackDesc', 'Código + um pouco de tudo') },
    { key: "frontend", label: t('onboarding.presetFrontend', 'Frontend/UI'), icon: <Palette className="w-4 h-4" />, description: t('onboarding.presetFrontendDesc', 'Interface + código') },
    { key: "backend", label: t('onboarding.presetBackend', 'Backend/Infra'), icon: <Zap className="w-4 h-4" />, description: t('onboarding.presetBackendDesc', 'Foco em código') },
    { key: "designer", label: t('onboarding.presetDesigner', 'Designer'), icon: <Palette className="w-4 h-4" />, description: t('onboarding.presetDesignerDesc', 'UX/UI + um pouco de growth') },
    { key: "growth", label: t('onboarding.presetGrowth', 'Growth/Marketing'), icon: <Megaphone className="w-4 h-4" />, description: t('onboarding.presetGrowthDesc', 'Vendas e marketing') },
    { key: "balanced", label: t('onboarding.presetBalanced', 'Generalista'), icon: <Sparkles className="w-4 h-4" />, description: t('onboarding.presetBalancedDesc', 'Um pouco de tudo') },
  ];

  // Seller presets options (business-focused)
  const sellerPresetOptions: PresetOption[] = [
    { key: "sales", label: t('onboarding.presetSales', 'Vendas & Negociação'), icon: <Handshake className="w-4 h-4" />, description: t('onboarding.presetSalesDesc', 'Fechamento e relacionamento') },
    { key: "growth", label: t('onboarding.presetGrowthHacker', 'Growth & Métricas'), icon: <TrendingUp className="w-4 h-4" />, description: t('onboarding.presetGrowthHackerDesc', 'Dados e experimentos') },
    { key: "strategy", label: t('onboarding.presetStrategy', 'Estratégia & Parcerias'), icon: <Target className="w-4 h-4" />, description: t('onboarding.presetStrategyDesc', 'Visão de negócio') },
    { key: "marketing", label: t('onboarding.presetMarketing', 'Marketing Digital'), icon: <Megaphone className="w-4 h-4" />, description: t('onboarding.presetMarketingDesc', 'Aquisição e branding') },
  ];

  const presetOptions = isSeller ? sellerPresetOptions : builderPresetOptions;
  const presets = isSeller ? SELLER_PRESETS : BUILDER_PRESETS;

  // Bio suggestions based on archetype
  const bioSuggestions = isInvestor ? [
    t('onboarding.bioSuggestionInvestor1', 'Investidor anjo focado em early-stage SaaS B2B'),
    t('onboarding.bioSuggestionInvestor2', 'Mentor e investidor em startups de tecnologia'),
    t('onboarding.bioSuggestionInvestor3', 'Ex-founder, agora investindo em novos empreendedores'),
  ] : isBuilder ? [
    t('onboarding.bioSuggestionBuilder1', 'Dev full-stack buscando co-founder de negócios'),
    t('onboarding.bioSuggestionBuilder2', 'Engenheiro de software com experiência em startups'),
    t('onboarding.bioSuggestionBuilder3', 'Product-minded developer querendo construir algo novo'),
  ] : isStarter ? [
    t('onboarding.bioSuggestionStarter1', 'Em busca da minha primeira oportunidade em startups'),
    t('onboarding.bioSuggestionStarter2', 'Aprendendo rápido e buscando um time para crescer'),
    t('onboarding.bioSuggestionStarter3', 'Dedicação e vontade de fazer acontecer'),
  ] : [
    t('onboarding.bioSuggestionSeller1', 'Growth hacker buscando co-founder técnico'),
    t('onboarding.bioSuggestionSeller2', 'Especialista em vendas B2B e geração de leads'),
    t('onboarding.bioSuggestionSeller3', 'Marketing digital com foco em growth e aquisição'),
  ];

  const handlePresetSelect = (presetKey: string) => {
    setSelectedPreset(presetKey);
    const presetStats = presets[presetKey as keyof typeof presets];
    if (presetStats) {
      setStats(presetStats);
    }
  };

  const handleBioSuggestionClick = (suggestion: string) => {
    setBio(suggestion);
  };

  // Get presets to show based on device
  const visiblePresets = isMobile && !showAllPresets 
    ? presetOptions.slice(0, 3) 
    : presetOptions;
  const hasHiddenPresets = isMobile && presetOptions.length > 3;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-display font-bold mb-1">
          {t('onboarding.profileDetailsTitle', 'Seu Perfil')}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isSeller 
            ? t('onboarding.profileDetailsSubtitleSeller', 'Qual sua principal força?')
            : t('onboarding.profileDetailsSubtitle', 'Escolha o que mais combina com você')
          }
        </p>
      </div>

      <div className="space-y-4">
        {/* Stats Presets - Só para não-investidores */}
        {!isInvestor && !isStarter && (
          <div className="space-y-2">
            <Label className="text-sm">{t('onboarding.yourProfile', 'Seu perfil')}</Label>
            
            {/* Mobile: Horizontal scroll with snap */}
            {isMobile ? (
              <div className="space-y-2">
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory scrollbar-hide">
                  {presetOptions.map((preset, idx) => (
                    <div 
                      key={preset.key}
                      className={cn(
                        "flex-shrink-0 w-[140px] snap-start",
                        idx === presetOptions.length - 1 && "mr-1"
                      )}
                    >
                      <PresetCardCompact
                        preset={preset}
                        isSelected={selectedPreset === preset.key}
                        onSelect={() => handlePresetSelect(preset.key)}
                      />
                    </div>
                  ))}
                </div>
                {/* Inline stats preview for mobile */}
                {selectedPreset && (
                  <div className="flex items-center justify-center gap-4 py-2 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-1.5">
                      <Code className="w-3.5 h-3.5 text-blue-500" />
                      <span className="text-xs font-medium">{stats.code}%</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-purple-500" />
                      <span className="text-xs font-medium">{stats.design}%</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Megaphone className="w-3.5 h-3.5 text-orange-500" />
                      <span className="text-xs font-medium">{stats.marketing}%</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Desktop: Grid layout */
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {presetOptions.map((preset) => (
                  <PresetButton
                    key={preset.key}
                    preset={preset}
                    isSelected={selectedPreset === preset.key}
                    onSelect={() => handlePresetSelect(preset.key)}
                  />
                ))}
              </div>
            )}

            {/* Stats bars preview - only on desktop */}
            {selectedPreset && !isMobile && (
              <div className="mt-3 p-3 bg-muted/30 rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <Code className="w-3 h-3 text-blue-500 flex-shrink-0" />
                  <span className="text-xs w-16">{t('onboarding.code')}</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-300" 
                      style={{ width: `${stats.code}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-8">{stats.code}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <Palette className="w-3 h-3 text-purple-500 flex-shrink-0" />
                  <span className="text-xs w-16">{t('onboarding.design')}</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-500 transition-all duration-300" 
                      style={{ width: `${stats.design}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-8">{stats.design}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <Megaphone className="w-3 h-3 text-orange-500 flex-shrink-0" />
                  <span className="text-xs w-16">{t('onboarding.marketing')}</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-orange-500 transition-all duration-300" 
                      style={{ width: `${stats.marketing}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-8">{stats.marketing}%</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Starter info message */}
        {isStarter && (
          <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-center gap-2 text-primary">
              <Users className="w-4 h-4 flex-shrink-0" />
              <p className="text-sm">
                {t('onboarding.starterInfo', 'Você será apresentado como um perfil versátil, aberto a aprender e contribuir!')}
              </p>
            </div>
          </div>
        )}

        {/* Bio com sugestões */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <Label htmlFor="bio" className="text-sm">
              {isInvestor ? t('onboarding.yourThesis', 'Sua Tese') : t('onboarding.yourPitch')}
              <span className="text-muted-foreground text-xs ml-1">({t('onboarding.optional', 'Opcional')})</span>
            </Label>
            <span className="text-xs text-muted-foreground">{bio.length}/200</span>
          </div>
          
          {/* Sugestões clicáveis - 1 destacada em mobile */}
          {!bio && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {(isMobile ? bioSuggestions.slice(0, 1) : bioSuggestions).map((suggestion, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleBioSuggestionClick(suggestion)}
                  className={cn(
                    "text-xs bg-primary/10 hover:bg-primary/20 text-primary px-2 py-1 rounded-full transition-colors",
                    isMobile && idx === 0 && "bg-primary/15 font-medium"
                  )}
                >
                  {isMobile ? suggestion : `${suggestion.slice(0, 30)}...`}
                </button>
              ))}
              {isMobile && bioSuggestions.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleBioSuggestionClick(bioSuggestions[1])}
                  className="text-xs text-muted-foreground hover:text-foreground underline transition-colors"
                >
                  {t('onboarding.moreSuggestions', 'Mais sugestões')}
                </button>
              )}
            </div>
          )}
          
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, 200))}
            placeholder={isInvestor 
              ? t('onboarding.thesisPlaceholder', 'Descreva sua tese de investimento...')
              : t('onboarding.pitchPlaceholder')
            }
            className="min-h-[60px]"
          />
        </div>
      </div>
    </div>
  );
};

// Extracted PresetButton component for reusability
interface PresetButtonProps {
  preset: PresetOption;
  isSelected: boolean;
  onSelect: () => void;
}

const PresetButton = ({ preset, isSelected, onSelect }: PresetButtonProps) => (
  <button
    type="button"
    onClick={onSelect}
    className={cn(
      "p-3 rounded-lg border text-left transition-all w-full",
      isSelected
        ? "border-primary bg-primary/10 ring-2 ring-primary/20"
        : "border-border hover:border-primary/50 hover:bg-muted/50"
    )}
  >
    <div className="flex items-center gap-2 mb-1">
      <div className={cn(
        "p-1 rounded flex-shrink-0",
        isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
      )}>
        {preset.icon}
      </div>
      <span className="font-medium text-sm min-w-0 flex-1">{preset.label}</span>
    </div>
    <p className="text-[10px] text-muted-foreground line-clamp-1">{preset.description}</p>
  </button>
);

// Compact preset card for mobile horizontal scroll
const PresetCardCompact = ({ preset, isSelected, onSelect }: PresetButtonProps) => (
  <button
    type="button"
    onClick={onSelect}
    className={cn(
      "p-3 rounded-xl border-2 text-center transition-all w-full h-full min-h-[80px] flex flex-col items-center justify-center gap-1.5",
      isSelected
        ? "border-primary bg-primary/10 shadow-sm"
        : "border-border hover:border-primary/50"
    )}
  >
    <div className={cn(
      "w-8 h-8 rounded-lg flex items-center justify-center",
      isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
    )}>
      {preset.icon}
    </div>
    <span className="font-medium text-xs line-clamp-1">{preset.label}</span>
  </button>
);
