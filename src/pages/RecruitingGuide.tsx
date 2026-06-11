import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { Users, Search, UserCheck, Handshake, Target } from 'lucide-react';
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

const RecruitingGuide = () => {
  const { t } = useTranslation();
  useToolTracking('recruiting-guide');
  const [checklist, setChecklist] = useState<Record<string, ChecklistItem[]>>({
    planning: [
      { id: 'pla1', completed: false },
      { id: 'pla2', completed: false },
      { id: 'pla3', completed: false },
      { id: 'pla4', completed: false },
      { id: 'pla5', completed: false },
    ],
    sourcing: [
      { id: 'sou1', completed: false },
      { id: 'sou2', completed: false },
      { id: 'sou3', completed: false },
      { id: 'sou4', completed: false },
    ],
    evaluation: [
      { id: 'eva1', completed: false },
      { id: 'eva2', completed: false },
      { id: 'eva3', completed: false },
      { id: 'eva4', completed: false },
      { id: 'eva5', completed: false },
    ],
    closing: [
      { id: 'clo1', completed: false },
      { id: 'clo2', completed: false },
      { id: 'clo3', completed: false },
      { id: 'clo4', completed: false },
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
      key: 'planning',
      icon: Target,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
    },
    {
      key: 'sourcing',
      icon: Search,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
    },
    {
      key: 'evaluation',
      icon: UserCheck,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
    },
    {
      key: 'closing',
      icon: Handshake,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
    },
  ];

  const roles = [
    { key: 'cto', icon: '👨‍💻' },
    { key: 'cmo', icon: '📣' },
    { key: 'coo', icon: '⚙️' },
    { key: 'cfo', icon: '💰' },
  ];

  return (
    <ToolPageLayout
      toolId="recruiting-guide"
      icon={Users}
      iconColor="text-emerald-500"
      iconBgColor="bg-emerald-500/10"
    >
      <Helmet>
        <title>{t('tools.recruiting-guide.title')} | Guilda</title>
        <meta name="description" content={t('tools.recruiting-guide.description')} />
        <link rel="canonical" href="https://www.guilda.app.br/ferramentas-empreendedores/recruiting-guide" />
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Overall Progress */}
        <Card className="mb-8 bg-black text-white border-0">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{t('tools.recruiting-guide.progress')}</span>
              <span className="text-sm text-emerald-400">{getTotalProgress()}%</span>
            </div>
            <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-700">
              <div 
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${getTotalProgress()}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Introduction */}
        <Card className="mb-8 border-2 border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2">{t('tools.recruiting-guide.intro.title')}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {t('tools.recruiting-guide.intro.description')}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {phases.map((phase) => {
                const Icon = phase.icon;
                return (
                  <div key={phase.key} className="text-center">
                    <div className={`w-10 h-10 rounded-full ${phase.bgColor} flex items-center justify-center mx-auto mb-2`}>
                      <Icon className={`w-5 h-5 ${phase.color}`} />
                    </div>
                    <p className="text-xs font-medium">{t(`tools.recruiting-guide.phases.${phase.key}.title`)}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Key Roles */}
        <Card className="mb-8 border-2">
          <CardHeader>
            <CardTitle className="text-lg">{t('tools.recruiting-guide.roles.title')}</CardTitle>
            <CardDescription>{t('tools.recruiting-guide.roles.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roles.map((role) => (
                <div key={role.key} className="p-4 rounded-lg bg-muted/50 border">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{role.icon}</span>
                    <h4 className="font-semibold">{t(`tools.recruiting-guide.roles.${role.key}.title`)}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {t(`tools.recruiting-guide.roles.${role.key}.description`)}
                  </p>
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium">{t('tools.recruiting-guide.roles.skills')}:</span>{' '}
                    {t(`tools.recruiting-guide.roles.${role.key}.skills`)}
                  </div>
                </div>
              ))}
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
                        {phaseIndex + 1}. {t(`tools.recruiting-guide.phases.${phase.key}.title`)}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {t(`tools.recruiting-guide.phases.${phase.key}.subtitle`)}
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
                  {/* Description */}
                  <p className="text-sm text-muted-foreground mb-6">
                    {t(`tools.recruiting-guide.phases.${phase.key}.description`)}
                  </p>

                  {/* Key Questions */}
                  <div className="mb-6">
                    <h4 className="font-medium text-sm mb-3">{t('tools.recruiting-guide.keyQuestions')}</h4>
                    <ul className="space-y-2">
                      {[1, 2, 3].map((q) => (
                        <li key={q} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className={phase.color}>•</span>
                          {t(`tools.recruiting-guide.phases.${phase.key}.questions.q${q}`)}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Checklist */}
                  <div>
                    <h4 className="font-medium text-sm mb-3">{t('tools.recruiting-guide.checklist')}</h4>
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
                            {t(`tools.recruiting-guide.phases.${phase.key}.tasks.task${index + 1}`)}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tips */}
                  <div className="mt-6 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                      💡 {t('tools.recruiting-guide.tips')}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {t(`tools.recruiting-guide.phases.${phase.key}.tip`)}
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>

        {/* Red Flags */}
        <Card className="mt-8 border-2 border-red-500/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              🚩 {t('tools.recruiting-guide.redFlags.title')}
            </CardTitle>
            <CardDescription>{t('tools.recruiting-guide.redFlags.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-red-500">•</span>
                <span>{t('tools.recruiting-guide.redFlags.r1')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500">•</span>
                <span>{t('tools.recruiting-guide.redFlags.r2')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500">•</span>
                <span>{t('tools.recruiting-guide.redFlags.r3')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500">•</span>
                <span>{t('tools.recruiting-guide.redFlags.r4')}</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Tips */}
        <ToolTipsBox toolId="recruiting-guide" />

        {/* Resources */}
        <Card className="mt-8 border-2">
          <CardHeader>
            <CardTitle className="text-lg">{t('tools.recruiting-guide.resources.title')}</CardTitle>
            <CardDescription>{t('tools.recruiting-guide.resources.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                📚 <span className="font-medium">"The Hard Thing About Hard Things"</span> - Ben Horowitz
              </li>
              <li className="flex items-center gap-2">
                📚 <span className="font-medium">"Who: The A Method for Hiring"</span> - Geoff Smart
              </li>
              <li className="flex items-center gap-2">
                📚 <span className="font-medium">"High Output Management"</span> - Andy Grove
              </li>
              <li className="flex items-center gap-2">
                📚 <span className="font-medium">"The Alliance"</span> - Reid Hoffman
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <div className="mt-8 p-4 bg-gray-50 border border-black/10 rounded-2xl">
          <p className="text-sm text-gray-500 text-center">
            ⚠️ {t("tools.recruiting-guide.disclaimer", "Este guia é apenas para fins educacionais. Não substitui assessoria profissional de RH ou consultoria especializada em recrutamento.")}
          </p>
        </div>
      </div>
    </ToolPageLayout>
  );
};

export default RecruitingGuide;
