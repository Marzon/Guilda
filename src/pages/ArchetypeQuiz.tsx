import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import QuizResultCard from '@/components/tools/QuizResultCard';
import SmartCTA from '@/components/tools/SmartCTA';
import { ToolPageLayout } from '@/components/tools/ToolPageLayout';
import { useToolTracking } from '@/hooks/useToolTracking';

const ArchetypeQuiz = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  useToolTracking('archetype-quiz');
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<('A' | 'B')[]>([]);
  const [showResult, setShowResult] = useState(false);

  const questions = [
    { id: 1, key: 'q1' },
    { id: 2, key: 'q2' },
    { id: 3, key: 'q3' },
    { id: 4, key: 'q4' },
    { id: 5, key: 'q5' },
    { id: 6, key: 'q6' },
    { id: 7, key: 'q7' },
    { id: 8, key: 'q8' },
    { id: 9, key: 'q9' },
    { id: 10, key: 'q10' },
  ];

  const handleAnswer = (answer: 'A' | 'B') => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResult(true);
    }
  };

  const calculateResult = () => {
    const builderScore = answers.filter((a) => a === 'A').length;
    const sellerScore = answers.filter((a) => a === 'B').length;
    const archetype: 'BUILDER' | 'SELLER' = builderScore >= sellerScore ? 'BUILDER' : 'SELLER';
    const percentage = Math.round((Math.max(builderScore, sellerScore) / 10) * 100);
    
    return { archetype, builderScore, sellerScore, percentage };
  };

  const restartQuiz = () => {
    setQuizStarted(false);
    setCurrentQuestion(0);
    setAnswers([]);
    setShowResult(false);
  };

  if (showResult) {
    const result = calculateResult();
    const isBuilder = result.archetype === 'BUILDER';

    return (
      <>
        <Helmet>
          <title>{t('quiz.resultTitle', { archetype: t(`quiz.result.${result.archetype}.title`) })} | Guilda</title>
        </Helmet>

        <ToolPageLayout toolId="archetype-quiz" icon={HelpCircle} iconColor="text-accent" iconBgColor="bg-accent/10">
          <div className="container mx-auto px-4 py-8 max-w-2xl">
            <QuizResultCard 
              archetype={result.archetype}
              builderScore={result.builderScore}
              sellerScore={result.sellerScore}
              percentage={result.percentage}
            />

            <Card className="mt-6 border-2">
              <CardHeader>
                <CardTitle>{t(`quiz.result.${result.archetype}.headline`)}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>{t(`quiz.result.${result.archetype}.description`)}</p>
                
                <div>
                  <h4 className="font-medium mb-2">{t('quiz.strengths')}</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>{t(`quiz.result.${result.archetype}.strength1`)}</li>
                    <li>{t(`quiz.result.${result.archetype}.strength2`)}</li>
                    <li>{t(`quiz.result.${result.archetype}.strength3`)}</li>
                  </ul>
                </div>

                <div className={`p-4 rounded-lg ${isBuilder ? 'bg-amber-500/10' : 'bg-primary/10'}`}>
                  <h4 className="font-medium mb-1">{t('quiz.idealPartner')}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t(`quiz.result.${result.archetype}.partner`)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <SmartCTA context={{ type: 'quiz-result', archetype: result.archetype }} />

            <div className="mt-6 space-y-4">
              <Button onClick={() => navigate('/auth?view=signup')} className="w-full" size="lg">
                {t('quiz.findPartner')}
              </Button>

              <Button variant="ghost" onClick={restartQuiz} className="w-full">
                {t('quiz.tryAgain')}
              </Button>
            </div>
          </div>
        </ToolPageLayout>
      </>
    );
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <>
      <Helmet>
        <title>{t('quiz.pageTitle')} | Guilda</title>
        <meta name="description" content={t('quiz.pageDescription')} />
        <meta name="keywords" content="teste perfil empreendedor, quiz founder, builder ou seller, tipo de empreendedor" />
        <link rel="canonical" href="https://www.guilda.app.br/ferramentas-empreendedores/archetype-quiz" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Quiz",
            "name": t('quiz.pageTitle'),
            "description": t('quiz.pageDescription'),
            "url": "https://www.guilda.app.br/ferramentas-empreendedores/archetype-quiz",
            "educationalLevel": "beginner"
          })}
        </script>
      </Helmet>

      <ToolPageLayout toolId="archetype-quiz" icon={HelpCircle} iconColor="text-accent" iconBgColor="bg-accent/10">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          {!quizStarted ? (
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                {t('quiz.title')}
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                {t('quiz.subtitle')}
              </p>
              <Card className="text-left mb-6 border-2">
                <CardContent className="pt-6 space-y-3">
                  <p>✓ {t('quiz.info1')}</p>
                  <p>✓ {t('quiz.info2')}</p>
                  <p>✓ {t('quiz.info3')}</p>
                </CardContent>
              </Card>
              <Button size="lg" onClick={() => setQuizStarted(true)}>
                {t('quiz.start')}
              </Button>
            </div>
          ) : (
            <>
              <Card className="mb-8 bg-black text-white border-0">
                <CardContent className="pt-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-300">{t('quiz.question')} {currentQuestion + 1}/{questions.length}</span>
                    <span className="text-primary">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-3" />
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-xl">
                    {t(`quiz.questions.${questions[currentQuestion].key}.question`)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left h-auto p-4 whitespace-normal border-2 hover:border-primary hover:bg-primary/5"
                    onClick={() => handleAnswer('A')}
                  >
                    <span className="font-medium mr-3 text-primary">A)</span>
                    {t(`quiz.questions.${questions[currentQuestion].key}.optionA`)}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left h-auto p-4 whitespace-normal border-2 hover:border-amber-500 hover:bg-amber-500/5"
                    onClick={() => handleAnswer('B')}
                  >
                    <span className="font-medium mr-3 text-amber-500">B)</span>
                    {t(`quiz.questions.${questions[currentQuestion].key}.optionB`)}
                  </Button>
                </CardContent>
              </Card>
            </>
          )}
        {/* Disclaimer */}
        <div className="mt-8 p-4 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
          <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
            ⚠️ {t("tools.archetype-quiz.disclaimer", "Este quiz é apenas para fins educacionais e de autoconhecimento. Os resultados são indicativos e não substituem uma análise aprofundada do seu perfil profissional.")}
          </p>
        </div>
        </div>
      </ToolPageLayout>
    </>
  );
};

export default ArchetypeQuiz;
