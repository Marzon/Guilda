import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Download, Grid3X3, Shield, AlertTriangle, TrendingUp, TrendingDown, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import jsPDF from 'jspdf';
import { ToolPageLayout } from '@/components/tools/ToolPageLayout';
import { ToolTipsBox } from '@/components/tools/ToolHelpTooltip';
import { useToolTracking } from '@/hooks/useToolTracking';

interface SwotData {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

const SwotAnalysis = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { trackDownload, trackCalculation } = useToolTracking('swot');
  const [projectName, setProjectName] = useState('');
  const [swot, setSwot] = useState<SwotData>({
    strengths: [],
    weaknesses: [],
    opportunities: [],
    threats: [],
  });
  const [inputs, setInputs] = useState({
    strengths: '',
    weaknesses: '',
    opportunities: '',
    threats: '',
  });

  const addItem = (category: keyof SwotData) => {
    const value = inputs[category].trim();
    if (value) {
      setSwot(prev => ({
        ...prev,
        [category]: [...prev[category], value]
      }));
      setInputs(prev => ({ ...prev, [category]: '' }));
    }
  };

  const removeItem = (category: keyof SwotData, index: number) => {
    setSwot(prev => ({
      ...prev,
      [category]: prev[category].filter((_, i) => i !== index)
    }));
  };

  // Track calculation when user modifies SWOT items
  useEffect(() => {
    const totalItems = swot.strengths.length + swot.weaknesses.length + swot.opportunities.length + swot.threats.length;
    if (totalItems > 0) {
      trackCalculation({
        strengths: swot.strengths.length,
        weaknesses: swot.weaknesses.length,
        opportunities: swot.opportunities.length,
        threats: swot.threats.length,
        totalItems
      });
    }
  }, [swot, trackCalculation]);

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    doc.setFontSize(20);
    doc.text(t('tools.swot.title'), pageWidth / 2, 20, { align: 'center' });
    
    if (projectName) {
      doc.setFontSize(14);
      doc.text(projectName, pageWidth / 2, 30, { align: 'center' });
    }
    
    doc.setFontSize(12);
    let y = 45;
    
    const sections = [
      { key: 'strengths', title: t('tools.swot.strengths.title'), color: [34, 197, 94] },
      { key: 'weaknesses', title: t('tools.swot.weaknesses.title'), color: [239, 68, 68] },
      { key: 'opportunities', title: t('tools.swot.opportunities.title'), color: [59, 130, 246] },
      { key: 'threats', title: t('tools.swot.threats.title'), color: [245, 158, 11] },
    ];

    sections.forEach(section => {
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
      
      doc.setFont('helvetica', 'bold');
      doc.text(section.title, 20, y);
      doc.setFont('helvetica', 'normal');
      y += 8;
      
      const items = swot[section.key as keyof SwotData];
      if (items.length === 0) {
        doc.text('- ' + t('tools.swot.noItems'), 25, y);
        y += 7;
      } else {
        items.forEach(item => {
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
          const lines = doc.splitTextToSize(`• ${item}`, pageWidth - 50);
          doc.text(lines, 25, y);
          y += lines.length * 5 + 2;
        });
      }
      y += 10;
    });

    doc.save(`swot-${projectName || 'analysis'}.pdf`);
  };

  const categories = [
    {
      key: 'strengths' as const,
      title: t('tools.swot.strengths.title'),
      subtitle: t('tools.swot.strengths.subtitle'),
      icon: Shield,
      color: 'emerald',
      borderColor: 'border-emerald-500/20',
      bgColor: 'bg-emerald-500/5',
      iconColor: 'text-emerald-500',
      badgeClass: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400',
    },
    {
      key: 'weaknesses' as const,
      title: t('tools.swot.weaknesses.title'),
      subtitle: t('tools.swot.weaknesses.subtitle'),
      icon: TrendingDown,
      color: 'red',
      borderColor: 'border-red-500/20',
      bgColor: 'bg-red-500/5',
      iconColor: 'text-red-500',
      badgeClass: 'bg-red-500/20 text-red-700 dark:text-red-400',
    },
    {
      key: 'opportunities' as const,
      title: t('tools.swot.opportunities.title'),
      subtitle: t('tools.swot.opportunities.subtitle'),
      icon: TrendingUp,
      color: 'blue',
      borderColor: 'border-blue-500/20',
      bgColor: 'bg-blue-500/5',
      iconColor: 'text-blue-500',
      badgeClass: 'bg-blue-500/20 text-blue-700 dark:text-blue-400',
    },
    {
      key: 'threats' as const,
      title: t('tools.swot.threats.title'),
      subtitle: t('tools.swot.threats.subtitle'),
      icon: AlertTriangle,
      color: 'amber',
      borderColor: 'border-amber-500/20',
      bgColor: 'bg-amber-500/5',
      iconColor: 'text-amber-500',
      badgeClass: 'bg-amber-500/20 text-amber-700 dark:text-amber-400',
    },
  ];

  const hasData = swot.strengths.length > 0 || swot.weaknesses.length > 0 || swot.opportunities.length > 0 || swot.threats.length > 0;

  return (
    <>
      <Helmet>
        <title>{t('tools.swot.title')} | Guilda</title>
        <meta name="description" content={t('tools.swot.description')} />
        <link rel="canonical" href="https://www.guilda.app.br/ferramentas-empreendedores/swot" />
      </Helmet>

      <ToolPageLayout toolId="swot" icon={Grid3X3} iconColor="text-orange-500" iconBgColor="bg-orange-500/10">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Inputs */}
            <div className="lg:col-span-2 space-y-6">
              {/* Project Name */}
              <Card className="border-2">
                <CardContent className="pt-6">
                  <Input
                    placeholder={t('tools.swot.projectName')}
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="text-center text-lg font-medium"
                  />
                </CardContent>
              </Card>

              {/* SWOT Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <Card key={category.key} className={`${category.borderColor} ${category.bgColor} border-2`}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Icon className={`w-5 h-5 ${category.iconColor}`} />
                          {category.title}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground">{category.subtitle}</p>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-2 mb-4">
                          <Input
                            placeholder={t('tools.swot.addItem')}
                            value={inputs[category.key]}
                            onChange={(e) => setInputs(prev => ({ ...prev, [category.key]: e.target.value }))}
                            onKeyDown={(e) => e.key === 'Enter' && addItem(category.key)}
                            className="flex-1"
                          />
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => addItem(category.key)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="flex flex-wrap gap-2 min-h-[80px]">
                          {swot[category.key].length === 0 ? (
                            <p className="text-sm text-muted-foreground italic">
                              {t('tools.swot.empty')}
                            </p>
                          ) : (
                            swot[category.key].map((item, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className={`${category.badgeClass} pr-1 flex items-center gap-1`}
                              >
                                {item}
                                <button
                                  onClick={() => removeItem(category.key, index)}
                                  className="ml-1 hover:bg-black/10 rounded p-0.5"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </Badge>
                            ))
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Right Column - Results */}
            <div className="lg:sticky lg:top-20 h-fit">
              <Card className="bg-slate-900 text-white border-0">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Grid3X3 className="w-5 h-5 text-orange-400" />
                    Resumo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-emerald-500/20">
                      <p className="text-xs text-emerald-300">Forças</p>
                      <p className="text-2xl font-bold text-emerald-400">{swot.strengths.length}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-red-500/20">
                      <p className="text-xs text-red-300">Fraquezas</p>
                      <p className="text-2xl font-bold text-red-400">{swot.weaknesses.length}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-blue-500/20">
                      <p className="text-xs text-blue-300">Oportunidades</p>
                      <p className="text-2xl font-bold text-blue-400">{swot.opportunities.length}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-amber-500/20">
                      <p className="text-xs text-amber-300">Ameaças</p>
                      <p className="text-2xl font-bold text-amber-400">{swot.threats.length}</p>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="p-3 rounded-lg bg-white/5 space-y-2 text-xs">
                    <p className="font-medium text-white mb-2">Como usar:</p>
                    <ul className="space-y-1 text-slate-300">
                      <li>• <strong className="text-emerald-400">Forças:</strong> O que você faz bem internamente</li>
                      <li>• <strong className="text-red-400">Fraquezas:</strong> Onde você pode melhorar</li>
                      <li>• <strong className="text-blue-400">Oportunidades:</strong> Fatores externos favoráveis</li>
                      <li>• <strong className="text-amber-400">Ameaças:</strong> Riscos externos ao negócio</li>
                    </ul>
                  </div>

                  {/* Legend */}
                  <div className="p-3 rounded-lg bg-white/5 space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-slate-300">{t('tools.swot.legend.internal')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="text-slate-300">{t('tools.swot.legend.external')}</span>
                    </div>
                  </div>

                  <Button 
                    onClick={() => {
                      generatePDF();
                      trackDownload('pdf');
                    }} 
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                    disabled={!hasData}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {t('tools.swot.download')}
                  </Button>

                  <Button 
                    variant="outline" 
                    className="w-full border-slate-500 text-white bg-slate-700 hover:bg-slate-600"
                    onClick={() => navigate('/auth?view=signup')}
                  >
                    Encontrar Sócio
                  </Button>
                </CardContent>
              </Card>

              <ToolTipsBox toolId="swot" />
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-8 p-4 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
            <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
              ⚠️ {t("tools.swot.disclaimer", "Esta análise SWOT é apenas para fins educacionais e de planejamento estratégico. Os resultados são indicativos e não substituem consultoria profissional.")}
            </p>
          </div>
        </div>
      </ToolPageLayout>
    </>
  );
};

export default SwotAnalysis;
