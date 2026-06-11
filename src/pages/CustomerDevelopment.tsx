import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, Search, FlaskConical, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { ToolPageLayout } from '@/components/tools/ToolPageLayout';
import { ToolTipsBox } from '@/components/tools/ToolHelpTooltip';
import { useToolTracking } from '@/hooks/useToolTracking';

interface ChecklistItem {
  id: string;
  completed: boolean;
}

const CustomerDevelopment = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { trackCalculation } = useToolTracking('customer-dev');
  const [checklist, setChecklist] = useState<Record<string, ChecklistItem[]>>({
    discovery: [
      { id: 'disc1', completed: false },
      { id: 'disc2', completed: false },
      { id: 'disc3', completed: false },
      { id: 'disc4', completed: false },
      { id: 'disc5', completed: false },
    ],
    validation: [
      { id: 'val1', completed: false },
      { id: 'val2', completed: false },
      { id: 'val3', completed: false },
      { id: 'val4', completed: false },
      { id: 'val5', completed: false },
    ],
    creation: [
      { id: 'cre1', completed: false },
      { id: 'cre2', completed: false },
      { id: 'cre3', completed: false },
      { id: 'cre4', completed: false },
    ],
    building: [
      { id: 'bui1', completed: false },
      { id: 'bui2', completed: false },
      { id: 'bui3', completed: false },
      { id: 'bui4', completed: false },
    ],
  });

  const toggleItem = (phase: string, itemId: string) => {
    setChecklist(prev => ({
      ...prev,
      [phase]: prev[phase].map(item =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      )
    }));
  };

  // Track calculation when user toggles checklist items
  useEffect(() => {
    const allItems = Object.values(checklist).flat();
    const completed = allItems.filter(i => i.completed).length;
    if (completed > 0) {
      trackCalculation({ completedTasks: completed, totalTasks: allItems.length, progress: getTotalProgress() });
    }
  }, [checklist, trackCalculation]);

  const getPhaseProgress = (phase: string) => {
    const items = checklist[phase];
    const completed = items.filter(i => i.completed).length;
    return Math.round((completed / items.length) * 100);
  };

  const getTotalProgress = () => {
    const allItems = Object.values(checklist).flat();
    const completed = allItems.filter(i => i.completed).length;
    return Math.round((completed / allItems.length) * 100);
  };

  const phases = [
    {
      key: 'discovery',
      icon: Search,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
    },
    {
      key: 'validation',
      icon: FlaskConical,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
    },
    {
      key: 'creation',
      icon: Users,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
    },
    {
      key: 'building',
      icon: Rocket,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
    },
  ];

  return (
    <ToolPageLayout
      toolId="customer-dev"
      icon={BookOpen}
      iconColor="text-teal-500"
      iconBgColor="bg-teal-500/10"
    >
      <Helmet>
        <title>{t('tools.customer-dev.title')} | Guilda</title>
        <meta name="description" content={t('tools.customer-dev.description')} />
        <link rel="canonical" href="https://www.guilda.app.br/ferramentas-empreendedores/customer-dev" />
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Overall Progress */}
        <Card className="mb-8 bg-black text-white border-0">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{t('tools.customer-dev.progress')}</span>
              <span className="text-sm text-teal-400">{getTotalProgress()}%</span>
            </div>
            <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-700">
              <div 
                className="h-full bg-teal-500 transition-all duration-300"
                style={{ width: `${getTotalProgress()}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Introduction */}
        <Card className="mb-8 border-2 border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2">{t('tools.customer-dev.intro.title')}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {t('tools.customer-dev.intro.description')}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {phases.map((phase) => {
                const Icon = phase.icon;
                return (
                  <div key={phase.key} className="text-center">
                    <div className={`w-10 h-10 rounded-full ${phase.bgColor} flex items-center justify-center mx-auto mb-2`}>
                      <Icon className={`w-5 h-5 ${phase.color}`} />
                    </div>
                    <p className="text-xs font-medium">{t(`tools.customer-dev.phases.${phase.key}.title`)}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Phases */}
        <Accordion type="single" collapsible className="space-y-4">
          {phases.map((phase, phaseIndex) => {
            const Icon = phase.icon;
            const progress = getPhaseProgress(phase.key);
            
            return (
              <AccordionItem key={phase.key} value={phase.key} className="border-2 rounded-lg overflow-hidden">
                <AccordionTrigger className={`px-6 py-4 hover:no-underline ${phase.bgColor}`}>
                  <div className="flex items-center gap-4 w-full">
                    <div className={`w-10 h-10 rounded-full bg-background flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${phase.color}`} />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-semibold">
                        {phaseIndex + 1}. {t(`tools.customer-dev.phases.${phase.key}.title`)}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {t(`tools.customer-dev.phases.${phase.key}.subtitle`)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative w-20 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-600">
                        <div 
                          className={`h-full transition-all duration-300 ${phase.color.replace('text-', 'bg-')}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-12">{progress}%</span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 py-4">
                  <p className="text-sm text-muted-foreground mb-6">
                    {t(`tools.customer-dev.phases.${phase.key}.description`)}
                  </p>

                  <div className="mb-6">
                    <h4 className="font-medium text-sm mb-3">{t('tools.customer-dev.keyQuestions')}</h4>
                    <ul className="space-y-2">
                      {[1, 2, 3].map((q) => (
                        <li key={q} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className={phase.color}>•</span>
                          {t(`tools.customer-dev.phases.${phase.key}.questions.q${q}`)}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm mb-3">{t('tools.customer-dev.checklist')}</h4>
                    <div className="space-y-3">
                      {checklist[phase.key].map((item, index) => (
                        <div
                          key={item.id}
                          className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                        >
                          <Checkbox
                            id={item.id}
                            checked={item.completed}
                            onCheckedChange={() => toggleItem(phase.key, item.id)}
                          />
                          <label
                            htmlFor={item.id}
                            className={`text-sm cursor-pointer flex-1 ${item.completed ? 'line-through text-muted-foreground' : ''}`}
                          >
                            {t(`tools.customer-dev.phases.${phase.key}.tasks.task${index + 1}`)}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                      💡 {t('tools.customer-dev.tips')}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {t(`tools.customer-dev.phases.${phase.key}.tip`)}
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>

        {/* Resources */}
        <Card className="mt-8 border-2">
          <CardHeader>
            <CardTitle className="text-lg">{t('tools.customer-dev.resources.title')}</CardTitle>
            <CardDescription>{t('tools.customer-dev.resources.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                📚 <span className="font-medium">"The Four Steps to the Epiphany"</span> - Steve Blank
              </li>
              <li className="flex items-center gap-2">
                📚 <span className="font-medium">"The Lean Startup"</span> - Eric Ries
              </li>
              <li className="flex items-center gap-2">
                📚 <span className="font-medium">"The Mom Test"</span> - Rob Fitzpatrick
              </li>
              <li className="flex items-center gap-2">
                📚 <span className="font-medium">"Running Lean"</span> - Ash Maurya
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Tips */}
        <ToolTipsBox toolId="customer-dev" />

        {/* CTA */}
        <Card className="mt-8 bg-black text-white border-0">
          <CardContent className="pt-6 text-center">
            <h3 className="text-xl font-bold mb-2">Pronto para validar sua ideia?</h3>
            <p className="text-slate-300 mb-4">Encontre um co-founder para acelerar seu Customer Development</p>
            <Button 
              size="lg"
              onClick={() => navigate('/auth?view=signup')}
              className="bg-teal-500 hover:bg-teal-600"
            >
              Encontrar Co-Founder
            </Button>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <div className="mt-8 p-4 bg-gray-50 border border-black/10 rounded-2xl">
          <p className="text-sm text-gray-500 text-center">
            ⚠️ {t("tools.customer-dev.disclaimer", "Este guia é apenas para fins educacionais. O processo de Customer Development deve ser adaptado à realidade do seu negócio.")}
          </p>
        </div>
      </div>
    </ToolPageLayout>
  );
};

export default CustomerDevelopment;
