import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { ToolPageLayout } from '@/components/tools/ToolPageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { CurrencyInput } from '@/components/ui/currency-input';
import { StickyActionBar } from '@/components/tools/StickyActionBar';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceLine, Legend, CartesianGrid } from 'recharts';
import { Target, Share2, Download, HelpCircle, TrendingUp, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { generateToolPDF } from '@/lib/pdf-generator';

const BreakevenCalculator = () => {
  const { t } = useTranslation();

  const [fixedCosts, setFixedCosts] = useState(10000);
  const [sellingPrice, setSellingPrice] = useState(150);
  const [variableCost, setVariableCost] = useState(50);

  const calculation = useMemo(() => {
    const contributionMargin = sellingPrice - variableCost;
    
    if (contributionMargin <= 0) {
      return { 
        breakevenUnits: 0, 
        breakevenRevenue: 0, 
        contributionMargin: 0,
        contributionMarginPercent: 0,
        isValid: false 
      };
    }

    const breakevenUnits = Math.ceil(fixedCosts / contributionMargin);
    const breakevenRevenue = breakevenUnits * sellingPrice;
    const contributionMarginPercent = (contributionMargin / sellingPrice) * 100;

    return { 
      breakevenUnits, 
      breakevenRevenue, 
      contributionMargin,
      contributionMarginPercent,
      isValid: true 
    };
  }, [fixedCosts, sellingPrice, variableCost]);

  const chartData = useMemo(() => {
    if (!calculation.isValid) return [];
    
    const maxUnits = Math.max(calculation.breakevenUnits * 2, 100);
    const step = Math.max(Math.floor(maxUnits / 10), 1);
    const data = [];

    for (let units = 0; units <= maxUnits; units += step) {
      const revenue = units * sellingPrice;
      const totalCosts = fixedCosts + (units * variableCost);
      const profit = revenue - totalCosts;
      
      data.push({
        units,
        revenue,
        totalCosts,
        profit,
      });
    }

    return data;
  }, [calculation, fixedCosts, sellingPrice, variableCost]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatNumber = (value: number) => {
    return value.toLocaleString('pt-BR');
  };

  const handleShare = async () => {
    const text = `📊 Ponto de Equilíbrio\n\nCustos Fixos: ${formatCurrency(fixedCosts)}\nPreço de Venda: ${formatCurrency(sellingPrice)}\nCusto Variável: ${formatCurrency(variableCost)}\n\n🎯 Break-even: ${formatNumber(calculation.breakevenUnits)} unidades\n💰 Faturamento Mínimo: ${formatCurrency(calculation.breakevenRevenue)}\n\nCalculado em guilda.app.br/tools/breakeven-calculator`;
    
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t('common.linkCopied'));
    } catch {
      toast.error('Erro ao copiar');
    }
  };

  const handleExportPDF = () => {
    const doc = generateToolPDF({
      title: 'Calculadora de Ponto de Equilíbrio',
      subtitle: 'Análise de Break-even',
      sections: [
        {
          title: 'Dados de Entrada',
          type: 'key-value',
          content: {
            'Custos Fixos Mensais': formatCurrency(fixedCosts),
            'Preço de Venda/Unidade': formatCurrency(sellingPrice),
            'Custo Variável/Unidade': formatCurrency(variableCost),
          },
        },
        {
          title: 'Resultado',
          type: 'key-value',
          content: {
            'Ponto de Equilíbrio': `${formatNumber(calculation.breakevenUnits)} unidades`,
            'Faturamento Mínimo': formatCurrency(calculation.breakevenRevenue),
            'Margem de Contribuição': `${formatCurrency(calculation.contributionMargin)} (${calculation.contributionMarginPercent.toFixed(1)}%)`,
          },
        },
      ],
    });
    doc.save('ponto-equilibrio.pdf');
    toast.success('PDF gerado com sucesso!');
  };

  return (
    <ToolPageLayout toolId="breakeven-calculator" icon={Target}>
      <Helmet>
        <title>Calculadora de Ponto de Equilíbrio | Guilda</title>
        <meta name="description" content="Calcule quantas unidades você precisa vender para cobrir todos os custos. Análise de break-even para seu negócio." />
        <link rel="canonical" href="https://www.guilda.app.br/ferramentas-empreendedores/breakeven-calculator" />
      </Helmet>

      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-8 overflow-hidden">
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Inputs */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Custos Fixos Mensais
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="w-4 h-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Custos que não mudam com o volume de vendas: aluguel, salários fixos, internet, contador, etc.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CurrencyInput
                  value={fixedCosts}
                  onChange={setFixedCosts}
                  className="text-lg"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Preço de Venda por Unidade
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="w-4 h-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Quanto você cobra por cada produto ou serviço vendido.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CurrencyInput
                  value={sellingPrice}
                  onChange={setSellingPrice}
                  className="text-lg"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Custo Variável por Unidade
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="w-4 h-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Custos diretamente relacionados à produção: matéria-prima, embalagem, comissão de venda, etc.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CurrencyInput
                  value={variableCost}
                  onChange={setVariableCost}
                  className="text-lg"
                />
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:sticky lg:top-24 h-fit space-y-6">
            {!calculation.isValid ? (
              <Card className="border-destructive">
                <CardContent className="py-8">
                  <div className="text-center">
                    <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
                    <p className="text-destructive font-medium">
                      O custo variável deve ser menor que o preço de venda.
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Você está vendendo abaixo do custo!
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                <Card className="border-primary">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-primary" />
                      Ponto de Equilíbrio
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center p-6 bg-primary/10 rounded-xl mb-4">
                      <p className="text-sm text-muted-foreground mb-1">Você precisa vender</p>
                      <p className="text-5xl font-bold text-primary">
                        {formatNumber(calculation.breakevenUnits)}
                      </p>
                      <p className="text-lg text-muted-foreground">unidades/mês</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Faturamento Mínimo</p>
                        <p className="text-lg font-bold">
                          {formatCurrency(calculation.breakevenRevenue)}
                        </p>
                      </div>
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Margem de Contribuição</p>
                        <p className="text-lg font-bold text-green-600">
                          {calculation.contributionMarginPercent.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Receita vs Custos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis 
                            dataKey="units" 
                            tick={{ fontSize: 11 }}
                            tickFormatter={(v) => `${v}`}
                          />
                          <YAxis 
                            tick={{ fontSize: 11 }}
                            tickFormatter={(v) => `${(v/1000).toFixed(0)}k`}
                          />
                          <Legend />
                          <ReferenceLine 
                            x={calculation.breakevenUnits} 
                            stroke="hsl(var(--primary))" 
                            strokeDasharray="5 5"
                            label={{ value: 'Break-even', fill: 'hsl(var(--primary))', fontSize: 10 }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="revenue" 
                            name="Receita" 
                            stroke="hsl(var(--primary))" 
                            strokeWidth={2}
                            dot={false}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="totalCosts" 
                            name="Custos Totais" 
                            stroke="hsl(var(--destructive))" 
                            strokeWidth={2}
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Formula */}
                <Card className="bg-muted/30">
                  <CardContent className="py-4">
                    <p className="text-xs text-muted-foreground mb-2">Fórmula:</p>
                    <p className="font-mono text-sm">
                      PE = Custos Fixos ÷ (Preço - Custo Variável)
                    </p>
                    <p className="font-mono text-xs text-muted-foreground mt-1">
                      {formatCurrency(fixedCosts)} ÷ ({formatCurrency(sellingPrice)} - {formatCurrency(variableCost)}) = {formatNumber(calculation.breakevenUnits)} un.
                    </p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mx-3 sm:mx-4 mt-6 sm:mt-8 p-4 bg-gray-50 border border-black/10 rounded-2xl">
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

export default BreakevenCalculator;
