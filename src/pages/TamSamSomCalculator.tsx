import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Target, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

import { ToolPageLayout } from '@/components/tools/ToolPageLayout';
import { ToolHelpTooltip, ToolTipsBox } from '@/components/tools/ToolHelpTooltip';
import { useToolTracking } from '@/hooks/useToolTracking';

const TamSamSomCalculator = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { trackCalculation } = useToolTracking('tam-sam-som');
  
  const [inputs, setInputs] = useState({
    totalMarketSize: 1000000000,
    targetRegionPercent: 10,
    targetSegmentPercent: 25,
    reachablePercent: 5,
    averageTicket: 100,
    potentialCustomers: 1000,
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      notation: value >= 1000000000 ? 'compact' : 'standard',
      maximumFractionDigits: 2,
    }).format(value);
  };

  const calculations = useMemo(() => {
    const tam = inputs.totalMarketSize;
    const sam = tam * (inputs.targetRegionPercent / 100) * (inputs.targetSegmentPercent / 100);
    const som = sam * (inputs.reachablePercent / 100);
    const somBottomUp = inputs.averageTicket * inputs.potentialCustomers * 12;

    return { tam, sam, som, somBottomUp };
  }, [inputs]);

  const chartData = [
    { name: 'TAM', value: calculations.tam, color: '#8b5cf6' },
    { name: 'SAM', value: calculations.sam, color: '#3b82f6' },
    { name: 'SOM', value: calculations.som, color: '#22c55e' },
  ].filter(item => item.value > 0);

  const updateInput = (field: string, value: number) => {
    setInputs(prev => ({ ...prev, [field]: value }));
    trackCalculation({ field, value });
  };

  return (
    <ToolPageLayout
      toolId="tam-sam-som"
      icon={Target}
      iconColor="text-cyan-500"
      iconBgColor="bg-cyan-500/10"
    >
      <Helmet>
        <title>{t('tools.tam-sam-som.title')} | Guilda</title>
        <meta name="description" content={t('tools.tam-sam-som.description')} />
        <link rel="canonical" href="https://www.guilda.app.br/ferramentas-empreendedores/tam-sam-som" />
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Inputs */}
          <div className="lg:col-span-2 space-y-6">
            {/* TAM Input */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">TAM</span>
                  {t('tools.tam-sam-som.tam.title')}
                </CardTitle>
                <CardDescription>{t('tools.tam-sam-som.tam.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <Label>{t('tools.tam-sam-som.tam.input')}</Label>
                <div className="flex items-center gap-4 mt-2">
                  <Slider
                    value={[inputs.totalMarketSize]}
                    onValueChange={([v]) => updateInput('totalMarketSize', v)}
                    min={1000000}
                    max={10000000000}
                    step={1000000}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-32 text-right">{formatCurrency(inputs.totalMarketSize)}</span>
                </div>
              </CardContent>
            </Card>

            {/* SAM Inputs */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-500">SAM</span>
                  {t('tools.tam-sam-som.sam.title')}
                </CardTitle>
                <CardDescription>{t('tools.tam-sam-som.sam.description')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>{t('tools.tam-sam-som.sam.regionPercent')}: {inputs.targetRegionPercent}%</Label>
                  <Slider
                    value={[inputs.targetRegionPercent]}
                    onValueChange={([v]) => updateInput('targetRegionPercent', v)}
                    min={1}
                    max={100}
                    step={1}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>{t('tools.tam-sam-som.sam.segmentPercent')}: {inputs.targetSegmentPercent}%</Label>
                  <Slider
                    value={[inputs.targetSegmentPercent]}
                    onValueChange={([v]) => updateInput('targetSegmentPercent', v)}
                    min={1}
                    max={100}
                    step={1}
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>

            {/* SOM Inputs */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs font-bold text-emerald-500">SOM</span>
                  {t('tools.tam-sam-som.som.title')}
                </CardTitle>
                <CardDescription>{t('tools.tam-sam-som.som.description')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>{t('tools.tam-sam-som.som.reachablePercent')}: {inputs.reachablePercent}%</Label>
                  <Slider
                    value={[inputs.reachablePercent]}
                    onValueChange={([v]) => updateInput('reachablePercent', v)}
                    min={1}
                    max={50}
                    step={1}
                    className="mt-2"
                  />
                </div>
                <div className="border-t pt-4">
                  <p className="text-sm text-muted-foreground mb-4">{t('tools.tam-sam-som.som.bottomUp')}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>{t('tools.tam-sam-som.som.avgTicket')}</Label>
                      <Input
                        type="number"
                        value={inputs.averageTicket}
                        onChange={(e) => updateInput('averageTicket', Number(e.target.value))}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>{t('tools.tam-sam-som.som.customers')}</Label>
                      <Input
                        type="number"
                        value={inputs.potentialCustomers}
                        onChange={(e) => updateInput('potentialCustomers', Number(e.target.value))}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Info Box - TAM SAM SOM explanation */}
            <Card className="border-amber-500/20 bg-amber-500/5">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground mb-2">{t('tools.tam-sam-som.info.title')}</p>
                    <ul className="space-y-1">
                      <li>• <strong>TAM:</strong> {t('tools.tam-sam-som.info.tam')}</li>
                      <li>• <strong>SAM:</strong> {t('tools.tam-sam-som.info.sam')}</li>
                      <li>• <strong>SOM:</strong> {t('tools.tam-sam-som.info.som')}</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:sticky lg:top-20 h-fit space-y-6">
            <Card className="bg-black text-white border-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-cyan-400" />
                    {t('tools.tam-sam-som.results.title')}
                  </CardTitle>
                  <ToolHelpTooltip toolId="tam-sam-som" variant="results" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {chartData.length > 0 && (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}

                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-primary/20">
                    <p className="text-xs text-background/60">TAM</p>
                    <p className="text-xl font-bold text-primary">{formatCurrency(calculations.tam)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-500/20">
                    <p className="text-xs text-background/60">SAM</p>
                    <p className="text-xl font-bold text-blue-400">{formatCurrency(calculations.sam)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-emerald-500/20">
                    <p className="text-xs text-background/60">SOM</p>
                    <p className="text-xl font-bold text-emerald-400">{formatCurrency(calculations.som)}</p>
                    {calculations.somBottomUp > 0 && (
                      <p className="text-xs text-background/40 mt-1">
                        Bottom-up: {formatCurrency(calculations.somBottomUp)}/ano
                      </p>
                    )}
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full border-white/30 text-white bg-transparent hover:bg-white/10"
                  onClick={() => navigate('/auth?view=signup')}
                >
                  Encontrar Co-Founder
                </Button>
              </CardContent>
            </Card>

            <ToolTipsBox toolId="tam-sam-som" />

            {/* SaveCalculationCTA removed */}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 p-4 bg-gray-50 border border-black/10 rounded-2xl">
          <p className="text-sm text-gray-500 text-center">
            ⚠️ {t("tools.tam-sam-som.disclaimer", "Esta calculadora é apenas para fins educacionais. Os resultados são estimativas e não substituem pesquisa de mercado profissional.")}
          </p>
        </div>
      </div>
    </ToolPageLayout>
  );
};

export default TamSamSomCalculator;
