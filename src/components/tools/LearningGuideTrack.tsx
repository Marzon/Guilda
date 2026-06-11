import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Wrench, BookOpen, Plus, Users } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { Archetype } from '@/types/archetype';
import { 
  LEARNING_GUIDE_PHASES, 
  getFilteredTools, 
  getFilteredArticles,
  getUsedToolsFromStorage 
} from '@/data/recommendationsConfig';
import { cn } from '@/lib/utils';

interface LearningGuideTrackProps {
  archetype: Archetype | undefined;
}

export const LearningGuideTrack = memo(function LearningGuideTrack({
  archetype,
}: LearningGuideTrackProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const usedTools = useMemo(() => getUsedToolsFromStorage(), []);

  const phasesWithProgress = useMemo(() => {
    return LEARNING_GUIDE_PHASES.map(phase => {
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
          {t('tools.recommendations.learningGuide.title')}
        </h2>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          {t('tools.recommendations.learningGuide.subtitle')}
        </p>
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

      {/* CTA Section */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardContent className="p-6 sm:p-8">
          <div className="text-center space-y-4">
            <h3 className="text-xl font-bold text-foreground">
              {t('tools.recommendations.learningGuide.ctaTitle')}
            </h3>
            <p className="text-muted-foreground max-w-lg mx-auto">
              {t('tools.recommendations.learningGuide.ctaDescription')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button 
                onClick={() => navigate('/dashboard/startup/new')}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                {t('tools.recommendations.learningGuide.noProjectCTA')}
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/tavern')}
                className="gap-2"
              >
                <Users className="w-4 h-4" />
                {t('tools.recommendations.learningGuide.findCofounderCTA')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});
