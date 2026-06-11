import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { 
  Scissors, Users, Cloud, Megaphone as MegaphoneIcon, Building, Package, TrendingDown, 
  Lightbulb, AlertTriangle, CheckCircle, Share2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

import { ToolPageLayout } from '@/components/tools/ToolPageLayout';
import { useToolTracking } from '@/hooks/useToolTracking';
import { ToolHelpTooltip, ToolTipsBox } from '@/components/tools/ToolHelpTooltip';

type Industry = 'saas' | 'ecommerce' | 'fintech' | 'marketplace' | 'other';
type Category = 'people' | 'infrastructure' | 'marketing' | 'operational' | 'other';

const BENCHMARKS: Record<Industry, Record<Category, { min: number; max: number }>> = {
  saas: {
    people: { min: 50, max: 60 },
    infrastructure: { min: 15, max: 25 },
    marketing: { min: 15, max: 25 },
    operational: { min: 5, max: 10 },
    other: { min: 5, max: 10 },
  },
  ecommerce: {
    people: { min: 40, max: 50 },
    infrastructure: { min: 10, max: 15 },
    marketing: { min: 25, max: 35 },
    operational: { min: 10, max: 15 },
    other: { min: 5, max: 10 },
  },
  fintech: {
    people: { min: 55, max: 65 },
    infrastructure: { min: 20, max: 30 },
    marketing: { min: 10, max: 20 },
    operational: { min: 10, max: 15 },
    other: { min: 5, max: 10 },
  },
  marketplace: {
    people: { min: 45, max: 55 },
    infrastructure: { min: 15, max: 20 },
    marketing: { min: 20, max: 30 },
    operational: { min: 8, max: 12 },
    other: { min: 5, max: 10 },
  },
  other: {
    people: { min: 45, max: 55 },
    infrastructure: { min: 15, max: 20 },
    marketing: { min: 15, max: 25 },
    operational: { min: 10, max: 15 },
    other: { min: 5, max: 10 },
  },
};

const CATEGORY_ICONS: Record<Category, typeof Users> = {
  people: Users,
  infrastructure: Cloud,
  marketing: MegaphoneIcon,
  operational: Building,
  other: Package,
};

const CATEGORY_COLORS: Record<Category, string> = {
  people: '#6D28D9',
  infrastructure: '#3B82F6',
  marketing: '#F59E0B',
  operational: '#10B981',
  other: '#8B5CF6',
};

const BurnRateOptimizer = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'pt' | 'en' | 'es';
  const { trackCalculation, trackShare } = useToolTracking('burn-rate-optimizer');
  
  const [industry, setIndustry] = useState<Industry>('saas');
  const [expenses, setExpenses] = useState({
    people: 30000,
    infrastructure: 8000,
    marketing: 7000,
    operational: 3000,
    other: 2000,
  });
  const [runway, setRunway] = useState(12);

  const totalBurn = useMemo(() => {
    return Object.values(expenses).reduce((sum, val) => sum + val, 0);
  }, [expenses]);

  const percentages = useMemo(() => {
    if (totalBurn === 0) return { people: 0, infrastructure: 0, marketing: 0, operational: 0, other: 0 };
    return {
      people: (expenses.people / totalBurn) * 100,
      infrastructure: (expenses.infrastructure / totalBurn) * 100,
      marketing: (expenses.marketing / totalBurn) * 100,
      operational: (expenses.operational / totalBurn) * 100,
      other: (expenses.other / totalBurn) * 100,
    };
  }, [expenses, totalBurn]);

  const benchmarks = BENCHMARKS[industry];

  const categoryStatus = useMemo(() => {
    const categories: Category[] = ['people', 'infrastructure', 'marketing', 'operational', 'other'];
    return categories.map(cat => {
      const pct = percentages[cat];
      const bench = benchmarks[cat];
      const isAbove = pct > bench.max;
      const isBelow = pct < bench.min;
      const isWithin = !isAbove && !isBelow;
      const savings = isAbove ? expenses[cat] * ((pct - bench.max) / 100) : 0;
      return { category: cat, percentage: pct, benchmark: bench, isAbove, isBelow, isWithin, savings };
    });
  }, [percentages, benchmarks, expenses]);

  const efficiencyScore = useMemo(() => {
    let score = 100;
    categoryStatus.forEach(status => {
      if (status.isAbove) {
        const overBy = status.percentage - status.benchmark.max;
        score -= Math.min(overBy * 2, 25);
      }
    });
    return Math.max(0, Math.round(score));
  }, [categoryStatus]);

  const totalPotentialSavings = useMemo(() => {
    return categoryStatus.reduce((sum, status) => sum + status.savings, 0);
  }, [categoryStatus]);

  const runwayExtension = useMemo(() => {
    if (totalBurn === 0 || totalPotentialSavings === 0) return 0;
    const currentCash = totalBurn * runway;
    const newBurn = totalBurn - totalPotentialSavings;
    if (newBurn <= 0) return 99;
    return (currentCash / newBurn) - runway;
  }, [totalBurn, totalPotentialSavings, runway]);

  const pieData = useMemo(() => {
    return Object.entries(expenses).map(([key, value]) => ({
      name: key,
      value,
      color: CATEGORY_COLORS[key as Category],
    }));
  }, [expenses]);

  const updateExpense = (category: Category, value: string) => {
    const numValue = parseInt(value) || 0;
    setExpenses(prev => ({ ...prev, [category]: numValue }));
    trackCalculation({ category, value: numValue, industry });
  };

  const getScoreColor = () => {
    if (efficiencyScore >= 80) return 'text-green-500';
    if (efficiencyScore >= 60) return 'text-amber-500';
    return 'text-red-500';
  };

  const shareResults = () => {
    const text = `Burn Rate: R$ ${totalBurn.toLocaleString('pt-BR')}/mês\nScore: ${efficiencyScore}/100\nPotencial de economia: R$ ${Math.round(totalPotentialSavings).toLocaleString('pt-BR')}/mês`;
    navigator.clipboard.writeText(text);
    toast.success(lang === 'pt' ? 'Copiado!' : lang === 'es' ? '¡Copiado!' : 'Copied!');
  };

  const getCategoryLabel = (cat: Category) => {
    const labels: Record<string, Record<Category, string>> = {
      pt: { people: 'Pessoas', infrastructure: 'Infraestrutura', marketing: 'Marketing', operational: 'Operacional', other: 'Outros' },
      en: { people: 'People', infrastructure: 'Infrastructure', marketing: 'Marketing', operational: 'Operational', other: 'Other' },
      es: { people: 'Personas', infrastructure: 'Infraestructura', marketing: 'Marketing', operational: 'Operacional', other: 'Otros' },
    };
    return labels[lang]?.[cat] || labels.en[cat];
  };

  return (
    <ToolPageLayout
      toolId="burn-rate"
      icon={Scissors}
      iconColor="text-red-500"
      iconBgColor="bg-red-500/10"
    >
      <Helmet>
        <title>{t('burnRate.pageTitle')} | Guilda</title>
        <meta name="description" content={t('burnRate.pageDescription')} />
        <meta name="keywords" content="burn rate optimizer, startup costs, cost cutting, runway extension, expense management" />
        <link rel="canonical" href="https://www.guilda.app.br/ferramentas-empreendedores/burn-rate-optimizer" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": t('burnRate.title'),
            "description": t('burnRate.pageDescription'),
            "url": "https://www.guilda.app.br/ferramentas-empreendedores/burn-rate-optimizer",
            "applicationCategory": "BusinessApplication",
            "offers": { "@type": "Offer", "price": "0", "priceCurrency": "BRL" }
          })}
        </script>
      </Helmet>

      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column: Inputs */}
          <div className="lg:col-span-2 space-y-6">
            {/* Config */}
            <div className="bg-white rounded-2xl border border-black/10 p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
              
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex-1 min-w-[200px]">
                  <Label className="text-sm text-muted-foreground">
                    {lang === 'pt' ? 'Setor' : lang === 'es' ? 'Sector' : 'Industry'}
                  </Label>
                  <Select value={industry} onValueChange={(v) => setIndustry(v as Industry)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="saas">SaaS</SelectItem>
                      <SelectItem value="ecommerce">E-commerce</SelectItem>
                      <SelectItem value="fintech">Fintech</SelectItem>
                      <SelectItem value="marketplace">Marketplace</SelectItem>
                      <SelectItem value="other">{lang === 'pt' ? 'Outro' : lang === 'es' ? 'Otro' : 'Other'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-32">
                  <Label className="text-sm text-muted-foreground">Runway</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      type="number"
                      value={runway}
                      onChange={(e) => setRunway(parseInt(e.target.value) || 0)}
                      min={1}
                      max={60}
                      className="h-10"
                    />
                    <span className="text-sm text-muted-foreground">
                      {lang === 'pt' ? 'meses' : lang === 'es' ? 'meses' : 'mo'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Category Inputs */}
              <div className="space-y-4">
                {categoryStatus.map((status) => {
                  const Icon = CATEGORY_ICONS[status.category];
                  return (
                    <div key={status.category} className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Icon className="w-5 h-5" style={{ color: CATEGORY_COLORS[status.category] }} />
                          <span className="font-medium text-foreground">{getCategoryLabel(status.category)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {status.isWithin && (
                            <Badge variant="outline" className="text-green-600 border-green-500/50 text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />OK
                            </Badge>
                          )}
                          {status.isAbove && (
                            <Badge variant="destructive" className="text-xs">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              {lang === 'pt' ? 'Acima' : lang === 'es' ? 'Arriba' : 'Above'}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="relative w-32">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
                          <Input
                            type="number"
                            value={expenses[status.category]}
                            onChange={(e) => updateExpense(status.category, e.target.value)}
                            className="pl-10"
                          />
                        </div>
                        <div className="flex-1">
                          <Progress value={Math.min(status.percentage, 100)} className="h-2" />
                          <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>{status.percentage.toFixed(0)}%</span>
                            <span>Benchmark: {status.benchmark.min}-{status.benchmark.max}%</span>
                          </div>
                        </div>
                      </div>
                      {status.isAbove && status.savings > 0 && (
                        <div className="text-sm text-amber-600 flex items-center gap-1 mt-2">
                          <Lightbulb className="w-4 h-4" />
                          {lang === 'pt' ? 'Economia potencial' : lang === 'es' ? 'Ahorro potencial' : 'Potential savings'}: R$ {Math.round(status.savings).toLocaleString('pt-BR')}/mês
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Results (Sticky) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-black text-white rounded-2xl p-8 relative overflow-hidden">

              
              <div className="flex items-center justify-between mb-6 relative z-10">
                <h2 className="text-lg font-bold text-center flex-1">
                  {lang === 'pt' ? 'Score de Eficiência' : lang === 'es' ? 'Score de Eficiencia' : 'Efficiency Score'}
                </h2>
                <ToolHelpTooltip toolId="burn-rate" variant="results" />
              </div>
              
              {/* Score */}
              <div className="text-center mb-6 relative z-10">
                <div className={`text-7xl font-extrabold ${getScoreColor()}`}>
                  {efficiencyScore}
                </div>
                <p className="text-background/60 mt-2">/100</p>
              </div>

              {/* Pie Chart */}
              <div className="h-48 mb-6 relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Metrics */}
              <div className="space-y-3 mb-8 relative z-10">
                <div className="flex justify-between items-center p-3 bg-background/5 rounded-lg border border-background/10">
                  <span className="text-sm text-background/60">Burn Rate</span>
                  <span className="font-mono font-bold text-red-400">
                    R$ {totalBurn.toLocaleString('pt-BR')}/mês
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                  <span className="text-sm text-green-400">
                    {lang === 'pt' ? 'Economia Potencial' : lang === 'es' ? 'Ahorro Potencial' : 'Potential Savings'}
                  </span>
                  <span className="font-mono font-bold text-green-400">
                    R$ {Math.round(totalPotentialSavings).toLocaleString('pt-BR')}/mês
                  </span>
                </div>
                {runwayExtension > 0 && (
                  <div className="flex justify-between items-center p-3 bg-background/5 rounded-lg border border-background/10">
                    <span className="text-sm text-background/60">
                      {lang === 'pt' ? 'Runway Extra' : lang === 'es' ? 'Runway Extra' : 'Extra Runway'}
                    </span>
                    <span className="font-mono font-bold text-cyan-400">
                      +{runwayExtension.toFixed(1)} {lang === 'pt' ? 'meses' : lang === 'es' ? 'meses' : 'months'}
                    </span>
                  </div>
                )}
              </div>

              {/* CTAs */}
              <div className="text-center relative z-10">
                <p className="text-xs text-background/60 mb-4 px-2">
                  {lang === 'pt' 
                    ? 'Otimizar custos é só o começo. Com um sócio certo, você pode crescer mais rápido.'
                    : lang === 'es'
                    ? 'Optimizar costos es solo el comienzo. Con el socio correcto, puedes crecer más rápido.'
                    : 'Optimizing costs is just the beginning. With the right partner, you can grow faster.'}
                </p>
                <Link to="/auth?view=signup">
                  <button className="w-full bg-background text-foreground font-bold py-3 rounded-xl hover:bg-red-50 transition-colors flex items-center justify-center gap-2 mb-3">
                    <TrendingDown className="w-4 h-4 text-red-600" />
                    {lang === 'pt' ? 'Encontrar Co-Founder' : lang === 'es' ? 'Encontrar Co-Founder' : 'Find Co-Founder'}
                  </button>
                </Link>
                {/* Share buttons removed */}
              </div>

              {/* Tips Box */}
              <ToolTipsBox toolId="burn-rate" />
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 p-4 bg-gray-50 border border-black/10 rounded-2xl">
          <p className="text-sm text-gray-500 text-center">
            ⚠️ {t("tools.burn-rate.disclaimer", "Esta calculadora é apenas para fins educacionais. Os resultados são estimativas e não substituem análise financeira profissional.")}
          </p>
        </div>
      </div>
    </ToolPageLayout>
  );
};

export default BurnRateOptimizer;
