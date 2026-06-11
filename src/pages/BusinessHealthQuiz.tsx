import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { ToolPageLayout } from '@/components/tools/ToolPageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { StickyActionBar } from '@/components/tools/StickyActionBar';
import { Activity, Share2, RotateCcw, CheckCircle, AlertTriangle, XCircle, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';

interface Question {
  id: string;
  text: string;
  category: 'finance' | 'marketing' | 'process';
  recommendation: string;
}

const QUESTIONS: Question[] = [
  {
    id: 'cashflow',
    text: 'Você tem controle de fluxo de caixa atualizado?',
    category: 'finance',
    recommendation: 'Implemente um sistema de controle financeiro (Excel, Conta Azul, Nibo) e atualize semanalmente.',
  },
  {
    id: 'emergency',
    text: 'Sua empresa tem reserva de emergência (3+ meses)?',
    category: 'finance',
    recommendation: 'Reserve pelo menos 3 meses de custos fixos em uma conta separada para imprevistos.',
  },
  {
    id: 'cac',
    text: 'Você sabe seu custo por aquisição de cliente (CAC)?',
    category: 'marketing',
    recommendation: 'Calcule: CAC = Total gasto em marketing ÷ Número de clientes adquiridos. Monitore mensalmente.',
  },
  {
    id: 'margin',
    text: 'Sua margem de lucro está acima de 20%?',
    category: 'finance',
    recommendation: 'Se a margem está baixa, revise custos, renegocie com fornecedores ou ajuste preços.',
  },
  {
    id: 'social',
    text: 'Você tem presença ativa nas redes sociais?',
    category: 'marketing',
    recommendation: 'Escolha 1-2 redes onde seu público está e poste conteúdo útil pelo menos 3x por semana.',
  },
  {
    id: 'website',
    text: 'Sua empresa tem site ou página de vendas?',
    category: 'marketing',
    recommendation: 'Crie uma página simples com: o que você faz, benefícios, prova social e CTA claro.',
  },
  {
    id: 'feedback',
    text: 'Você coleta feedback dos clientes regularmente?',
    category: 'process',
    recommendation: 'Envie pesquisa NPS após cada venda. Use Google Forms ou Typeform gratuitamente.',
  },
  {
    id: 'processes',
    text: 'Seus processos principais estão documentados?',
    category: 'process',
    recommendation: 'Documente os 5 processos mais importantes em checklists simples no Notion ou Google Docs.',
  },
  {
    id: 'competitors',
    text: 'Você faz análise de concorrência periodicamente?',
    category: 'marketing',
    recommendation: 'Mapeie 3-5 concorrentes, compare preços, proposta de valor e identifique oportunidades.',
  },
  {
    id: 'goals',
    text: 'Sua empresa tem metas claras para o trimestre?',
    category: 'process',
    recommendation: 'Defina 3 metas SMART (Específicas, Mensuráveis, Atingíveis, Relevantes, Temporais) por trimestre.',
  },
];

const BusinessHealthQuiz = () => {
  const { t } = useTranslation();
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [showResults, setShowResults] = useState(false);

  const toggleAnswer = (id: string) => {
    setAnswers(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const score = useMemo(() => {
    return Object.values(answers).filter(Boolean).length;
  }, [answers]);

  const result = useMemo(() => {
    if (score >= 8) {
      return {
        level: 'healthy',
        label: 'Saudável',
        color: 'text-green-500',
        bgColor: 'bg-green-500',
        borderColor: 'border-green-500',
        icon: CheckCircle,
        description: 'Parabéns! Sua empresa está bem estruturada. Continue monitorando e refinando seus processos.',
        thermometerHeight: '100%',
      };
    }
    if (score >= 5) {
      return {
        level: 'attention',
        label: 'Atenção',
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-500',
        borderColor: 'border-yellow-500',
        icon: AlertTriangle,
        description: 'Você está no caminho certo, mas há pontos importantes a melhorar. Foque nas áreas sinalizadas.',
        thermometerHeight: '60%',
      };
    }
    return {
      level: 'critical',
      label: 'Crítico',
      color: 'text-red-500',
      bgColor: 'bg-red-500',
      borderColor: 'border-red-500',
      icon: XCircle,
      description: 'Sua empresa precisa de atenção urgente. Priorize os itens básicos de finanças e processos.',
      thermometerHeight: '25%',
    };
  }, [score]);

  const recommendations = useMemo(() => {
    return QUESTIONS.filter(q => !answers[q.id]);
  }, [answers]);

  const categoryScores = useMemo(() => {
    const categories = { finance: 0, marketing: 0, process: 0 };
    const categoryTotals = { finance: 0, marketing: 0, process: 0 };

    QUESTIONS.forEach(q => {
      categoryTotals[q.category]++;
      if (answers[q.id]) {
        categories[q.category]++;
      }
    });

    return {
      finance: { score: categories.finance, total: categoryTotals.finance },
      marketing: { score: categories.marketing, total: categoryTotals.marketing },
      process: { score: categories.process, total: categoryTotals.process },
    };
  }, [answers]);

  const handleShare = async () => {
    const text = `🌡️ Termômetro de Negócio\n\nMinha pontuação: ${score}/10\nStatus: ${result.label}\n\n${result.description}\n\nFaça o seu: guilda.app.br/tools/business-health-quiz`;
    
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t('common.linkCopied'));
    } catch {
      toast.error('Erro ao copiar');
    }
  };

  const handleReset = () => {
    setAnswers({});
    setShowResults(false);
  };

  const ResultIcon = result.icon;

  return (
    <ToolPageLayout toolId="business-health-quiz" icon={Activity}>
      <Helmet>
        <title>Termômetro de Negócio | Guilda</title>
        <meta name="description" content="Avalie a saúde do seu negócio com 10 perguntas sobre finanças, marketing e processos. Receba recomendações personalizadas." />
        <link rel="canonical" href="https://www.guilda.app.br/ferramentas-empreendedores/business-health-quiz" />
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {!showResults ? (
          <>
            {/* Progress */}
            <div className="mb-8">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Progresso</span>
                <span className="font-medium">{score}/10 respondidas</span>
              </div>
              <Progress value={(score / 10) * 100} className="h-2 bg-guilda-gold/30" />
            </div>

            {/* Questions */}
            <div className="space-y-4 mb-8">
              {QUESTIONS.map((question, index) => (
                <Card 
                  key={question.id}
                  className={`cursor-pointer transition-all ${answers[question.id] ? 'border-primary bg-primary/5' : 'hover:border-muted-foreground/50'}`}
                  onClick={() => toggleAnswer(question.id)}
                >
                  <CardContent className="py-4">
                    <div className="flex items-start gap-4">
                      <Checkbox
                        id={question.id}
                        checked={answers[question.id] || false}
                        onCheckedChange={() => toggleAnswer(question.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <label 
                          htmlFor={question.id}
                          className="text-sm font-medium cursor-pointer"
                        >
                          {index + 1}. {question.text}
                        </label>
                        <span className={`text-xs ml-2 px-2 py-0.5 rounded ${
                          question.category === 'finance' ? 'bg-green-100 text-green-700' :
                          question.category === 'marketing' ? 'bg-blue-100 text-blue-700' :
                          'bg-purple-100 text-purple-700'
                        }`}>
                          {question.category === 'finance' ? 'Finanças' :
                           question.category === 'marketing' ? 'Marketing' : 'Processos'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button 
              onClick={() => setShowResults(true)}
              size="lg"
              className="w-full"
            >
              Ver Resultado
            </Button>
          </>
        ) : (
          <div className="space-y-8">
            {/* Result Card */}
            <Card className={`border-2 ${result.borderColor}`}>
              <CardContent className="py-8">
                <div className="flex flex-col lg:flex-row items-center gap-8">
                  {/* Thermometer */}
                  <div className="relative w-20 h-64 bg-muted rounded-full overflow-hidden border-4 border-border">
                    <div 
                      className={`absolute bottom-0 left-0 right-0 ${result.bgColor} transition-all duration-1000 rounded-b-full`}
                      style={{ height: result.thermometerHeight }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-white drop-shadow-lg">
                        {score}
                      </span>
                    </div>
                    {/* Scale markers */}
                    <div className="absolute right-full mr-2 top-0 text-xs text-muted-foreground">10</div>
                    <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">5</div>
                    <div className="absolute right-full mr-2 bottom-0 text-xs text-muted-foreground">0</div>
                  </div>

                  {/* Result Info */}
                  <div className="flex-1 text-center lg:text-left">
                    <div className={`inline-flex items-center gap-2 mb-4 ${result.color}`}>
                      <ResultIcon className="w-8 h-8" />
                      <span className="text-3xl font-bold">{result.label}</span>
                    </div>
                    <p className="text-lg text-muted-foreground mb-6">{result.description}</p>

                    {/* Category breakdown */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <p className="text-xs text-muted-foreground">Finanças</p>
                        <p className="text-lg font-bold">{categoryScores.finance.score}/{categoryScores.finance.total}</p>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <p className="text-xs text-muted-foreground">Marketing</p>
                        <p className="text-lg font-bold">{categoryScores.marketing.score}/{categoryScores.marketing.total}</p>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <p className="text-xs text-muted-foreground">Processos</p>
                        <p className="text-lg font-bold">{categoryScores.process.score}/{categoryScores.process.total}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                    Recomendações para Melhorar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recommendations.map((rec, index) => (
                      <div key={rec.id} className="flex gap-4 p-4 bg-muted/30 rounded-lg">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-sm mb-1">{rec.text}</p>
                          <p className="text-sm text-muted-foreground">{rec.recommendation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Button 
              onClick={handleReset}
              variant="outline"
              size="lg"
              className="w-full"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Refazer Quiz
            </Button>
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-8 p-4 bg-gray-50 border border-black/10 rounded-2xl">
          <p className="text-sm text-gray-500 text-center">
            ⚠️ Este quiz é apenas para fins educacionais e de autodiagnóstico. Os resultados são indicativos e não substituem consultoria profissional de negócios.
          </p>
        </div>
      </div>

      {/* Removed StickyActionBar - no download or email functionality needed */}
    </ToolPageLayout>
  );
};

export default BusinessHealthQuiz;
