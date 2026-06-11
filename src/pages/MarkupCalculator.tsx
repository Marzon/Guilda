import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { ToolPageLayout } from '@/components/tools/ToolPageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { CurrencyInput } from '@/components/ui/currency-input';
import { StickyActionBar } from '@/components/tools/StickyActionBar';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { DollarSign, Percent, Share2, Download, HelpCircle, TrendingUp, Calculator } from 'lucide-react';
import { toast } from 'sonner';
import { generateToolPDF } from '@/lib/pdf-generator';

const MarkupCalculator = () => {
  const { t } = useTranslation();

  const [cost, setCost] = useState(100);
  const [taxes, setTaxes] = useState(10);
  const [commissions, setCommissions] = useState(5);
  const [margin, setMargin] = useState(20);

  const calculation = useMemo(() => {
    const totalDeductions = (taxes + commissions + margin) / 100;
    
    if (totalDeductions >= 1) {
      return { sellingPrice: 0, profit: 0, markup: 0, isValid: false };
    }

    // Fórmula do Markup Divisor: Preço = Custo / (1 - Deduções)
    const sellingPrice = cost / (1 - totalDeductions);
    const profit = sellingPrice - cost - (sellingPrice * (taxes + commissions) / 100);
    const markup = ((sellingPrice - cost) / cost) * 100;

    return { 
      sellingPrice, 
      profit, 
      markup,
      isValid: true 
    };
  }, [cost, taxes, commissions, margin]);

  const chartData = useMemo(() => {
    if (!calculation.isValid) return [];
    
    const taxAmount = calculation.sellingPrice * (taxes / 100);
    const commissionAmount = calculation.sellingPrice * (commissions / 100);
    
    return [
      { name: 'Custo', value: cost, color: 'hsl(var(--muted-foreground))' },
      { name: 'Impostos', value: taxAmount, color: 'hsl(var(--destructive))' },
      { name: 'Comissões', value: commissionAmount, color: 'hsl(var(--accent))' },
      { name: 'Lucro', value: calculation.profit, color: 'hsl(var(--primary))' },
    ];
  }, [calculation, cost, taxes, commissions]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleShare = async () => {
    const text = `📊 Cálculo de Markup\n\nCusto: ${formatCurrency(cost)}\nPreço de Venda: ${formatCurrency(calculation.sellingPrice)}\nLucro: ${formatCurrency(calculation.profit)}\nMarkup: ${calculation.markup.toFixed(1)}%\n\nCalculado em guilda.app.br/tools/markup-calculator`;
    
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t('common.linkCopied'));
    } catch {
      toast.error('Erro ao copiar');
    }
  };

  const handleExportPDF = () => {
    const doc = generateToolPDF({
      title: 'Calculadora de Markup',
      subtitle: 'Cálculo de preço de venda usando Markup Divisor',
      sections: [
        {
          title: 'Dados de Entrada',
          type: 'key-value',
          content: {
            'Custo Unitário': formatCurrency(cost),
            'Impostos': `${taxes}%`,
            'Comissões/Taxas': `${commissions}%`,
            'Margem de Lucro': `${margin}%`,
          },
        },
        {
          title: 'Resultado',
          type: 'key-value',
          content: {
            'Preço de Venda': formatCurrency(calculation.sellingPrice),
            'Lucro por Unidade': formatCurrency(calculation.profit),
            'Markup Aplicado': `${calculation.markup.toFixed(1)}%`,
          },
        },
      ],
    });
    doc.save('calculo-markup.pdf');
    toast.success('PDF gerado com sucesso!');
  };

  return (
    <ToolPageLayout toolId="markup-calculator" icon={Calculator}>
      <Helmet>
        <title>Calculadora de Markup | Guilda</title>
        <meta name="description" content="Calcule o preço de venda ideal usando a fórmula do Markup Divisor. Inclua impostos, comissões e margem de lucro." />
        <link rel="canonical" href="https://www.guilda.app.br/ferramentas-empreendedores/markup-calculator" />
      </Helmet>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Inputs */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  Custo do Produto
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Label className="text-sm text-muted-foreground mb-2 block">
                  Quanto você paga pelo produto ou serviço
                </Label>
                <CurrencyInput
                  value={cost}
                  onChange={setCost}
                  className="text-lg"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Percent className="w-5 h-5 text-destructive" />
                  Impostos
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="w-4 h-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Inclua todos os impostos sobre a venda: ICMS, ISS, PIS, COFINS, etc. No Simples Nacional, varia de 4% a 19%.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Slider
                    value={[taxes]}
                    onValueChange={(v) => setTaxes(v[0])}
                    max={50}
                    step={0.5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">0%</span>
                    <span className="font-bold text-destructive">{taxes}%</span>
                    <span className="text-muted-foreground">50%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Percent className="w-5 h-5 text-accent" />
                  Comissões e Taxas
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="w-4 h-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Taxas de marketplace, comissão de vendedor, taxas de cartão, frete, etc.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Slider
                    value={[commissions]}
                    onValueChange={(v) => setCommissions(v[0])}
                    max={30}
                    step={0.5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">0%</span>
                    <span className="font-bold text-accent">{commissions}%</span>
                    <span className="text-muted-foreground">30%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Margem de Lucro Desejada
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="w-4 h-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>A porcentagem do preço final que você quer como lucro líquido. Varejo típico: 10-30%. Serviços: 30-50%.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Slider
                    value={[margin]}
                    onValueChange={(v) => setMargin(v[0])}
                    max={60}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">0%</span>
                    <span className="font-bold text-primary">{margin}%</span>
                    <span className="text-muted-foreground">60%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:sticky lg:top-24 h-fit space-y-6">
            <Card className={!calculation.isValid ? 'border-destructive' : 'border-primary'}>
              <CardHeader>
                <CardTitle>Resultado</CardTitle>
              </CardHeader>
              <CardContent>
                {!calculation.isValid ? (
                  <div className="text-center py-8">
                    <p className="text-destructive font-medium">
                      ⚠️ As deduções somam 100% ou mais. Ajuste os valores.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="text-center p-6 bg-primary/10 rounded-xl">
                      <p className="text-sm text-muted-foreground mb-1">Preço de Venda</p>
                      <p className="text-4xl font-bold text-primary">
                        {formatCurrency(calculation.sellingPrice)}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Lucro por Unidade</p>
                        <p className="text-xl font-bold text-green-600">
                          {formatCurrency(calculation.profit)}
                        </p>
                      </div>
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Markup Aplicado</p>
                        <p className="text-xl font-bold">
                          {calculation.markup.toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    {/* Chart */}
                    <div className="h-64">
                      <p className="text-sm font-medium mb-2">Composição do Preço</p>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} layout="vertical">
                          <XAxis type="number" hide />
                          <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} />
                          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                            <LabelList 
                              dataKey="value" 
                              position="right" 
                              formatter={(v: number) => formatCurrency(v)}
                              style={{ fontSize: 11, fill: 'hsl(var(--foreground))' }}
                            />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Formula explanation */}
                    <div className="p-4 bg-muted/30 rounded-lg border border-border">
                      <p className="text-xs text-muted-foreground mb-2">Fórmula do Markup Divisor:</p>
                      <p className="font-mono text-sm">
                        Preço = Custo ÷ (1 - Deduções)
                      </p>
                      <p className="font-mono text-xs text-muted-foreground mt-1">
                        {formatCurrency(cost)} ÷ (1 - {((taxes + commissions + margin) / 100).toFixed(2)}) = {formatCurrency(calculation.sellingPrice)}
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
          ⚠️ Esta calculadora é apenas para fins educacionais. Os resultados são estimativas e não substituem análise financeira ou contábil profissional.
        </p>
      </div>

      <StickyActionBar
        onDownload={handleExportPDF}
        showDownload={true}
      />
    </ToolPageLayout>
  );
};

export default MarkupCalculator;
