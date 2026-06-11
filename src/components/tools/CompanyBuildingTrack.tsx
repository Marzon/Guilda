import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Wrench, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { Archetype } from '@/types/archetype';
import { 
  COMPANY_BUILDING_PHASES, 
  getFilteredTools, 
  getFilteredArticles,
  getUsedToolsFromStorage 
} from '@/data/recommendationsConfig';
import { cn } from '@/lib/utils';

interface CompanyBuildingTrackProps {
  archetype: Archetype | undefined;
  projectStatus?: 'IDEA' | 'MVP' | 'SCALE';
}

export const CompanyBuildingTrack = memo(function CompanyBuildingTrack({
  archetype,
  projectStatus,
}: CompanyBuildingTrackProps) {
  const { t } = useTranslation();

  const usedTools = useMemo(() => getUsedToolsFromStorage(), []);

  const phasesWithProgress = useMemo(() => {
    return COMPANY_BUILDING_PHASES.map(phase => {
      const filteredTools = getFilteredTools(phase.tools, archetype);
      const filteredArticles = getFilteredArticles(phase.articles, archetype);
      const completedCount = filteredTools.filter(tool => 
        usedTools.includes(tool.id)
      ).length;
      const totalCount = filteredTools.length;
      const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

      return {
        ...phase,
        filteredTools,
        filteredArticles,
        completedCount,
        totalCount,
        progress,
      };
    });
  }, [archetype, usedTools]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Track Header */}
      <div className="text-center mb-4 sm:mb-6 px-2">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">
          {t('tools.recommendations.companyBuilding.title')}
        </h2>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          {t('tools.recommendations.companyBuilding.subtitle')}
        </p>
        {projectStatus && (
          <Badge variant="outline" className="mt-2">
            {t(`tools.recommendations.projectStatus.${projectStatus.toLowerCase()}`, projectStatus)}
          </Badge>
        )}
      </div>

      {/* Phases */}
      <div className="space-y-4">
        {phasesWithProgress.map((phase, index) => {
          const Icon = phase.icon;
          
          return (
            <Card 
              key={phase.id}
              className={cn(
                "border-l-4 sm:border-l-0 sm:border-2 transition-all",
                phase.borderColorClass,
                phase.bgColorClass
              )}
            >
              <CardHeader className="p-3 sm:p-4 pb-2 sm:pb-3">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className={cn(
                      "w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                      "bg-background shadow-sm"
                    )}>
                      <Icon className={cn("w-4 h-4 sm:w-5 sm:h-5", phase.colorClass)} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={cn("text-[10px] sm:text-xs font-bold uppercase tracking-wide", phase.colorClass)}>
                          {t('tools.recommendations.phase', 'Fase')} {index + 1}
                        </span>
                        {phase.progress === 100 && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                        )}
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-foreground">
                        {t(phase.nameKey)}
                      </h3>
                    </div>
                  </div>
                  
                  {phase.totalCount > 0 && (
                    <div className="flex items-center gap-2 sm:flex-col sm:items-end sm:text-right sm:min-w-[90px]">
                      <div className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">
                        {t('tools.recommendations.usedTools', {
                          count: phase.completedCount,
                          total: phase.totalCount
                        })}
                      </div>
                      <Progress value={phase.progress} className="h-1 sm:h-1.5 w-16 sm:w-full" />
                    </div>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">
                  {t(phase.descriptionKey)}
                </p>
              </CardHeader>

              <CardContent className="p-3 sm:p-4 pt-0 space-y-3 sm:space-y-4">
                {/* Tools Section */}
                {phase.filteredTools.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <Wrench className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-xs sm:text-sm font-medium text-foreground">
                        {t('tools.recommendations.tools')}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {phase.filteredTools.map(tool => {
                        const isUsed = usedTools.includes(tool.id);
                        return (
                          <Link
                            key={tool.id}
                            to={`/tools/${tool.id}`}
                            className={cn(
                              "group flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border transition-all",
                              "bg-background hover:shadow-md hover:border-primary/50",
                              isUsed && "border-green-300 dark:border-green-800"
                            )}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-xs sm:text-sm text-foreground truncate group-hover:text-primary transition-colors">
                                  {t(`tools.${tool.id}.title`)}
                                </span>
                                {isUsed && (
                                  <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-green-500 flex-shrink-0" />
                                )}
                              </div>
                            </div>
                            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Articles Section */}
                {phase.filteredArticles.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-xs sm:text-sm font-medium text-foreground">
                        {t('tools.recommendations.articles')}
                      </span>
                    </div>
                    <div className="space-y-1 sm:space-y-2">
                      {phase.filteredArticles.map(article => (
                        <Link
                          key={article.slug}
                          to={`/blog/${article.slug}`}
                          className="group flex items-start gap-2 p-1.5 sm:p-2 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <span className="text-xs sm:text-sm text-muted-foreground group-hover:text-foreground transition-colors break-words min-w-0 flex-1">
                            {t(`tools.recommendations.articleTitle.${article.slug.replace(/-/g, '_')}`, article.slug)}
                          </span>
                          <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-0.5" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
});
