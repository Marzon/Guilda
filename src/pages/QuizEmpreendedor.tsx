import { useState, useCallback, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { QuizLanding } from "@/components/quiz/QuizLanding";
import { QuizQuestion } from "@/components/quiz/QuizQuestion";
import { QuizTransition } from "@/components/quiz/QuizTransition";
import { QuizResult } from "@/components/quiz/QuizResult";
import { QuizResultadoLanding } from "@/components/quiz/QuizResultadoLanding";
import { LandingDarkNavbar } from "@/components/landing/LandingDarkNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { QUESTIONS, ARCHETYPES, getArchetype, calculateRadarDims } from "@/data/quizData";

type Phase = "landing" | "resultado-landing" | "quiz" | "transition" | "result";

export default function QuizEmpreendedor() {
  const resultadoParam = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("resultado");
  }, []);

  const [phase, setPhase] = useState<Phase>(
    resultadoParam && ["mago", "arquiteto", "paladino", "estrategista", "ranger", "comandante"].includes(resultadoParam)
      ? "resultado-landing"
      : "landing"
  );
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [scoreX, setScoreX] = useState(0);
  const [scoreY, setScoreY] = useState(0);
  const [leadQuality, setLeadQuality] = useState("cold");
  const [archetypeKey, setArchetypeKey] = useState("");
  const [radarDims, setRadarDims] = useState<number[]>([0, 0, 0, 0, 0]);

  const handleStart = useCallback(() => setPhase("quiz"), []);

  const handleBack = useCallback(() => {
    if (currentQuestion === 0) {
      setPhase("landing");
    } else {
      const prevAnswer = answers[answers.length - 1];
      const prevQuestion = QUESTIONS[currentQuestion - 1];
      const prevOption = prevQuestion.options[prevAnswer];

      let newX = scoreX;
      let newY = scoreY;
      let newLeadQuality = leadQuality;

      if (!prevQuestion.qualifier) {
        newX -= prevOption.x;
        newY -= prevOption.y;
      }
      if (prevQuestion.qualifier && prevOption.lead) {
        newLeadQuality = "cold";
      }

      setAnswers(answers.slice(0, -1));
      setScoreX(newX);
      setScoreY(newY);
      setLeadQuality(newLeadQuality);
      setCurrentQuestion((prev) => prev - 1);
    }
  }, [currentQuestion, answers, scoreX, scoreY, leadQuality]);

  const handleSelect = useCallback(
    (optionIndex: number) => {
      const question = QUESTIONS[currentQuestion];
      const option = question.options[optionIndex];
      const newAnswers = [...answers, optionIndex];

      // Accumulate X/Y (skip qualifier)
      let newX = scoreX;
      let newY = scoreY;
      if (!question.qualifier) {
        newX += option.x;
        newY += option.y;
      }

      // Extract lead quality from qualifier
      let newLeadQuality = leadQuality;
      if (question.qualifier && option.lead) {
        newLeadQuality = option.lead;
      }

      setAnswers(newAnswers);
      setScoreX(newX);
      setScoreY(newY);
      setLeadQuality(newLeadQuality);

      if (currentQuestion < QUESTIONS.length - 1) {
        // Next question after brief delay for selection feel
        setTimeout(() => setCurrentQuestion((prev) => prev + 1), 400);
      } else {
        // Calculate final results
        const key = getArchetype(newX, newY);
        const dims = calculateRadarDims(newAnswers);
        setArchetypeKey(key);
        setRadarDims(dims);

        // Show transition
        setPhase("transition");
        setTimeout(() => setPhase("result"), 2000);
      }
    },
    [currentQuestion, answers, scoreX, scoreY, leadQuality]
  );

  return (
    <>
      <Helmet>
        <title>Quiz: Qual é o Seu Perfil de Empreendedor? | Guilda</title>
        <meta
          name="description"
          content="Descubra em 2 minutos que tipo de fundador você é e qual perfil complementar de co-founder você precisa para fazer sua startup decolar. Grátis, sem cadastro."
        />
        <meta property="og:title" content="Quiz: Qual é o Seu Perfil de Empreendedor?" />
        <meta
          property="og:description"
          content="Descubra em 2 minutos que tipo de fundador você é e qual perfil complementar de co-founder você precisa para fazer sua startup decolar. Grátis."
        />
        <meta property="og:url" content="https://guilda.app.br/quiz-empreendedor" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <div className="min-h-screen bg-[#110C1F] flex flex-col">
        <LandingDarkNavbar />
        <div className="flex-1 flex flex-col items-center pt-20 md:pt-24">
          <div className="w-full max-w-[560px] py-8">
            {phase === "landing" && <QuizLanding onStart={handleStart} />}
            {phase === "resultado-landing" && resultadoParam && (
              <QuizResultadoLanding archetypeKey={resultadoParam} onStart={handleStart} />
            )}
            {phase === "quiz" && (
              <QuizQuestion
                question={QUESTIONS[currentQuestion]}
                questionIndex={currentQuestion}
                total={QUESTIONS.length}
                onSelect={handleSelect}
                onBack={handleBack}
              />
            )}
            {phase === "transition" && <QuizTransition />}
            {phase === "result" && archetypeKey && (
              <QuizResult
                archetypeKey={archetypeKey}
                archetype={ARCHETYPES[archetypeKey]}
                radarDims={radarDims}
                scoreX={scoreX}
                scoreY={scoreY}
                leadQuality={leadQuality}
              />
            )}
          </div>
        </div>
        <LandingFooter />
      </div>
    </>
  );
}
