import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { ToolPageLayout } from '@/components/tools/ToolPageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CurrencyInput } from '@/components/ui/currency-input';
import { StickyActionBar } from '@/components/tools/StickyActionBar';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { CreditCard, Share2, Download, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { generateToolPDF } from '@/lib/pdf-generator';

const CardFeeSimulator = () => {
  const { t } = useTranslation();

  const [saleValue, setSaleValue] = useState(1000);
  const [debitFee, setDebitFee] = useState(1.99);
  const [creditFee, setCreditFee] = useState(3.49);
  const [installmentFee, setInstallmentFee] = useState(12.99);

  const calculations = useMemo(() => {
    const debit = {
      name: 'Débito',
      netValue: saleValue * (1 - debitFee / 100),
      discount: saleValue * (debitFee / 100),
      fee: debitFee,
    };

    const credit = {
      name: 'Crédito à Vista',
      netValue: saleValue * (1 - creditFee / 100),
      discount: saleValue * (creditFee / 100),
      fee: creditFee,
    };

    const installment = {
      name: 'Crédito 12x',
      netValue: saleValue * (1 - installmentFee / 100),
      discount: saleValue * (installmentFee / 100),
      fee: installmentFee,
    };

    const best = [debit, credit, installment].reduce((prev, curr) =>
      curr.netValue > prev.netValue ? curr : prev
    );

    return { debit, credit, installment, best };
  }, [saleValue, debitFee, creditFee, installmentFee]);

  const chartData = useMemo(() => [
    { 
      name: 'Débito', 
      recebido: calculations.debit.netValue, 
      desconto: calculations.debit.discount,
      color: 'hsl(var(--primary))'
    },
    { 
      name: 'Crédito 1x', 
      recebido: calculations.credit.netValue, 
      desconto: calculations.credit.discount,
      color: 'hsl(var(--accent))'
    },
    { 
      name: 'Crédito 12x', 
      recebido: calculations.installment.netValue, 
      desconto: calculations.installment.discount,
      color: 'hsl(var(--muted-foreground))'
    },
  ], [calculations]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleShare = async () => {
    const text = `💳 Simulador de Maquininha\n\nVenda: ${formatCurrency(saleValue)}\n\nDébito (${debitFee}%): ${formatCurrency(calculations.debit.netValue)}\nCrédito à Vista (${creditFee}%): ${formatCurrency(calculations.credit.netValue)}\nCrédito 12x (${installmentFee}%): ${formatCurrency(calculations.installment.netValue)}\n\n✅ Melhor opção: ${calculations.best.name}\n\nCalculado em guilda.app.br/tools/card-fee-simulator`;
    
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t('common.linkCopied'));
    } catch {
      toast.error('Erro ao copiar');
    }
  };

  const handleExportPDF = () => {
    const doc = generateToolPDF({
      title: 'Simulador de Taxas de Maquininha',
      subtitle: 'Comparativo de recebimento por modalidade',
      sections: [
        {
          title: 'Valor da Venda',
          type: 'key-value',
          content: {
            'Valor Bruto': formatCurrency(saleValue),
          },
        },
        {
          title: 'Comparativo',
          type: 'table',
          content: [
            ['Modalidade', 'Taxa', 'Valor Líquido', 'Desconto'],
            ['Débito', `${debitFee}%`, formatCurrency(calculations.debit.netValue), formatCurrency(calculations.debit.discount)],
            ['Crédito à Vista', `${creditFee}%`, formatCurrency(calculations.credit.netValue), formatCurrency(calculations.credit.discount)],
            ['Crédito 12x', `${installmentFee}%`, formatCurrency(calculations.installment.netValue), formatCurrency(calculations.installment.discount)],
          ],
        },
        {
          title: 'Recomendação',
          type: 'text',
          content: `A melhor opção para esta venda é ${calculations.best.name}, onde você recebe ${formatCurrency(calculations.best.netValue)} (desconto de ${formatCurrency(calculations.best.discount)}).`,
        },
      ],
    });
    doc.save('simulador-maquininha.pdf');
    toast.success('PDF gerado com sucesso!');
  };

  const ResultCard = ({ data, isBest }: { data: typeof calculations.debit; isBest: boolean }) => (
    <Card className={`relative ${isBest ? 'border-primary ring-2 ring-primary/20' : ''}`}>
      {isBest && (
        <div className="absolute -top-3 left-4 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
          <CheckCircle className="w-3 h-3" /> Melhor opção
        </div>
      )}
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{data.name}</CardTitle>
        <p className="text-sm text-muted-foreground">Taxa: {data.fee}%</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground">Você recebe</p>
            <p className={`text-2xl font-bold ${isBest ? 'text-primary' : ''}`}>
              {formatCurrency(data.netValue)}
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <span className="text-muted-foreground">
              Desconto: <span className="text-destructive font-medium">{formatCurrency(data.discount)}</span>
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <ToolPageLayout toolId="card-fee-simulator" icon={CreditCard}>
      <Helmet>
        <title>Simulador de Taxas de Maquininha | Guilda</title>
        <meta name="description" content="Compare quanto você recebe no débito, crédito à vista e crédito parcelado. Simule as taxas da sua maquininha." />
        <link rel="canonical" href="https://www.guilda.app.br/ferramentas-empreendedores/card-fee-simulator" />
      </Helmet>

      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-8 overflow-hidden">
        {/* Inputs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Valor da Venda</CardTitle>
            </CardHeader>
            <CardContent>
              <CurrencyInput
                value={saleValue}
                onChange={setSaleValue}
                className="text-lg"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Taxa Débito (%)</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                type="number"
                step="0.01"
                value={debitFee}
                onChange={(e) => setDebitFee(parseFloat(e.target.value) || 0)}
                className="text-lg"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Taxa Crédito 1x (%)</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                type="number"
                step="0.01"
                value={creditFee}
                onChange={(e) => setCreditFee(parseFloat(e.target.value) || 0)}
                className="text-lg"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Taxa Crédito 12x (%)</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                type="number"
                step="0.01"
                value={installmentFee}
                onChange={(e) => setInstallmentFee(parseFloat(e.target.value) || 0)}
                className="text-lg"
              />
            </CardContent>
          </Card>
        </div>

        {/* Results Cards */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <ResultCard 
            data={calculations.debit} 
            isBest={calculations.best.name === 'Débito'} 
          />
          <ResultCard 
            data={calculations.credit} 
            isBest={calculations.best.name === 'Crédito à Vista'} 
          />
          <ResultCard 
            data={calculations.installment} 
            isBest={calculations.best.name === 'Crédito 12x'} 
          />
        </div>

        {/* Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Comparativo Visual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical">
                  <XAxis type="number" tickFormatter={(v) => formatCurrency(v)} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" width={70} tick={{ fontSize: 11 }} />
                  <Bar dataKey="recebido" name="Valor Recebido" radius={[0, 4, 4, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                    <LabelList 
                      dataKey="recebido" 
                      position="right" 
                      formatter={(v: number) => formatCurrency(v)}
                      style={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Tip */}
        <Card className="mt-6 bg-primary/5 border-primary/20">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Dica: Negocie suas taxas</p>
                <p className="text-sm text-muted-foreground">
                  Se você processa mais de R$ 10.000/mês, entre em contato com sua operadora para negociar taxas menores. 
                  Algumas oferecem até 1.5% no débito para alto volume.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <div className="mt-8 p-4 bg-gray-50 border border-black/10 rounded-2xl">
          <p className="text-sm text-gray-500 text-center">
            ⚠️ Este simulador é apenas para fins educacionais. As taxas apresentadas são estimativas e podem variar conforme sua operadora de pagamentos.
          </p>
        </div>
      </div>

      <StickyActionBar
        onDownload={handleExportPDF}
        showDownload={true}
      />
    </ToolPageLayout>
  );
};

export default CardFeeSimulator;
