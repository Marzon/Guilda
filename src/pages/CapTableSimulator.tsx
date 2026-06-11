import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  PieChart, Plus, Trash2, Users, DollarSign, Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from '@/hooks/useAuth';
import SignupDialog from '@/components/tools/SignupDialog';

import { trackEvent } from '@/lib/analytics';
import { toast } from 'sonner';
import { ToolPageLayout } from '@/components/tools/ToolPageLayout';
import { useToolTracking } from '@/hooks/useToolTracking';
import { ToolHelpTooltip, ToolTipsBox } from '@/components/tools/ToolHelpTooltip';

interface Shareholder {
  id: string;
  name: string;
  shares: number;
  type: 'founder' | 'investor' | 'employee';
}

interface FundingRound {
  id: string;
  name: string;
  type: 'pre-seed' | 'seed' | 'series-a' | 'series-b' | 'series-c';
  investment: number;
  preMoneyValuation: number;
}

const COLORS = ['#7610DC', '#F97316', '#4308B0', '#A728EB', '#10B981', '#EF4444', '#EC4899'];

const ROUND_LABELS: Record<string, Record<string, string>> = {
  pt: { 'pre-seed': 'Pre-Seed', 'seed': 'Seed', 'series-a': 'Série A', 'series-b': 'Série B', 'series-c': 'Série C' },
  en: { 'pre-seed': 'Pre-Seed', 'seed': 'Seed', 'series-a': 'Series A', 'series-b': 'Series B', 'series-c': 'Series C' },
  es: { 'pre-seed': 'Pre-Seed', 'seed': 'Seed', 'series-a': 'Serie A', 'series-b': 'Serie B', 'series-c': 'Serie C' },
};

const CapTableSimulator = () => {
  const { t, i18n } = useTranslation();
  const { data: auth } = useAuth();
  const [showSignupDialog, setShowSignupDialog] = useState(false);
  const lang = i18n.language as 'pt' | 'en' | 'es';
  const { trackCalculation, trackShare } = useToolTracking('cap-table');

  const [shareholders, setShareholders] = useState<Shareholder[]>([
    { id: '1', name: 'Founder 1', shares: 5000000, type: 'founder' },
    { id: '2', name: 'Founder 2', shares: 3000000, type: 'founder' },
    { id: '3', name: 'Employee Pool', shares: 2000000, type: 'employee' },
  ]);

  const [fundingRounds, setFundingRounds] = useState<FundingRound[]>([]);

  const addShareholder = () => {
    setShareholders([
      ...shareholders,
      {
        id: Date.now().toString(),
        name: `${lang === 'pt' ? 'Sócio' : lang === 'es' ? 'Socio' : 'Shareholder'} ${shareholders.length + 1}`,
        shares: 1000000,
        type: 'founder',
      },
    ]);
  };

  const removeShareholder = (id: string) => {
    if (shareholders.length > 1) {
      setShareholders(shareholders.filter((s) => s.id !== id));
    }
  };

  const updateShareholder = (id: string, field: keyof Shareholder, value: string | number) => {
    setShareholders(
      shareholders.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
    trackCalculation({ action: 'update_shareholder', field, shareholdersCount: shareholders.length });
  };

  const addFundingRound = () => {
    const roundTypes: FundingRound['type'][] = ['pre-seed', 'seed', 'series-a', 'series-b', 'series-c'];
    const nextType = roundTypes[Math.min(fundingRounds.length, roundTypes.length - 1)];
    
    if (fundingRounds.length >= 2 && !auth?.user) {
      trackEvent('soft_gate_triggered', 'tools', 'captable_round');
      setShowSignupDialog(true);
      return;
    }
    
    setFundingRounds([
      ...fundingRounds,
      {
        id: Date.now().toString(),
        name: ROUND_LABELS[lang]?.[nextType] || nextType,
        type: nextType,
        investment: 500000,
        preMoneyValuation: 2000000,
      },
    ]);
  };

  const removeFundingRound = (id: string) => {
    setFundingRounds(fundingRounds.filter((r) => r.id !== id));
  };

  const updateFundingRound = (id: string, field: keyof FundingRound, value: string | number) => {
    setFundingRounds(
      fundingRounds.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
    trackCalculation({ action: 'update_round', field, roundsCount: fundingRounds.length });
  };

  // Calculate cap table with dilution
  const calculateCapTable = () => {
    const totalInitialShares = shareholders.reduce((sum, s) => sum + s.shares, 0);
    
    let currentShares = shareholders.map((s) => ({
      ...s,
      currentShares: s.shares,
      percentage: (s.shares / totalInitialShares) * 100,
    }));

    const roundResults: {
      round: string;
      shareholders: typeof currentShares;
      newShares: number;
      postMoneyValuation: number;
    }[] = [
      {
        round: lang === 'pt' ? 'Inicial' : lang === 'es' ? 'Inicial' : 'Initial',
        shareholders: currentShares,
        newShares: 0,
        postMoneyValuation: 0,
      },
    ];

    let totalShares = totalInitialShares;

    fundingRounds.forEach((round) => {
      const postMoneyValuation = round.preMoneyValuation + round.investment;
      const pricePerShare = round.preMoneyValuation / totalShares;
      const newShares = round.investment / pricePerShare;

      totalShares += newShares;

      const investorShares = {
        id: `investor-${round.id}`,
        name: `${round.name} Investor`,
        shares: 0,
        type: 'investor' as const,
        currentShares: newShares,
        percentage: (newShares / totalShares) * 100,
      };

      currentShares = currentShares.map((s) => ({
        ...s,
        percentage: (s.currentShares / totalShares) * 100,
      }));

      currentShares.push(investorShares);

      roundResults.push({
        round: round.name,
        shareholders: [...currentShares],
        newShares,
        postMoneyValuation,
      });
    });

    return { roundResults, totalShares };
  };

  const { roundResults, totalShares } = calculateCapTable();
  const currentRound = roundResults[roundResults.length - 1];

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `R$ ${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `R$ ${(value / 1000).toFixed(0)}K`;
    return `R$ ${value.toFixed(2)}`;
  };

  const formatNumber = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toFixed(0);
  };

  const dilutionChartData = roundResults.map((result) => {
    const data: Record<string, string | number> = { round: result.round };
    result.shareholders.forEach((s) => {
      data[s.name] = parseFloat(s.percentage.toFixed(2));
    });
    return data;
  });

  const allShareholderNames = Array.from(
    new Set(roundResults.flatMap((r) => r.shareholders.map((s) => s.name)))
  );

  const shareResults = () => {
    const text = currentRound.shareholders.map(s => `${s.name}: ${s.percentage.toFixed(1)}%`).join('\n');
    navigator.clipboard.writeText(text);
    toast.success(lang === 'pt' ? 'Copiado!' : lang === 'es' ? '¡Copiado!' : 'Copied!');
  };

  // Generate conic gradient for donut chart
  const generateConicGradient = () => {
    let gradient = '';
    let currentPercentage = 0;
    currentRound.shareholders.forEach((s, i) => {
      const start = currentPercentage;
      const end = currentPercentage + s.percentage;
      gradient += `${COLORS[i % COLORS.length]} ${start}% ${end}%${i < currentRound.shareholders.length - 1 ? ', ' : ''}`;
      currentPercentage = end;
    });
    return `conic-gradient(${gradient})`;
  };

  return (
    <ToolPageLayout toolId="cap-table" icon={PieChart} iconColor="text-pink-500" iconBgColor="bg-pink-500/10">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column: Inputs */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shareholders */}
            <div className="bg-white rounded-2xl border border-black/10 p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#7610DC]" />
              
              <div className="flex items-center gap-2 mb-6">
                <Users className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-slate-900">
                  {lang === 'pt' ? 'Sócios' : lang === 'es' ? 'Socios' : 'Shareholders'}
                </h3>
              </div>

              <div className="space-y-3">
                {shareholders.map((shareholder) => (
                  <div key={shareholder.id} className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-lg items-center">
                    <Input
                      value={shareholder.name}
                      onChange={(e) => updateShareholder(shareholder.id, 'name', e.target.value)}
                      placeholder={lang === 'pt' ? 'Nome' : lang === 'es' ? 'Nombre' : 'Name'}
                      className="flex-1 min-w-[120px]"
                    />
                    <Input
                      type="number"
                      value={shareholder.shares}
                      onChange={(e) => updateShareholder(shareholder.id, 'shares', Number(e.target.value))}
                      className="w-28"
                    />
                    <Select
                      value={shareholder.type}
                      onValueChange={(value) => updateShareholder(shareholder.id, 'type', value)}
                    >
                      <SelectTrigger className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="founder">Founder</SelectItem>
                        <SelectItem value="investor">{lang === 'pt' ? 'Investidor' : lang === 'es' ? 'Inversor' : 'Investor'}</SelectItem>
                        <SelectItem value="employee">{lang === 'pt' ? 'Funcionário' : lang === 'es' ? 'Empleado' : 'Employee'}</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeShareholder(shareholder.id)}
                      disabled={shareholders.length <= 1}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
              <button
                onClick={addShareholder}
                className="flex items-center gap-2 text-sm text-slate-500 font-bold hover:text-purple-600 transition-colors mt-4"
              >
                <Plus className="w-4 h-4" />
                {lang === 'pt' ? 'Adicionar Sócio' : lang === 'es' ? 'Agregar Socio' : 'Add Shareholder'}
              </button>
            </div>

            {/* Funding Rounds */}
            <div className="bg-white rounded-2xl border border-black/10 p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500" />
              
              <div className="flex items-center gap-2 mb-6">
                <DollarSign className="w-5 h-5 text-cyan-600" />
                <h3 className="font-bold text-slate-900">
                  {lang === 'pt' ? 'Rodadas de Investimento' : lang === 'es' ? 'Rondas de Inversión' : 'Funding Rounds'}
                </h3>
              </div>

              {fundingRounds.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">
                  {lang === 'pt' ? 'Nenhuma rodada adicionada. Clique abaixo para simular.' : lang === 'es' ? 'Ninguna ronda agregada. Haz clic abajo para simular.' : 'No rounds added. Click below to simulate.'}
                </p>
              ) : (
                <div className="space-y-4">
                  {fundingRounds.map((round) => (
                    <div key={round.id} className="p-4 bg-slate-50 rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <Select
                          value={round.type}
                          onValueChange={(value) => {
                            updateFundingRound(round.id, 'type', value);
                            updateFundingRound(round.id, 'name', ROUND_LABELS[lang]?.[value] || value);
                          }}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pre-seed">Pre-Seed</SelectItem>
                            <SelectItem value="seed">Seed</SelectItem>
                            <SelectItem value="series-a">{lang === 'pt' ? 'Série A' : 'Series A'}</SelectItem>
                            <SelectItem value="series-b">{lang === 'pt' ? 'Série B' : 'Series B'}</SelectItem>
                            <SelectItem value="series-c">{lang === 'pt' ? 'Série C' : 'Series C'}</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="ghost" size="icon" onClick={() => removeFundingRound(round.id)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs text-slate-500">
                            {lang === 'pt' ? 'Investimento' : lang === 'es' ? 'Inversión' : 'Investment'}
                          </Label>
                          <Input
                            type="number"
                            value={round.investment}
                            onChange={(e) => updateFundingRound(round.id, 'investment', Number(e.target.value))}
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-slate-500">Pre-Money Valuation</Label>
                          <Input
                            type="number"
                            value={round.preMoneyValuation}
                            onChange={(e) => updateFundingRound(round.id, 'preMoneyValuation', Number(e.target.value))}
                          />
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>Post-Money: {formatCurrency(round.preMoneyValuation + round.investment)}</span>
                        <span>
                          {lang === 'pt' ? 'Diluição' : lang === 'es' ? 'Dilución' : 'Dilution'}: {((round.investment / (round.preMoneyValuation + round.investment)) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <button
                onClick={addFundingRound}
                className="flex items-center gap-2 text-sm text-slate-500 font-bold hover:text-cyan-600 transition-colors mt-4"
              >
                <Plus className="w-4 h-4" />
                {lang === 'pt' ? 'Adicionar Rodada' : lang === 'es' ? 'Agregar Ronda' : 'Add Round'}
              </button>
            </div>

            {/* Dilution Chart */}
            {fundingRounds.length > 0 && (
              <div className="bg-white rounded-2xl border border-black/10 p-6">
                <h3 className="font-bold text-slate-900 mb-4">
                  {lang === 'pt' ? 'Evolução da Diluição' : lang === 'es' ? 'Evolución de la Dilución' : 'Dilution Evolution'}
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dilutionChartData}>
                      <XAxis dataKey="round" fontSize={12} />
                      <YAxis unit="%" fontSize={12} />
                      <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                      <Legend />
                      {allShareholderNames.map((name, index) => (
                        <Bar key={name} dataKey={name} stackId="a" fill={COLORS[index % COLORS.length]} />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Results (Sticky) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-black text-white rounded-2xl p-8 relative overflow-hidden">

              
              <div className="flex items-center justify-between mb-2 relative z-10">
                <h2 className="text-lg font-bold text-center flex-1">
                  {lang === 'pt' ? 'Distribuição Atual' : lang === 'es' ? 'Distribución Actual' : 'Current Distribution'}
                </h2>
                <ToolHelpTooltip toolId="cap-table" variant="results" />
              </div>
              <p className="text-xs text-slate-400 text-center mb-6">
                {lang === 'pt' ? 'Total de Ações' : lang === 'es' ? 'Total de Acciones' : 'Total Shares'}: {formatNumber(totalShares)}
              </p>
              
              {/* Donut Chart */}
              <div className="relative w-48 h-48 mx-auto mb-6">
                <div className="w-full h-full rounded-full" style={{ background: generateConicGradient() }} />
                <div className="absolute inset-8 bg-slate-900 rounded-full flex flex-col items-center justify-center">
                  <span className="text-xs text-slate-400">Total</span>
                  <span className="text-xl font-bold">100%</span>
                </div>
              </div>

              {/* Legend */}
              <div className="space-y-2 mb-8 relative z-10 max-h-48 overflow-y-auto">
                {currentRound.shareholders.map((s, i) => (
                  <div key={s.id} className="flex justify-between items-center p-2 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-sm truncate max-w-[120px]">{s.name}</span>
                    </div>
                    <span className="font-mono font-bold text-sm">{s.percentage.toFixed(1)}%</span>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div className="text-center relative z-10">
                <p className="text-xs text-slate-400 mb-4 px-2">
                  {lang === 'pt' 
                    ? 'Simular é o primeiro passo. Agora encontre o sócio certo para diluir junto.'
                    : lang === 'es'
                    ? 'Simular es el primer paso. Ahora encuentra el socio correcto para diluir juntos.'
                    : 'Simulating is the first step. Now find the right partner to dilute together.'}
                </p>
                <Link to="/auth?view=signup">
                  <button className="w-full bg-white text-slate-900 font-bold py-3 rounded-xl hover:bg-pink-50 transition-colors flex items-center justify-center gap-2 mb-3">
                    <PieChart className="w-4 h-4 text-pink-600" />
                    {lang === 'pt' ? 'Encontrar Co-Founder' : lang === 'es' ? 'Encontrar Co-Founder' : 'Find Co-Founder'}
                  </button>
                </Link>
                {/* Share buttons removed */}

                {/* Tips Box */}
                <ToolTipsBox toolId="cap-table" />
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 p-4 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
          <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
            ⚠️ {t("tools.cap-table.disclaimer", "Este simulador é apenas para fins educacionais. Os resultados são estimativas e não substituem consultoria jurídica ou financeira profissional.")}
          </p>
        </div>
      </div>

      <SignupDialog
        open={showSignupDialog}
        onOpenChange={setShowSignupDialog}
        feature="save"
        toolName="cap-table"
      />
    </ToolPageLayout>
  );
};

export default CapTableSimulator;
