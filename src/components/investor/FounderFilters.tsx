import { ChevronDown, X, Filter, Bookmark, TrendingUp, Clock, Target, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useLanguage } from "@/hooks/useLanguage";
import { useState } from "react";
import { DealTag, DEAL_TAGS } from "@/hooks/useDealFlow";
import { DealFlowStats as Stats } from "@/hooks/useDealFlowStats";
import { cn } from "@/lib/utils";

interface FounderFiltersProps {
  selectedArchetypes: string[];
  setSelectedArchetypes: (archetypes: string[]) => void;
  selectedSkills: string[];
  setSelectedSkills: (skills: string[]) => void;
  onlyOnline: boolean;
  setOnlyOnline: (value: boolean) => void;
  selectedStages: string[];
  setSelectedStages: (stages: string[]) => void;
  seekingCapitalOnly: boolean;
  setSeekingCapitalOnly: (value: boolean) => void;
  // Deal flow filters
  myDealsOnly?: boolean;
  setMyDealsOnly?: (value: boolean) => void;
  selectedDealTags?: DealTag[];
  setSelectedDealTags?: (tags: DealTag[]) => void;
  hasDeals?: boolean;
  // Pipeline stats (optional - when provided, shows stats section)
  pipelineStats?: Stats;
}

const FOUNDER_ARCHETYPES = [
  { value: "BUILDER", labelKey: "archetype.BUILDER" },
  { value: "SELLER", labelKey: "archetype.SELLER" },
];

const PROJECT_STAGES = [
  { value: "IDEA", label: "Ideia", emoji: "💡" },
  { value: "MVP", label: "MVP", emoji: "🚀" },
  { value: "SCALE", label: "Escala", emoji: "📈" },
];


export const FounderFilters = ({
  selectedArchetypes,
  setSelectedArchetypes,
  selectedSkills,
  setSelectedSkills,
  onlyOnline,
  setOnlyOnline,
  selectedStages,
  setSelectedStages,
  seekingCapitalOnly,
  setSeekingCapitalOnly,
  myDealsOnly = false,
  setMyDealsOnly,
  selectedDealTags = [],
  setSelectedDealTags,
  hasDeals = false,
  pipelineStats,
}: FounderFiltersProps) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [showPipelineStats, setShowPipelineStats] = useState(false);

  const activeFiltersCount = 
    selectedArchetypes.length + 
    selectedStages.length +
    selectedDealTags.length +
    (onlyOnline ? 1 : 0) + 
    (seekingCapitalOnly ? 1 : 0) +
    (myDealsOnly ? 1 : 0);

  const handleArchetypeToggle = (archetype: string) => {
    if (selectedArchetypes.includes(archetype)) {
      setSelectedArchetypes(selectedArchetypes.filter((a) => a !== archetype));
    } else {
      setSelectedArchetypes([...selectedArchetypes, archetype]);
    }
  };


  const handleStageToggle = (stage: string) => {
    if (selectedStages.includes(stage)) {
      setSelectedStages(selectedStages.filter((s) => s !== stage));
    } else {
      setSelectedStages([...selectedStages, stage]);
    }
  };

  const handleDealTagToggle = (tag: DealTag) => {
    if (!setSelectedDealTags) return;
    if (selectedDealTags.includes(tag)) {
      setSelectedDealTags(selectedDealTags.filter((t) => t !== tag));
    } else {
      setSelectedDealTags([...selectedDealTags, tag]);
    }
  };

  const clearFilters = () => {
    setSelectedArchetypes([]);
    setSelectedSkills([]);
    setSelectedStages([]);
    setOnlyOnline(false);
    setSeekingCapitalOnly(false);
    setMyDealsOnly?.(false);
    setSelectedDealTags?.([]);
  };

  return (
    <Card className="mb-6">
      {/* Pipeline Stats Toggle & My Deals - Always visible when there are deals */}
      {setMyDealsOnly && hasDeals && pipelineStats && (
        <div className="p-4 pb-0 space-y-3" data-tour="pipeline">
          {/* My Deals Toggle + Stats Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant={myDealsOnly ? "default" : "outline"}
                size="sm"
                onClick={() => setMyDealsOnly(!myDealsOnly)}
                className="gap-2"
              >
                <Bookmark className={cn("w-4 h-4", myDealsOnly && "fill-current")} />
                {t("dealFlow.filters.myDeals", "Meus Deals")}
                <Badge variant="secondary" className="ml-1 text-xs">
                  {pipelineStats.total}
                </Badge>
              </Button>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPipelineStats(!showPipelineStats)}
              className="gap-1.5 text-xs"
            >
              📊 {t('dealFlow.stats.pipeline', 'Pipeline')}
              <ChevronDown className={cn("w-3 h-3 transition-transform", showPipelineStats && "rotate-180")} />
            </Button>
          </div>

          {/* Pipeline Stats (collapsible) */}
          {showPipelineStats && (
            <div className="p-3 bg-muted/30 rounded-lg space-y-3">
              {/* Tags with counts */}
              <div className="flex flex-wrap gap-1.5">
                {DEAL_TAGS.map(tag => {
                  const count = pipelineStats.byTag[tag.value];
                  const isSelected = selectedDealTags.includes(tag.value);
                  
                  return (
                    <Badge
                      key={tag.value}
                      variant={isSelected ? "default" : "outline"}
                      className={cn(
                        "cursor-pointer transition-all text-xs",
                        isSelected ? tag.color + " text-white" : "hover:bg-muted"
                      )}
                      onClick={() => {
                        handleDealTagToggle(tag.value);
                        if (!myDealsOnly) setMyDealsOnly?.(true);
                      }}
                    >
                      {t(tag.labelKey, tag.value)}: {count}
                    </Badge>
                  );
                })}
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-border/50">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                  <div>
                    <p className="text-[10px] text-muted-foreground">
                      {t('dealFlow.stats.conversionRate', 'Conversão')}
                    </p>
                    <p className="text-sm font-semibold">{pipelineStats.conversionRate}%</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                  <div>
                    <p className="text-[10px] text-muted-foreground">
                      {t('dealFlow.stats.avgTimeToClose', 'Tempo Médio')}
                    </p>
                    <p className="text-sm font-semibold">{pipelineStats.avgTimeToClose}d</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Target className="w-3.5 h-3.5 text-orange-500" />
                  <div>
                    <p className="text-[10px] text-muted-foreground">
                      {t('dealFlow.stats.activeDeals', 'Ativos')}
                    </p>
                    <p className="text-sm font-semibold">{pipelineStats.activeDeals}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-purple-500" />
                  <div>
                    <p className="text-[10px] text-muted-foreground">
                      {t('dealFlow.stats.total', 'Total')}
                    </p>
                    <p className="text-sm font-semibold">{pipelineStats.total}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Deal tag filters when My Deals is active (but stats not expanded) */}
          {myDealsOnly && !showPipelineStats && setSelectedDealTags && (
            <div className="flex flex-wrap gap-1.5">
              {DEAL_TAGS.slice(0, 4).map((tag) => (
                <Badge
                  key={tag.value}
                  variant={selectedDealTags.includes(tag.value) ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer text-xs transition-all",
                    selectedDealTags.includes(tag.value) 
                      ? tag.color + " text-white hover:opacity-80" 
                      : "hover:bg-muted"
                  )}
                  onClick={() => handleDealTagToggle(tag.value)}
                >
                  {t(tag.labelKey, tag.value)}
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}

      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <button className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors rounded-lg">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">{t("investor.filters.title", "Filtros")}</span>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </div>
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-4">
            {/* Only Online Toggle */}
            <div className="flex items-center justify-between py-2">
              <Label htmlFor="only-online-founders" className="text-sm font-medium">
                {t("investor.filters.onlyOnline", "Apenas online")}
              </Label>
              <Switch
                id="only-online-founders"
                checked={onlyOnline}
                onCheckedChange={setOnlyOnline}
              />
            </div>

            {/* Seeking Capital Toggle */}
            <div className="flex items-center justify-between py-2 border-t">
              <Label htmlFor="seeking-capital" className="text-sm font-medium flex items-center gap-2">
                💰 {t("investor.filters.seekingCapital", "Buscando Capital")}
              </Label>
              <Switch
                id="seeking-capital"
                checked={seekingCapitalOnly}
                onCheckedChange={setSeekingCapitalOnly}
              />
            </div>

            {/* Archetype Filter */}
            <div>
              <p className="text-sm font-medium mb-2">{t("investor.filters.archetype", "Tipo de Founder")}</p>
              <div className="flex flex-wrap gap-2">
                {FOUNDER_ARCHETYPES.map((archetype) => (
                  <Badge
                    key={archetype.value}
                    variant={selectedArchetypes.includes(archetype.value) ? "default" : "outline"}
                    className={`cursor-pointer transition-all ${
                      selectedArchetypes.includes(archetype.value)
                        ? archetype.value === "BUILDER"
                          ? "bg-violet-600 hover:bg-violet-700"
                          : "bg-amber-600 hover:bg-amber-700"
                        : "hover:bg-muted"
                    }`}
                    onClick={() => handleArchetypeToggle(archetype.value)}
                  >
                    {t(archetype.labelKey, archetype.value)}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Project Stage Filter */}
            <div>
              <p className="text-sm font-medium mb-2">{t("investor.filters.projectStage", "Estágio da Startup")}</p>
              <div className="flex flex-wrap gap-2">
                {PROJECT_STAGES.map((stage) => (
                  <Badge
                    key={stage.value}
                    variant={selectedStages.includes(stage.value) ? "default" : "outline"}
                    className={`cursor-pointer transition-all ${
                      selectedStages.includes(stage.value)
                        ? "bg-primary hover:bg-primary/90"
                        : "hover:bg-muted"
                    }`}
                    onClick={() => handleStageToggle(stage.value)}
                  >
                    {stage.emoji} {t(`projects.stages.${stage.value.toLowerCase()}`, stage.label)}
                  </Badge>
                ))}
              </div>
            </div>


            {/* Clear Filters */}
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="w-full">
                <X className="w-4 h-4 mr-2" />
                {t("investor.filters.clear", "Limpar filtros")}
              </Button>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
