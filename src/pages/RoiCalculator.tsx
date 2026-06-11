import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { ToolPageLayout } from '@/components/tools/ToolPageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CurrencyInput } from '@/components/ui/currency-input';
import { StickyActionBar } from '@/components/tools/StickyActionBar';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Share2, Download, HelpCircle, Target, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { generateToolPDF } from '@/lib/pdf-generator';

const RoiCalculator = () => {
  const { t } = useTranslation();

  const [investment, setInvestment] = useState(5000);
  const [revenue, setRevenue] = useState(15000);

  const calculation = useMemo(() => {
    if (investment === 0) {
      return { roi: 0, profit: 0, isProfit: false, isValid: false };
    }

    const profit = revenue - investment;
    const roi = (profit / investment) * 100;
    const isProfit = profit > 0;

    return { roi, profit, isProfit, isValid: true };
  }, [investment, revenue]);

  const chartData = useMemo(() => {
    if (!calculation.isValid || investment === 0) return [];
    
    if (calculation.isProfit) {
      return [
        { name: 'Investimento', value: investment, color: 'hsl(var(--muted-foreground))' },
        { name: 'Lucro', value: calculation.profit, color: 'hsl(var(--primary))' },
      ];
    } else {
      return [
        { name: 'Receita', value: revenue, color: 'hsl(var(--accent))' },
        { name: 'Prejuízo', value: Math.abs(calculation.profit), color: 'hsl(var(--destructive))' },
      ];
    }
  }, [calculation, investment, revenue]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const getRoiBenchmark = (roi: number) => {
    if (roi >= 500) return { label: 'Excepcional', color: 'text-green-500', description: 'Resultado muito acima da média de mercado' };
    if (roi >= 200) return { label: 'Excelente', color: 'text-green-500', description: 'ROI acima da média para marketing digital' };
    if (roi >= 100) return { label: 'Bom', color: 'text-primary', description: 'Dobrou o investimento - resultado sólido' };
    if (roi >= 50) return { label: 'Satisfatório', color: 'text-accent', description: 'Retorno positivo, mas há espaço para melhoria' };
    if (roi >= 0) return { label: 'Baixo', color: 'text-yellow-500', description: 'Marginal - considere otimizar a campanha' };
    return { label: 'Negativo', color: 'text-destructive', description: 'Prejuízo - revise a estratégia urgentemente' };
  };

  const benchmark = getRoiBenchmark(calculation.roi);

  const handleShare = async () => {
    const emoji = calculation.isProfit ? '📈' : '📉';
    const resultLabel = calculation.isProfit ? 'Lucro' : 'Prejuízo';
    
    const text = `${emoji} Calculadora de ROI\n\nInvestimento: ${formatCurrency(investment)}\nReceita Gerada: ${formatCurrency(revenue)}\n\n🎯 ROI: ${calculation.roi.toFixed(1)}%\n💰 ${resultLabel}: ${formatCurrency(Math.abs(calculation.profit))}\n\nCalculado em guilda.app.br/tools/roi-calculator`;
    
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t('common.linkCopied'));
    } catch {
      toast.error('Erro ao copiar');
    }
  };

  const handleExportPDF = () => {
    const doc = generateToolPDF({
      title: 'Calculadora de ROI',
      subtitle: 'Retorno sobre Investimento em Marketing',
      sections: [
        {
          title: 'Dados de Entrada',
          type: 'key-value',
          content: {
            'Investimento em Marketing': formatCurrency(investment),
            'Receita Gerada': formatCurrency(revenue),
          },
        },
        {
          title: 'Resultado',
          type: 'key-value',
          content: {
            'ROI': `${calculation.roi.toFixed(1)}%`,
            [calculation.isProfit ? 'Lucro' : 'Prejuízo']: formatCurrency(Math.abs(calculation.profit)),
            'Avaliação': benchmark.label,
          },
        },
        {
          title: 'Interpretação',
          type: 'text',
          content: benchmark.description,
        },
      ],
    });
    doc.save('calculo-roi.pdf');
    toast.success('PDF gerado com sucesso!');
  };

  return (
    <ToolPageLayout toolId="roi-calculator" icon={TrendingUp}>
      <Helmet>
        <title>Calculadora de ROI | Guilda</title>
        <meta name="description" content="Calcule o retorno sobre investimento das suas campanhas de marketing. Descubra se suas ações estão gerando lucro." />
        <link rel="canonical" href="https://www.guilda.app.br/ferramentas-empreendedores/roi-calculator" />
      </Helmet>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Inputs */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Investimento em Marketing
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="w-4 h-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Quanto você gastou na campanha: anúncios, produção de conteúdo, influenciadores, etc.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CurrencyInput
                  value={investment}
                  onChange={setInvestment}
                  className="text-lg"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Receita Gerada
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="w-4 h-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Total de vendas atribuídas a esta campanha. Use tracking ou códigos promocionais para medir.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CurrencyInput
                  value={revenue}
                  onChange={setRevenue}
                  className="text-lg"
                />
              </CardContent>
            </Card>

            {/* Benchmarks */}
            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Benchmarks de ROI em Marketing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">E-mail Marketing</span>
                    <span className="font-medium">380-420%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">SEO</span>
                    <span className="font-medium">200-300%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Google Ads</span>
                    <span className="font-medium">100-200%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Social Ads</span>
                    <span className="font-medium">50-150%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:sticky lg:top-24 h-fit space-y-6">
            <Card className={`border-2 ${calculation.isProfit ? 'border-primary' : 'border-destructive'}`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {calculation.isProfit ? (
                    <TrendingUp className="w-5 h-5 text-primary" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-destructive" />
                  )}
                  Resultado
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!calculation.isValid ? (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Insira um valor de investimento maior que zero.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* ROI Display */}
                    <div className={`text-center p-6 rounded-xl ${calculation.isProfit ? 'bg-primary/10' : 'bg-destructive/10'}`}>
                      <p className="text-sm text-muted-foreground mb-1">Retorno sobre Investimento</p>
                      <p className={`text-5xl font-bold ${calculation.isProfit ? 'text-primary' : 'text-destructive'}`}>
                        {calculation.roi.toFixed(1)}%
                      </p>
                      <p className={`text-sm mt-2 font-medium ${benchmark.color}`}>
                        {benchmark.label}
                      </p>
                    </div>

                    {/* Profit/Loss */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">
                          {calculation.isProfit ? 'Lucro Líquido' : 'Prejuízo'}
                        </p>
                        <p className={`text-xl font-bold ${calculation.isProfit ? 'text-green-600' : 'text-destructive'}`}>
                          {calculation.isProfit ? '+' : '-'}{formatCurrency(Math.abs(calculation.profit))}
                        </p>
                      </div>
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Multiplicador</p>
                        <p className="text-xl font-bold">
                          {(revenue / investment).toFixed(2)}x
                        </p>
                      </div>
                    </div>

                    {/* Chart */}
                    {chartData.length > 0 && (
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={chartData}
                              cx="50%"
                              cy="50%"
                              innerRadius={50}
                              outerRadius={70}
                              paddingAngle={2}
                              dataKey="value"
                            >
                              {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Legend 
                              formatter={(value) => <span className="text-sm">{value}</span>}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                    {/* Interpretation */}
                    <div className="p-4 bg-muted/30 rounded-lg border border-border">
                      <p className="text-sm text-muted-foreground">{benchmark.description}</p>
                    </div>

                    {/* Formula */}
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-2">Fórmula:</p>
                      <p className="font-mono text-sm">
                        ROI = (Receita - Investimento) ÷ Investimento × 100
                      </p>
                      <p className="font-mono text-xs text-muted-foreground mt-1">
                        ({formatCurrency(revenue)} - {formatCurrency(investment)}) ÷ {formatCurrency(investment)} × 100 = {calculation.roi.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-8 p-4 bg-gray-50 border border-black/10 rounded-2xl">
        <p className="text-sm text-gray-500 text-center">
          ⚠️ Esta calculadora é apenas para fins educacionais. Os resultados são estimativas e não substituem análise financeira profissional.
        </p>
      </div>

      <StickyActionBar
        onDownload={handleExportPDF}
        showDownload={true}
      />
    </ToolPageLayout>
  );
};

export default RoiCalculator;
