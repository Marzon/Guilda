import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, DollarSign, Calculator, Award, Building2, Info, Share2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import { useAuth } from '@/hooks/useAuth';
import SignupDialog from '@/components/tools/SignupDialog';

import { trackEvent } from '@/lib/analytics';
import { toast } from 'sonner';
import { ToolPageLayout } from '@/components/tools/ToolPageLayout';
import { useToolTracking } from '@/hooks/useToolTracking';
import { ToolHelpTooltip, ToolTipsBox } from '@/components/tools/ToolHelpTooltip';

const BERKUS_FACTORS = [
  { id: 'idea', maxValue: 500000 },
  { id: 'prototype', maxValue: 500000 },
  { id: 'team', maxValue: 500000 },
  { id: 'relationships', maxValue: 500000 },
  { id: 'sales', maxValue: 500000 },
];

const INDUSTRY_MULTIPLES: Record<string, { revenue: number; ebitda: number }> = {
  saas: { revenue: 8, ebitda: 15 },
  ecommerce: { revenue: 2, ebitda: 10 },
  fintech: { revenue: 6, ebitda: 12 },
  healthtech: { revenue: 5, ebitda: 11 },
  marketplace: { revenue: 4, ebitda: 10 },
  edtech: { revenue: 3, ebitda: 8 },
  other: { revenue: 3, ebitda: 8 },
};

const ValuationCalculator = () => {
  const { t, i18n } = useTranslation();
  const { data: auth } = useAuth();
  const [showSignupDialog, setShowSignupDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('dcf');
  const [visitedTabs, setVisitedTabs] = useState<Set<string>>(new Set(['dcf']));
  const lang = i18n.language as 'pt' | 'en' | 'es';
  const { trackCalculation, trackShare } = useToolTracking('valuation-calculator');

  const handleTabChange = (newTab: string) => {
    if (visitedTabs.size >= 1 && !visitedTabs.has(newTab) && !auth?.user) {
      trackEvent('soft_gate_triggered', 'tools', 'valuation_method');
      setShowSignupDialog(true);
      return;
    }
    setVisitedTabs(prev => new Set([...prev, newTab]));
    setActiveTab(newTab);
  };

  // DCF State
  const [dcfInputs, setDcfInputs] = useState({
    currentRevenue: 100000,
    growthYear1: 100,
    growthYear2: 80,
    growthYear3: 60,
    growthYear4: 40,
    growthYear5: 30,
    profitMargin: 20,
    discountRate: 25,
    terminalGrowth: 3,
  });

  // Comparables State
  const [compInputs, setCompInputs] = useState({
    annualRevenue: 500000,
    ebitda: 100000,
    industry: 'saas',
  });

  // Berkus State
  const [berkusFactors, setBerkusFactors] = useState<Record<string, number>>({
    idea: 250000,
    prototype: 250000,
    team: 250000,
    relationships: 250000,
    sales: 0,
  });

  // DCF Calculation
  const calculateDCF = () => {
    const revenues = [];
    let revenue = dcfInputs.currentRevenue;
    const growthRates = [
      dcfInputs.growthYear1,
      dcfInputs.growthYear2,
      dcfInputs.growthYear3,
      dcfInputs.growthYear4,
      dcfInputs.growthYear5,
    ];

    for (let i = 0; i < 5; i++) {
      revenue = revenue * (1 + growthRates[i] / 100);
      revenues.push(revenue);
    }

    const cashFlows = revenues.map(r => r * (dcfInputs.profitMargin / 100));
    const discountedCashFlows = cashFlows.map((cf, i) => 
      cf / Math.pow(1 + dcfInputs.discountRate / 100, i + 1)
    );

    const terminalValue = (cashFlows[4] * (1 + dcfInputs.terminalGrowth / 100)) / 
      ((dcfInputs.discountRate - dcfInputs.terminalGrowth) / 100);
    const discountedTerminalValue = terminalValue / Math.pow(1 + dcfInputs.discountRate / 100, 5);

    const totalValue = discountedCashFlows.reduce((a, b) => a + b, 0) + discountedTerminalValue;

    return {
      revenues,
      cashFlows,
      discountedCashFlows,
      terminalValue,
      discountedTerminalValue,
      totalValue,
    };
  };

  // Comparables Calculation
  const calculateComparables = () => {
    const multiples = INDUSTRY_MULTIPLES[compInputs.industry];
    const revenueValuation = compInputs.annualRevenue * multiples.revenue;
    const ebitdaValuation = compInputs.ebitda * multiples.ebitda;
    const averageValuation = (revenueValuation + ebitdaValuation) / 2;

    return {
      revenueMultiple: multiples.revenue,
      ebitdaMultiple: multiples.ebitda,
      revenueValuation,
      ebitdaValuation,
      averageValuation,
    };
  };

  // Berkus Calculation
  const calculateBerkus = () => {
    const total = Object.values(berkusFactors).reduce((a, b) => a + b, 0);
    return {
      factors: Object.entries(berkusFactors).map(([key, value]) => ({
        name: t(`valuation.berkus.factors.${key}`),
        value,
        maxValue: BERKUS_FACTORS.find(f => f.id === key)?.maxValue || 500000,
      })),
      total,
    };
  };

  const dcfResults = calculateDCF();
  const compResults = calculateComparables();
  const berkusResults = calculateBerkus();

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `R$ ${(value / 1000000).toFixed(2)}M`;
    }
    if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(0)}K`;
    }
    return `R$ ${value.toFixed(0)}`;
  };

  const valuationComparison = [
    { name: 'DCF', value: dcfResults.totalValue, color: '#6D28D9' },
    { name: lang === 'pt' ? 'Comparáveis' : lang === 'es' ? 'Comparables' : 'Comparables', value: compResults.averageValuation, color: '#06B6D4' },
    { name: 'Berkus', value: berkusResults.total, color: '#10B981' },
  ];

  const shareResults = () => {
    const text = `Valuation: DCF ${formatCurrency(dcfResults.totalValue)}, Comparáveis ${formatCurrency(compResults.averageValuation)}, Berkus ${formatCurrency(berkusResults.total)}`;
    navigator.clipboard.writeText(text);
    toast.success(lang === 'pt' ? 'Copiado!' : lang === 'es' ? '¡Copiado!' : 'Copied!');
  };

  const tabs = [
    { id: 'dcf', label: 'DCF', icon: DollarSign },
    { id: 'comparables', label: lang === 'pt' ? 'Comparáveis' : lang === 'es' ? 'Comparables' : 'Comparables', icon: Building2 },
    { id: 'berkus', label: 'Berkus', icon: Award },
  ];

  return (
    <TooltipProvider>
      <Helmet>
        <title>{t('valuation.pageTitle')} | Guilda</title>
        <meta name="description" content={t('valuation.pageDescription')} />
        <meta name="keywords" content="calculadora valuation startup, DCF startup, método berkus, múltiplos comparáveis, avaliação empresa" />
        <link rel="canonical" href="https://www.guilda.app.br/ferramentas-empreendedores/valuation-calculator" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": t('valuation.pageTitle'),
            "description": t('valuation.pageDescription'),
            "url": "https://www.guilda.app.br/ferramentas-empreendedores/valuation-calculator",
            "applicationCategory": "BusinessApplication",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "BRL"
            }
          })}
        </script>
      </Helmet>

      <ToolPageLayout toolId="valuation-calculator" icon={TrendingUp} iconColor="text-purple-500" iconBgColor="bg-purple-500/10">
        <div className="max-w-7xl mx-auto p-4 md:p-8">

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column: Tabs & Inputs */}
            <div className="lg:col-span-2 space-y-6">
              {/* Method Tabs */}
              <div className="flex gap-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        isActive 
                          ? 'bg-[#7610DC] text-white' 
                          : 'bg-white border border-black/10 text-gray-500 hover:border-[#7610DC]/30'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* DCF Panel */}
              {activeTab === 'dcf' && (
                <div className="bg-white rounded-2xl border border-black/10 p-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#7610DC]" />
                  
                  <div className="flex items-center gap-2 mb-6">
                    <h3 className="font-bold text-black">DCF - Discounted Cash Flow</h3>
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger asChild>
                        <button type="button" className="inline-flex items-center justify-center">
                          <Info className="w-4 h-4 text-slate-400 hover:text-slate-600 cursor-help" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs bg-popover text-popover-foreground">
                        {t('valuation.dcf.tooltip')}
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-500 font-medium">
                          {lang === 'pt' ? 'Receita Atual Anual' : lang === 'es' ? 'Ingresos Actuales Anuales' : 'Current Annual Revenue'}
                        </span>
                        <span className="font-bold text-[#7610DC]">
                          {formatCurrency(dcfInputs.currentRevenue)}
                        </span>
                      </div>
                      <Slider
                        value={[dcfInputs.currentRevenue]}
                        onValueChange={([value]) => {
                          setDcfInputs({ ...dcfInputs, currentRevenue: value });
                          trackCalculation({ method: 'dcf', field: 'currentRevenue', value });
                        }}
                        min={10000}
                        max={2000000}
                        step={10000}
                        className="w-full"
                      />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {[1, 2, 3, 4, 5].map((year) => (
                        <div key={year}>
                          <Label className="text-xs text-gray-500">
                            {lang === 'pt' ? `Crescimento Ano ${year}` : lang === 'es' ? `Crecimiento Año ${year}` : `Year ${year} Growth`}
                          </Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Input
                              type="number"
                              value={dcfInputs[`growthYear${year}` as keyof typeof dcfInputs]}
                              onChange={(e) => {
                                setDcfInputs({ ...dcfInputs, [`growthYear${year}`]: Number(e.target.value) });
                                trackCalculation({ method: 'dcf', field: `growthYear${year}`, value: Number(e.target.value) });
                              }}
                              className="h-8 text-sm"
                            />
                            <span className="text-sm text-gray-400">%</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-500 font-medium text-xs">
                            {lang === 'pt' ? 'Margem de Lucro' : lang === 'es' ? 'Margen de Lucro' : 'Profit Margin'}
                          </span>
                          <span className="font-bold text-gray-500 text-xs">{dcfInputs.profitMargin}%</span>
                        </div>
                        <Slider
                          value={[dcfInputs.profitMargin]}
                          onValueChange={([value]) => {
                            setDcfInputs({ ...dcfInputs, profitMargin: value });
                            trackCalculation({ method: 'dcf', field: 'profitMargin', value });
                          }}
                          min={0}
                          max={50}
                          step={1}
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-500 font-medium text-xs">
                            {lang === 'pt' ? 'Taxa de Desconto' : lang === 'es' ? 'Tasa de Descuento' : 'Discount Rate'}
                          </span>
                          <span className="font-bold text-gray-500 text-xs">{dcfInputs.discountRate}%</span>
                        </div>
                        <Slider
                          value={[dcfInputs.discountRate]}
                          onValueChange={([value]) => {
                            setDcfInputs({ ...dcfInputs, discountRate: value });
                            trackCalculation({ method: 'dcf', field: 'discountRate', value });
                          }}
                          min={10}
                          max={50}
                          step={1}
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-500 font-medium text-xs">
                            {lang === 'pt' ? 'Cresc. Terminal' : lang === 'es' ? 'Crec. Terminal' : 'Terminal Growth'}
                          </span>
                          <span className="font-bold text-gray-500 text-xs">{dcfInputs.terminalGrowth}%</span>
                        </div>
                        <Slider
                          value={[dcfInputs.terminalGrowth]}
                          onValueChange={([value]) => {
                            setDcfInputs({ ...dcfInputs, terminalGrowth: value });
                            trackCalculation({ method: 'dcf', field: 'terminalGrowth', value });
                          }}
                          min={0}
                          max={10}
                          step={0.5}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Comparables Panel */}
              {activeTab === 'comparables' && (
                <div className="bg-white rounded-2xl border border-black/10 p-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500" />
                  
                  <div className="flex items-center gap-2 mb-6">
                    <h3 className="font-bold text-black">
                      {lang === 'pt' ? 'Múltiplos Comparáveis' : lang === 'es' ? 'Múltiplos Comparables' : 'Comparable Multiples'}
                    </h3>
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger asChild>
                        <button type="button" className="inline-flex items-center justify-center">
                          <Info className="w-4 h-4 text-slate-400 hover:text-slate-600 cursor-help" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs bg-popover text-popover-foreground">
                        {t('valuation.comparables.tooltip')}
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <Label className="text-sm text-gray-500">
                        {lang === 'pt' ? 'Setor' : lang === 'es' ? 'Sector' : 'Industry'}
                      </Label>
                      <Select
                        value={compInputs.industry}
                        onValueChange={(value) => setCompInputs({ ...compInputs, industry: value })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="saas">SaaS</SelectItem>
                          <SelectItem value="ecommerce">E-commerce</SelectItem>
                          <SelectItem value="fintech">Fintech</SelectItem>
                          <SelectItem value="healthtech">Healthtech</SelectItem>
                          <SelectItem value="marketplace">Marketplace</SelectItem>
                          <SelectItem value="edtech">Edtech</SelectItem>
                          <SelectItem value="other">{lang === 'pt' ? 'Outro' : lang === 'es' ? 'Otro' : 'Other'}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-500 font-medium">
                          {lang === 'pt' ? 'Receita Anual' : lang === 'es' ? 'Ingresos Anuales' : 'Annual Revenue'}
                        </span>
                        <span className="font-bold text-cyan-600">{formatCurrency(compInputs.annualRevenue)}</span>
                      </div>
                      <Slider
                        value={[compInputs.annualRevenue]}
                        onValueChange={([value]) => {
                          setCompInputs({ ...compInputs, annualRevenue: value });
                          trackCalculation({ method: 'comparables', field: 'annualRevenue', value });
                        }}
                        min={50000}
                        max={5000000}
                        step={50000}
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-500 font-medium">EBITDA</span>
                        <span className="font-bold text-cyan-600">{formatCurrency(compInputs.ebitda)}</span>
                      </div>
                      <Slider
                        value={[compInputs.ebitda]}
                        onValueChange={([value]) => {
                          setCompInputs({ ...compInputs, ebitda: value });
                          trackCalculation({ method: 'comparables', field: 'ebitda', value });
                        }}
                        min={0}
                        max={1000000}
                        step={10000}
                      />
                    </div>

                    <div className="p-4 bg-gray-50 rounded-2xl">
                      <p className="text-xs text-gray-500 mb-2">
                        {lang === 'pt' ? 'Múltiplos utilizados' : lang === 'es' ? 'Múltiplos utilizados' : 'Multiples used'}
                      </p>
                      <div className="flex gap-6">
                        <div>
                          <span className="text-sm text-gray-500">Receita:</span>
                          <span className="font-bold ml-2">{compResults.revenueMultiple}x</span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">EBITDA:</span>
                          <span className="font-bold ml-2">{compResults.ebitdaMultiple}x</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Berkus Panel */}
              {activeTab === 'berkus' && (
                <div className="bg-white rounded-2xl border border-black/10 p-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
                  
                  <div className="flex items-center gap-2 mb-6">
                    <h3 className="font-bold text-black">
                      {lang === 'pt' ? 'Método Berkus' : lang === 'es' ? 'Método Berkus' : 'Berkus Method'}
                    </h3>
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger asChild>
                        <button type="button" className="inline-flex items-center justify-center">
                          <Info className="w-4 h-4 text-slate-400 hover:text-slate-600 cursor-help" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs bg-popover text-popover-foreground">
                        {t('valuation.berkus.tooltip')}
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  <p className="text-sm text-gray-500 mb-6">
                    {lang === 'pt' 
                      ? 'Ideal para startups pré-receita. Cada fator vale até R$ 500K.'
                      : lang === 'es'
                      ? 'Ideal para startups pre-ingresos. Cada factor vale hasta R$ 500K.'
                      : 'Ideal for pre-revenue startups. Each factor is worth up to R$ 500K.'}
                  </p>

                  <div className="space-y-6">
                    {BERKUS_FACTORS.map((factor) => (
                      <div key={factor.id}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Checkbox 
                              checked={berkusFactors[factor.id] > 0}
                              onCheckedChange={(checked) => 
                                setBerkusFactors({ 
                                  ...berkusFactors, 
                                  [factor.id]: checked ? factor.maxValue / 2 : 0 
                                })
                              }
                            />
                            <span className="text-sm text-gray-500 font-medium">
                              {t(`valuation.berkus.factors.${factor.id}`)}
                            </span>
                          </div>
                          <span className="text-sm font-bold text-emerald-600">
                            {formatCurrency(berkusFactors[factor.id])}
                          </span>
                        </div>
                        <Slider
                          value={[berkusFactors[factor.id]]}
                          onValueChange={([value]) => setBerkusFactors({ ...berkusFactors, [factor.id]: value })}
                          max={factor.maxValue}
                          step={50000}
                          disabled={berkusFactors[factor.id] === 0}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Results (Sticky) */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-black text-white rounded-2xl p-8 relative overflow-hidden">
                
                <div className="flex items-center justify-between mb-6 relative z-10">
                  <h2 className="text-lg font-bold text-center flex-1">
                    {lang === 'pt' ? 'Comparativo' : lang === 'es' ? 'Comparativo' : 'Comparison'}
                  </h2>
                  <ToolHelpTooltip toolId="valuation-calculator" variant="results" />
                </div>
                
                {/* Chart */}
                <div className="h-48 mb-6 relative z-10">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={valuationComparison} layout="vertical">
                      <XAxis type="number" hide />
                      <YAxis type="category" dataKey="name" width={80} tick={{ fill: '#94A3B8', fontSize: 12 }} />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {valuationComparison.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Values */}
                <div className="space-y-3 mb-8 relative z-10">
                  {valuationComparison.map((method) => (
                    <div key={method.name} className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: method.color }} />
                        <span className="text-sm">{method.name}</span>
                      </div>
                      <span className="font-mono font-bold">{formatCurrency(method.value)}</span>
                    </div>
                  ))}
                </div>

                {/* CTAs */}
                <div className="text-center relative z-10">
                  <p className="text-xs text-slate-400 mb-4 px-2">
                    {lang === 'pt' 
                      ? 'Valuation é só o começo. O próximo passo é encontrar quem vai ajudar a construir.'
                      : lang === 'es'
                      ? 'La valuación es solo el comienzo. El siguiente paso es encontrar quién te ayudará a construir.'
                      : 'Valuation is just the beginning. Next step is finding who will help you build.'}
                  </p>
                  <Link to="/auth?view=signup">
                    <button className="w-full bg-white text-slate-900 font-bold py-3 rounded-xl hover:bg-purple-50 transition-colors flex items-center justify-center gap-2 mb-3">
                      <Calculator className="w-4 h-4 text-purple-600" />
                      {lang === 'pt' ? 'Encontrar Co-Founder' : lang === 'es' ? 'Encontrar Co-Founder' : 'Find Co-Founder'}
                    </button>
                  </Link>
                  {/* Share buttons removed */}
                </div>

                {/* Tips Box */}
                <ToolTipsBox toolId="valuation-calculator" />
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-8 p-4 bg-white border border-slate-200 rounded-lg">
            <p className="text-sm text-slate-500 text-center">
              ⚠️ {t('valuation.disclaimer')}
            </p>
          </div>
        </div>
      </ToolPageLayout>

      <SignupDialog
        open={showSignupDialog}
        onOpenChange={setShowSignupDialog}
        feature="pdf"
        toolName="valuation"
      />
    </TooltipProvider>
  );
};

export default ValuationCalculator;
