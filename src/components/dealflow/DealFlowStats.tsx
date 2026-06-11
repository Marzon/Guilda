import { useState } from "react";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/hooks/useLanguage";
import { DealFlowStats as Stats } from "@/hooks/useDealFlowStats";
import { DEAL_TAGS, DealTag } from "@/hooks/useDealFlow";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Clock, Target, Layers, ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface DealFlowStatsProps {
  stats: Stats;
  onTagClick?: (tag: DealTag) => void;
  selectedTags?: DealTag[];
}

export const DealFlowStats = ({ stats, onTagClick, selectedTags = [] }: DealFlowStatsProps) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="mb-6">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <button className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-lg">📊</span>
              <h3 className="font-semibold">{t('dealFlow.stats.pipeline', 'Seu Pipeline')}</h3>
              <Badge variant="secondary" className="text-xs">
                {stats.total} {t('dealFlow.stats.deals', 'deals')}
              </Badge>
            </div>
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-4">
            {/* Tags with counts */}
            <div className="flex flex-wrap gap-2 mb-4">
              {DEAL_TAGS.map(tag => {
                const count = stats.byTag[tag.value];
                const isSelected = selectedTags.includes(tag.value);
                
                return (
                  <Badge
                    key={tag.value}
                    variant={isSelected ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer transition-all",
                      isSelected ? tag.color + " text-white" : "hover:bg-muted"
                    )}
                    onClick={() => onTagClick?.(tag.value)}
                  >
                    {t(tag.labelKey, tag.value)}: {count}
                  </Badge>
                );
              })}
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t('dealFlow.stats.conversionRate', 'Taxa de Conversão')}
                  </p>
                  <p className="font-semibold">{stats.conversionRate}%</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t('dealFlow.stats.avgTimeToClose', 'Tempo Médio')}
                  </p>
                  <p className="font-semibold">
                    {stats.avgTimeToClose} {t('dealFlow.stats.days', 'dias')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-orange-500" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t('dealFlow.stats.activeDeals', 'Deals Ativos')}
                  </p>
                  <p className="font-semibold">{stats.activeDeals}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-500" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t('dealFlow.stats.total', 'Total')}
                  </p>
                  <p className="font-semibold">{stats.total}</p>
                </div>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
