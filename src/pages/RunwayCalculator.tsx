import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { TrendingDown, AlertTriangle, CheckCircle, XCircle, Download, Share2 } from 'lucide-react';
import { ToolHelpTooltip } from '@/components/tools/ToolHelpTooltip';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useAuth } from '@/hooks/useAuth';
import { generateRunwayPDF } from '@/lib/pdf-generator';
import SignupDialog from '@/components/tools/SignupDialog';
import { trackEvent } from '@/lib/analytics';
import { toast } from 'sonner';
import { ToolPageLayout } from '@/components/tools/ToolPageLayout';
import { useToolTracking } from '@/hooks/useToolTracking';
import { ToolTipsBox } from '@/components/tools/ToolHelpTooltip';
import { StickyActionBar } from '@/components/tools/StickyActionBar';

const RunwayCalculator = () => {
  const { t, i18n } = useTranslation();
  const { data: auth } = useAuth();
  const [showSignupDialog, setShowSignupDialog] = useState(false);
  const lang = i18n.language as 'pt' | 'en' | 'es';
  const { trackCalculation, trackDownload, trackShare } = useToolTracking('runway-calculator');
  
  const [balance, setBalance] = useState<number>(100000);
  const [burnRate, setBurnRate] = useState<number>(15000);
  const [revenue, setRevenue] = useState<number>(5000);
  const [growthRate, setGrowthRate] = useState<number>(10);

  const calculations = useMemo(() => {
    const netBurn = burnRate - revenue;
    const runwayMonths = netBurn > 0 ? Math.floor(balance / netBurn) : 999;
    
    const projectionData = [];
    let currentBalance = balance;
    let currentRevenue = revenue;
    
    for (let month = 0; month <= 12; month++) {
      const monthlyNetBurn = burnRate - currentRevenue;
      projectionData.push({
        month: month,
        balance: Math.max(0, Math.round(currentBalance)),
        revenue: Math.round(currentRevenue),
        burnRate: burnRate,
      });
      currentBalance -= monthlyNetBurn;
      currentRevenue *= (1 + growthRate / 100);
    }

    let breakevenMonth = null;
    for (let i = 0; i < projectionData.length; i++) {
      if (projectionData[i].revenue >= burnRate) {
        breakevenMonth = i;
        break;
      }
    }

    return {
      netBurn,
      runwayMonths: Math.min(runwayMonths, 99),
      projectionData,
      breakevenMonth,
    };
  }, [balance, burnRate, revenue, growthRate]);

  const getRunwayStatus = () => {
    if (calculations.runwayMonths < 3) {
      return { color: 'text-red-500', bg: 'bg-red-500', key: 'critical' };
    } else if (calculations.runwayMonths < 6) {
      return { color: 'text-amber-500', bg: 'bg-amber-500', key: 'warning' };
    }
    return { color: 'text-green-500', bg: 'bg-green-500', key: 'healthy' };
  };

  const status = getRunwayStatus();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handleExportPdf = () => {
    if (!auth?.user) {
      trackEvent('soft_gate_triggered', 'tools', 'runway');
      setShowSignupDialog(true);
      return;
    }
    trackEvent('pdf_exported', 'tools', 'runway');
    trackDownload('pdf');
    const doc = generateRunwayPDF({
      balance,
      burnRate,
      revenue,
      growthRate,
      runwayMonths: calculations.runwayMonths,
      netBurn: calculations.netBurn,
      breakevenMonth: calculations.breakevenMonth,
    });
    doc.save('runway-calculator.pdf');
    toast.success(lang === 'pt' ? 'PDF exportado!' : lang === 'es' ? '¡PDF exportado!' : 'PDF exported!');
  };

  const shareResults = () => {
    const text = `Runway: ${calculations.runwayMonths} meses\nBurn Rate Líquido: ${formatCurrency(calculations.netBurn)}/mês`;
    navigator.clipboard.writeText(text);
    trackShare('clipboard');
    toast.success(lang === 'pt' ? 'Copiado!' : lang === 'es' ? '¡Copiado!' : 'Copied!');
  };

  return (
    <>
      <Helmet>
        <title>{t('runway.pageTitle')} | Guilda</title>
        <meta name="description" content={t('runway.pageDescription')} />
        <meta name="keywords" content="calculadora runway, quanto tempo de capital, burn rate startup, projeção financeira startup" />
        <link rel="canonical" href="https://www.guilda.app.br/ferramentas-empreendedores/runway-calculator" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": t('runway.pageTitle'),
            "description": t('runway.pageDescription'),
            "url": "https://www.guilda.app.br/ferramentas-empreendedores/runway-calculator",
            "applicationCategory": "BusinessApplication",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "BRL"
            }
          })}
        </script>
      </Helmet>

      <ToolPageLayout toolId="runway-calculator" icon={TrendingDown} iconColor="text-orange-500" iconBgColor="bg-orange-500/10">
        <div className="max-w-7xl mx-auto p-4 md:p-8">

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column: Inputs */}
            <div className="lg:col-span-2 space-y-6">
              {/* Balance Card */}
              <div className="bg-white rounded-2xl border border-black/10 p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#7610DC]" />
                
                <h3 className="font-bold text-black mb-6">
                  {lang === 'pt' ? 'Dados Financeiros' : lang === 'es' ? 'Datos Financieros' : 'Financial Data'}
                </h3>

                <div className="space-y-6">
                  {/* Balance Slider */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-500 font-medium">
                        {lang === 'pt' ? 'Saldo Atual' : lang === 'es' ? 'Saldo Actual' : 'Current Balance'}
                      </span>
                      <span className="font-bold text-[#7610DC]">
                        {formatCurrency(balance)}
                      </span>
                    </div>
                    <Slider
                      value={[balance]}
                      onValueChange={(v) => {
                        setBalance(v[0]);
                        trackCalculation({ balance: v[0], burnRate, revenue, growthRate });
                      }}
                      min={0}
                      max={1000000}
                      step={10000}
                      className="w-full"
                    />
                  </div>

                  {/* Burn Rate Slider */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-500 font-medium">
                        {lang === 'pt' ? 'Burn Rate Mensal' : lang === 'es' ? 'Burn Rate Mensual' : 'Monthly Burn Rate'}
                      </span>
                      <span className="font-bold text-red-500">
                        {formatCurrency(burnRate)}
                      </span>
                    </div>
                    <Slider
                      value={[burnRate]}
                      onValueChange={(v) => {
                        setBurnRate(v[0]);
                        trackCalculation({ balance, burnRate: v[0], revenue, growthRate });
                      }}
                      min={0}
                      max={100000}
                      step={1000}
                      className="w-full"
                    />
                  </div>

                  {/* Revenue Slider */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-500 font-medium">
                        {lang === 'pt' ? 'Receita Mensal' : lang === 'es' ? 'Ingresos Mensuales' : 'Monthly Revenue'}
                      </span>
                      <span className="font-bold text-green-500">
                        {formatCurrency(revenue)}
                      </span>
                    </div>
                    <Slider
                      value={[revenue]}
                      onValueChange={(v) => {
                        setRevenue(v[0]);
                        trackCalculation({ balance, burnRate, revenue: v[0], growthRate });
                      }}
                      min={0}
                      max={50000}
                      step={500}
                      className="w-full"
                    />
                  </div>

                  {/* Growth Rate Slider */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-500 font-medium">
                        {lang === 'pt' ? 'Crescimento Mensal da Receita' : lang === 'es' ? 'Crecimiento Mensual' : 'Monthly Revenue Growth'}
                      </span>
                      <span className="font-bold text-cyan-600">
                        {growthRate}%
                      </span>
                    </div>
                    <Slider
                      value={[growthRate]}
                      onValueChange={(v) => {
                        setGrowthRate(v[0]);
                        trackCalculation({ balance, burnRate, revenue, growthRate: v[0] });
                      }}
                      min={0}
                      max={50}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Chart Card */}
              <div className="bg-white rounded-2xl border border-black/10 p-6">
                <h3 className="font-bold text-black mb-4">
                  {lang === 'pt' ? 'Projeção de 12 Meses' : lang === 'es' ? 'Proyección de 12 Meses' : '12-Month Projection'}
                </h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={calculations.projectionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis 
                        dataKey="month" 
                        tickFormatter={(value) => `M${value}`}
                        stroke="#94A3B8"
                        fontSize={12}
                      />
                      <YAxis 
                        tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                        stroke="#94A3B8"
                        fontSize={12}
                      />
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value)}
                        labelFormatter={(label) => `${lang === 'pt' ? 'Mês' : lang === 'es' ? 'Mes' : 'Month'} ${label}`}
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #E2E8F0',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <ReferenceLine y={0} stroke="#EF4444" strokeDasharray="5 5" />
                      <Line 
                        type="monotone" 
                        dataKey="balance" 
                        stroke="#6D28D9" 
                        name={lang === 'pt' ? 'Saldo' : lang === 'es' ? 'Saldo' : 'Balance'}
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#10B981" 
                        name={lang === 'pt' ? 'Receita' : lang === 'es' ? 'Ingresos' : 'Revenue'}
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
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
                  <ToolHelpTooltip toolId="runway-calculator" variant="results" />
                </div>
                
                {/* Main Result */}
                <div className="text-center mb-8 relative z-10">
                  <div className={`text-7xl font-extrabold ${status.color}`}>
                    {calculations.runwayMonths}
                  </div>
                  <p className="text-gray-400 mt-2">
                    {lang === 'pt' ? 'meses de runway' : lang === 'es' ? 'meses de runway' : 'months of runway'}
                  </p>
                </div>

                {/* Status Indicator */}
                <div className={`p-4 rounded-lg mb-6 relative z-10 ${
                  status.key === 'critical' ? 'bg-red-500/20 border border-red-500/30' :
                  status.key === 'warning' ? 'bg-amber-500/20 border border-amber-500/30' :
                  'bg-green-500/20 border border-green-500/30'
                }`}>
                  <div className="flex items-center gap-2">
                    {status.key === 'critical' && <XCircle className="w-5 h-5 text-red-400" />}
                    {status.key === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
                    {status.key === 'healthy' && <CheckCircle className="w-5 h-5 text-green-400" />}
                    <span className={`font-medium ${status.color}`}>
                      {lang === 'pt' 
                        ? (status.key === 'critical' ? 'Crítico' : status.key === 'warning' ? 'Atenção' : 'Saudável')
                        : lang === 'es'
                        ? (status.key === 'critical' ? 'Crítico' : status.key === 'warning' ? 'Atención' : 'Saludable')
                        : (status.key === 'critical' ? 'Critical' : status.key === 'warning' ? 'Warning' : 'Healthy')
                      }
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-3 mb-8 relative z-10">
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/10">
                    <span className="text-sm text-gray-400">Burn Rate Líquido</span>
                    <span className="font-mono font-bold text-red-400">
                      {formatCurrency(calculations.netBurn)}/mês
                    </span>
                  </div>
                  {calculations.breakevenMonth && (
                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/10">
                      <span className="text-sm text-gray-400">Breakeven</span>
                      <span className="font-mono font-bold text-green-400">
                        {lang === 'pt' ? 'Mês' : lang === 'es' ? 'Mes' : 'Month'} {calculations.breakevenMonth}
                      </span>
                    </div>
                  )}
                </div>

                {/* CTAs */}
                <div className="text-center relative z-10">
                  <p className="text-xs text-gray-400 mb-4 px-2">
                    {lang === 'pt' 
                      ? 'Não espere o dinheiro acabar. Encontre um sócio que acelere seu crescimento.'
                      : lang === 'es'
                      ? 'No esperes a que se acabe el dinero. Encuentra un socio que acelere tu crecimiento.'
                      : "Don't wait for the money to run out. Find a partner to accelerate growth."}
                  </p>
                  <button
                    onClick={shareResults}
                    className="w-full text-xs text-gray-400 hover:text-white flex items-center justify-center gap-1 transition-colors py-2"
                  >
                    <Share2 className="w-3 h-3" />
                    {lang === 'pt' ? 'Compartilhar' : lang === 'es' ? 'Compartir' : 'Share'}
                  </button>
                </div>

                {/* Tips Box */}
                <ToolTipsBox toolId="runway-calculator" />
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-8 p-4 bg-gray-50 border border-black/10 rounded-2xl">
            <p className="text-sm text-gray-500 text-center">
              ⚠️ {t("tools.runway-calculator.disclaimer", "Esta calculadora é apenas para fins educacionais. Os resultados são estimativas e não substituem análise financeira profissional.")}
            </p>
          </div>
        </div>
        {/* Bottom padding for StickyActionBar */}
        <div className="h-20" />
      </ToolPageLayout>
      
      <StickyActionBar
        onDownload={handleExportPdf}
        showDownload={true}
        showEmailResults={true}
        toolName="runway"
        calculationData={{
          inputs: { balance, burnRate, revenue, growthRate },
          results: {
            runwayMonths: calculations.runwayMonths,
            netBurn: calculations.netBurn,
            breakevenMonth: calculations.breakevenMonth,
          }
        }}
        hasData={balance > 0}
      />

      <SignupDialog
        open={showSignupDialog}
        onOpenChange={setShowSignupDialog}
        feature="pdf"
        toolName="runway"
        calculationData={{ balance, burnRate, revenue, growthRate, runwayMonths: calculations.runwayMonths }}
      />
    </>
  );
};

export default RunwayCalculator;
