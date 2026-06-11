import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { DollarSign, TrendingUp, Clock, AlertTriangle, CheckCircle, XCircle, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { toast } from 'sonner';

import { ToolPageLayout } from '@/components/tools/ToolPageLayout';
import { useToolTracking } from '@/hooks/useToolTracking';
import { ToolHelpTooltip, ToolTipsBox } from '@/components/tools/ToolHelpTooltip';

const UnitEconomicsCalculator = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'pt' | 'en' | 'es';
  const { trackCalculation, trackShare } = useToolTracking('unit-economics');
  
  const [arpu, setArpu] = useState<number>(100);
  const [churnRate, setChurnRate] = useState<number>(5);
  const [cac, setCac] = useState<number>(500);
  const [grossMargin, setGrossMargin] = useState<number>(70);

  const calculations = useMemo(() => {
    const monthlyChurn = churnRate / 100;
    const customerLifetimeMonths = monthlyChurn > 0 ? 1 / monthlyChurn : 999;
    const ltv = arpu * customerLifetimeMonths * (grossMargin / 100);
    const ltvCacRatio = cac > 0 ? ltv / cac : 0;
    const paybackMonths = (arpu * (grossMargin / 100)) > 0 ? cac / (arpu * (grossMargin / 100)) : 999;
    const monthlyProfit = arpu * (grossMargin / 100);
    
    return {
      ltv: Math.round(ltv),
      ltvCacRatio: Math.round(ltvCacRatio * 10) / 10,
      paybackMonths: Math.round(paybackMonths * 10) / 10,
      customerLifetimeMonths: Math.round(customerLifetimeMonths * 10) / 10,
      monthlyProfit: Math.round(monthlyProfit),
    };
  }, [arpu, churnRate, cac, grossMargin]);

  const getHealthStatus = () => {
    if (calculations.ltvCacRatio >= 3) {
      return { color: 'text-green-500', key: 'excellent' };
    } else if (calculations.ltvCacRatio >= 1) {
      return { color: 'text-amber-500', key: 'warning' };
    }
    return { color: 'text-red-500', key: 'critical' };
  };

  const status = getHealthStatus();

  const paybackData = useMemo(() => {
    const data = [];
    let cumulativeProfit = -cac;
    for (let month = 0; month <= Math.min(24, Math.ceil(calculations.paybackMonths * 1.5)); month++) {
      data.push({
        month,
        profit: Math.round(cumulativeProfit),
      });
      cumulativeProfit += calculations.monthlyProfit;
    }
    return data;
  }, [cac, calculations.monthlyProfit, calculations.paybackMonths]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const shareResults = () => {
    const text = `Unit Economics:\nLTV: ${formatCurrency(calculations.ltv)}\nCAC: ${formatCurrency(cac)}\nLTV:CAC: ${calculations.ltvCacRatio}x\nPayback: ${calculations.paybackMonths} meses`;
    navigator.clipboard.writeText(text);
    toast.success(lang === 'pt' ? 'Copiado!' : lang === 'es' ? '¡Copiado!' : 'Copied!');
  };

  return (
    <>
      <Helmet>
        <title>{t('unitEconomics.pageTitle')} | Guilda</title>
        <meta name="description" content={t('unitEconomics.pageDescription')} />
        <meta name="keywords" content="calculadora unit economics, ltv cac ratio, customer lifetime value, payback period startup, métricas saas" />
        <link rel="canonical" href="https://www.guilda.app.br/ferramentas-empreendedores/unit-economics" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": t('unitEconomics.pageTitle'),
            "description": t('unitEconomics.pageDescription'),
            "url": "https://www.guilda.app.br/ferramentas-empreendedores/unit-economics",
            "applicationCategory": "BusinessApplication",
            "offers": { "@type": "Offer", "price": "0", "priceCurrency": "BRL" }
          })}
        </script>
      </Helmet>

      <ToolPageLayout toolId="unit-economics" icon={DollarSign} iconColor="text-emerald-500" iconBgColor="bg-emerald-500/10">
        <div className="max-w-7xl mx-auto p-4 md:p-8">

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column: Inputs */}
            <div className="lg:col-span-2 space-y-6">
              {/* Inputs Card */}
              <div className="bg-white rounded-2xl border border-black/10 p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
                
                <h3 className="font-bold text-black mb-6">
                  {lang === 'pt' ? 'Métricas do Negócio' : lang === 'es' ? 'Métricas del Negocio' : 'Business Metrics'}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* ARPU */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-500 font-medium">ARPU (R$/mês)</span>
                      <span className="font-bold text-emerald-600">{formatCurrency(arpu)}</span>
                    </div>
                    <Slider
                      value={[arpu]}
                      onValueChange={(v) => {
                        setArpu(v[0]);
                        trackCalculation({ arpu: v[0], churnRate, cac, grossMargin });
                      }}
                      min={10}
                      max={1000}
                      step={10}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      {lang === 'pt' ? 'Receita média por usuário' : lang === 'es' ? 'Ingreso promedio por usuario' : 'Average revenue per user'}
                    </p>
                  </div>

                  {/* Churn */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-500 font-medium">Churn Mensal</span>
                      <span className="font-bold text-red-500">{churnRate}%</span>
                    </div>
                    <Slider
                      value={[churnRate]}
                      onValueChange={(v) => {
                        setChurnRate(v[0]);
                        trackCalculation({ arpu, churnRate: v[0], cac, grossMargin });
                      }}
                      min={0.5}
                      max={20}
                      step={0.5}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      {lang === 'pt' ? 'Taxa de cancelamento mensal' : lang === 'es' ? 'Tasa de cancelación mensual' : 'Monthly cancellation rate'}
                    </p>
                  </div>

                  {/* CAC */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-500 font-medium">CAC</span>
                      <span className="font-bold text-[#7610DC]">{formatCurrency(cac)}</span>
                    </div>
                    <Slider
                      value={[cac]}
                      onValueChange={(v) => {
                        setCac(v[0]);
                        trackCalculation({ arpu, churnRate, cac: v[0], grossMargin });
                      }}
                      min={50}
                      max={5000}
                      step={50}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      {lang === 'pt' ? 'Custo de aquisição de cliente' : lang === 'es' ? 'Costo de adquisición de cliente' : 'Customer acquisition cost'}
                    </p>
                  </div>

                  {/* Gross Margin */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-500 font-medium">
                        {lang === 'pt' ? 'Margem Bruta' : lang === 'es' ? 'Margen Bruto' : 'Gross Margin'}
                      </span>
                      <span className="font-bold text-cyan-600">{grossMargin}%</span>
                    </div>
                    <Slider
                      value={[grossMargin]}
                      onValueChange={(v) => {
                        setGrossMargin(v[0]);
                        trackCalculation({ arpu, churnRate, cac, grossMargin: v[0] });
                      }}
                      min={20}
                      max={95}
                      step={1}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      {lang === 'pt' ? 'Percentual de lucro bruto' : lang === 'es' ? 'Porcentaje de beneficio bruto' : 'Gross profit percentage'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payback Chart */}
              <div className="bg-white rounded-2xl border border-black/10 p-6">
                <h3 className="font-bold text-black mb-4">
                  {lang === 'pt' ? 'Curva de Payback' : lang === 'es' ? 'Curva de Payback' : 'Payback Curve'}
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={paybackData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis 
                        dataKey="month" 
                        tickFormatter={(v) => `M${v}`}
                        stroke="#94A3B8"
                        fontSize={12}
                      />
                      <YAxis 
                        tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                        stroke="#94A3B8"
                        fontSize={12}
                      />
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value)}
                        labelFormatter={(l) => `${lang === 'pt' ? 'Mês' : lang === 'es' ? 'Mes' : 'Month'} ${l}`}
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #E2E8F0',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="profit" radius={[4, 4, 0, 0]}>
                        {paybackData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.profit >= 0 ? '#10B981' : '#EF4444'} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Benchmarks - moved inside left column */}
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-gray-50 rounded-2xl">
                    <h4 className="font-medium text-black text-sm mb-2">LTV:CAC</h4>
                    <ul className="text-xs space-y-1 text-gray-500">
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        {"< 1x: "}{lang === 'pt' ? 'Perdendo' : lang === 'es' ? 'Perdiendo' : 'Losing'}
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        {"1-3x: "}{lang === 'pt' ? 'Otimizar' : lang === 'es' ? 'Optimizar' : 'Optimize'}
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                        {">3x: "}{lang === 'pt' ? 'Escalar' : lang === 'es' ? 'Escalar' : 'Scale'}
                      </li>
                    </ul>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-2xl">
                    <h4 className="font-medium text-black text-sm mb-2">Payback</h4>
                    <ul className="text-xs space-y-1 text-gray-500">
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                        {"< 12m: "}{lang === 'pt' ? 'Excelente' : lang === 'es' ? 'Excelente' : 'Excellent'}
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        {"12-18m: "}{lang === 'pt' ? 'OK' : 'OK'}
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        {"> 18m: "}{lang === 'pt' ? 'Atenção' : lang === 'es' ? 'Atención' : 'Warning'}
                      </li>
                    </ul>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-2xl">
                    <h4 className="font-medium text-black text-sm mb-2">Churn</h4>
                    <ul className="text-xs space-y-1 text-gray-500">
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                        {"< 3%: "}{lang === 'pt' ? 'Excelente' : lang === 'es' ? 'Excelente' : 'Excellent'}
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        {"3-7%: "}{lang === 'pt' ? 'OK' : 'OK'}
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        {"> 7%: "}{lang === 'pt' ? 'Crítico' : lang === 'es' ? 'Crítico' : 'Critical'}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Results (Sticky) */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-black text-white rounded-2xl p-8 relative overflow-hidden">

                
                <div className="flex items-center justify-between mb-6 relative z-10">
                  <h2 className="text-lg font-bold text-center flex-1">
                    {lang === 'pt' ? 'Resultado' : lang === 'es' ? 'Resultado' : 'Result'}
                  </h2>
                  <ToolHelpTooltip toolId="unit-economics" variant="results" />
                </div>
                
                {/* LTV:CAC Ratio */}
                <div className="text-center mb-6 relative z-10">
                  <div className={`text-7xl font-extrabold ${status.color}`}>
                    {calculations.ltvCacRatio}x
                  </div>
                  <p className="text-gray-400 mt-2">LTV:CAC Ratio</p>
                </div>

                {/* Status */}
                <div className={`p-4 rounded-lg mb-6 relative z-10 ${
                  status.key === 'critical' ? 'bg-red-500/20 border border-red-500/30' :
                  status.key === 'warning' ? 'bg-amber-500/20 border border-amber-500/30' :
                  'bg-green-500/20 border border-green-500/30'
                }`}>
                  <div className="flex items-center gap-2">
                    {status.key === 'critical' && <XCircle className="w-5 h-5 text-red-400" />}
                    {status.key === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
                    {status.key === 'excellent' && <CheckCircle className="w-5 h-5 text-green-400" />}
                    <span className={`font-medium ${status.color}`}>
                      {lang === 'pt' 
                        ? (status.key === 'critical' ? 'Crítico - Revise o modelo' : status.key === 'warning' ? 'Atenção - Otimize CAC' : 'Excelente - Escale!')
                        : lang === 'es'
                        ? (status.key === 'critical' ? 'Crítico - Revise el modelo' : status.key === 'warning' ? 'Atención - Optimice CAC' : '¡Excelente - Escale!')
                        : (status.key === 'critical' ? 'Critical - Review model' : status.key === 'warning' ? 'Warning - Optimize CAC' : 'Excellent - Scale!')
                      }
                    </span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="space-y-3 mb-8 relative z-10">
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/10">
                    <span className="text-sm text-gray-400">LTV</span>
                    <span className="font-mono font-bold text-emerald-400">{formatCurrency(calculations.ltv)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/10">
                    <span className="text-sm text-gray-400">CAC</span>
                    <span className="font-mono font-bold text-[#7610DC]">{formatCurrency(cac)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/10">
                    <span className="text-sm text-gray-400">Payback</span>
                    <span className="font-mono font-bold text-amber-400">
                      {calculations.paybackMonths} {lang === 'pt' ? 'meses' : lang === 'es' ? 'meses' : 'months'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/10">
                    <span className="text-sm text-gray-400">
                      {lang === 'pt' ? 'Vida do Cliente' : lang === 'es' ? 'Vida del Cliente' : 'Customer Life'}
                    </span>
                    <span className="font-mono font-bold text-cyan-400">
                      {calculations.customerLifetimeMonths} {lang === 'pt' ? 'meses' : lang === 'es' ? 'meses' : 'months'}
                    </span>
                  </div>
                </div>

                {/* CTAs */}
                <div className="text-center relative z-10">
                  <p className="text-xs text-gray-400 mb-4 px-2">
                    {lang === 'pt' 
                      ? 'Unit economics saudável é o fundamento. Agora encontre quem vai ajudar a escalar.'
                      : lang === 'es'
                      ? 'Unit economics saludable es el fundamento. Ahora encuentra quién te ayudará a escalar.'
                      : 'Healthy unit economics is the foundation. Now find who will help you scale.'}
                  </p>
                  <Link to="/auth?view=signup">
                    <button className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2 mb-3">
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                      {lang === 'pt' ? 'Encontrar Co-Founder' : lang === 'es' ? 'Encontrar Co-Founder' : 'Find Co-Founder'}
                    </button>
                  </Link>
                  {/* Share buttons removed */}
                </div>

                {/* Tips Box */}
                <ToolTipsBox toolId="unit-economics" />
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-8 p-4 bg-gray-50 border border-black/10 rounded-2xl">
            <p className="text-sm text-gray-500 text-center">
              ⚠️ {t("tools.unit-economics.disclaimer", "Esta calculadora é apenas para fins educacionais. Os resultados são estimativas e não substituem análise financeira profissional.")}
            </p>
          </div>
        </div>
      </ToolPageLayout>
    </>
  );
};

export default UnitEconomicsCalculator;
