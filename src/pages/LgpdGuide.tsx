import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Shield, FileText, Users, Lock, AlertTriangle, Database } from 'lucide-react';
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

const LgpdGuide = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  useToolTracking('lgpd-guide');
  const [checklist, setChecklist] = useState<Record<string, ChecklistItem[]>>({
    basics: [
      { id: 'bas1', completed: false },
      { id: 'bas2', completed: false },
      { id: 'bas3', completed: false },
      { id: 'bas4', completed: false },
      { id: 'bas5', completed: false },
    ],
    collection: [
      { id: 'col1', completed: false },
      { id: 'col2', completed: false },
      { id: 'col3', completed: false },
      { id: 'col4', completed: false },
    ],
    security: [
      { id: 'sec1', completed: false },
      { id: 'sec2', completed: false },
      { id: 'sec3', completed: false },
      { id: 'sec4', completed: false },
      { id: 'sec5', completed: false },
    ],
    rights: [
      { id: 'rig1', completed: false },
      { id: 'rig2', completed: false },
      { id: 'rig3', completed: false },
      { id: 'rig4', completed: false },
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
      key: 'basics',
      icon: FileText,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
    },
    {
      key: 'collection',
      icon: Database,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
    },
    {
      key: 'security',
      icon: Lock,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
    },
    {
      key: 'rights',
      icon: Users,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
    },
  ];

  return (
    <ToolPageLayout
      toolId="lgpd-guide"
      icon={Shield}
      iconColor="text-blue-500"
      iconBgColor="bg-blue-500/10"
    >
      <Helmet>
        <title>{t('tools.lgpd-guide.title')} | Guilda</title>
        <meta name="description" content={t('tools.lgpd-guide.description')} />
        <link rel="canonical" href="https://www.guilda.app.br/ferramentas-empreendedores/lgpd-guide" />
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Overall Progress */}
        <Card className="mb-8 bg-black text-white border-0">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{t('tools.lgpd-guide.progress')}</span>
              <span className="text-sm text-blue-400">{getTotalProgress()}%</span>
            </div>
            <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-700">
              <div 
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${getTotalProgress()}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Introduction */}
        <Card className="mb-8 border-2 border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2">{t('tools.lgpd-guide.intro.title')}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {t('tools.lgpd-guide.intro.description')}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {phases.map((phase) => {
                const Icon = phase.icon;
                return (
                  <div key={phase.key} className="text-center">
                    <div className={`w-10 h-10 rounded-full ${phase.bgColor} flex items-center justify-center mx-auto mb-2`}>
                      <Icon className={`w-5 h-5 ${phase.color}`} />
                    </div>
                    <p className="text-xs font-medium">{t(`tools.lgpd-guide.phases.${phase.key}.title`)}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Warning */}
        <Card className="mb-8 border-2 border-amber-500/20 bg-amber-500/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-600 dark:text-amber-400 mb-1">
                  {t('tools.lgpd-guide.warning.title')}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {t('tools.lgpd-guide.warning.description')}
                </p>
              </div>
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
                        {phaseIndex + 1}. {t(`tools.lgpd-guide.phases.${phase.key}.title`)}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {t(`tools.lgpd-guide.phases.${phase.key}.subtitle`)}
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
                    {t(`tools.lgpd-guide.phases.${phase.key}.description`)}
                  </p>

                  <div className="mb-6">
                    <h4 className="font-medium text-sm mb-3">{t('tools.lgpd-guide.keyPoints')}</h4>
                    <ul className="space-y-2">
                      {[1, 2, 3].map((q) => (
                        <li key={q} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className={phase.color}>•</span>
                          {t(`tools.lgpd-guide.phases.${phase.key}.points.p${q}`)}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm mb-3">{t('tools.lgpd-guide.checklist')}</h4>
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
                            {t(`tools.lgpd-guide.phases.${phase.key}.tasks.task${index + 1}`)}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                      💡 {t('tools.lgpd-guide.tips')}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {t(`tools.lgpd-guide.phases.${phase.key}.tip`)}
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>

        {/* Penalties */}
        <Card className="mt-8 border-2 border-red-500/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              {t('tools.lgpd-guide.penalties.title')}
            </CardTitle>
            <CardDescription>{t('tools.lgpd-guide.penalties.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-red-500">•</span>
                <span>{t('tools.lgpd-guide.penalties.p1')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500">•</span>
                <span>{t('tools.lgpd-guide.penalties.p2')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500">•</span>
                <span>{t('tools.lgpd-guide.penalties.p3')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500">•</span>
                <span>{t('tools.lgpd-guide.penalties.p4')}</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Resources */}
        <Card className="mt-8 border-2">
          <CardHeader>
            <CardTitle className="text-lg">{t('tools.lgpd-guide.resources.title')}</CardTitle>
            <CardDescription>{t('tools.lgpd-guide.resources.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                📚 <span className="font-medium">Lei nº 13.709/2018 (LGPD)</span> - Texto completo
              </li>
              <li className="flex items-center gap-2">
                🌐 <span className="font-medium">ANPD</span> - Autoridade Nacional de Proteção de Dados
              </li>
              <li className="flex items-center gap-2">
                📚 <span className="font-medium">GDPR</span> - Regulamento Geral de Proteção de Dados (EU)
              </li>
              <li className="flex items-center gap-2">
                📚 <span className="font-medium">ISO 27001</span> - Gestão de Segurança da Informação
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Tips */}
        <ToolTipsBox toolId="lgpd-guide" />

        {/* CTA */}
        <Card className="mt-8 bg-slate-900 text-white border-0">
          <CardContent className="pt-6 text-center">
            <h3 className="text-xl font-bold mb-2">Precisa de ajuda com LGPD?</h3>
            <p className="text-slate-300 mb-4">Encontre um co-founder ou consultor para implementar conformidade</p>
            <Button 
              size="lg"
              onClick={() => navigate('/auth?view=signup')}
              className="bg-blue-500 hover:bg-blue-600"
            >
              Encontrar Especialista
            </Button>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <div className="mt-8 p-4 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
          <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
            ⚠️ {t("tools.lgpd-guide.disclaimer", "Este guia é apenas para fins educacionais. Não substitui consultoria jurídica especializada em proteção de dados.")}
          </p>
        </div>
      </div>
    </ToolPageLayout>
  );
};

export default LgpdGuide;
