import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { 
  Lightbulb, 
  FileText, 
  Code, 
  Rocket,
  CheckCircle2, 
  Circle,
  AlertTriangle,
  ExternalLink,
  Sparkles,
  Wand2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { ToolTipsBox } from "@/components/tools/ToolHelpTooltip";
import { useToolTracking } from "@/hooks/useToolTracking";

interface Task {
  id: string;
  completed: boolean;
}

interface Phase {
  id: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  tasks: Task[];
}

const MvpVibecoding = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  useToolTracking('mvp-vibecoding');

  const [phases, setPhases] = useState<Phase[]>([
    {
      id: "fundamentals",
      icon: <Lightbulb className="h-5 w-5" />,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      tasks: [
        { id: "task1", completed: false },
        { id: "task2", completed: false },
        { id: "task3", completed: false },
        { id: "task4", completed: false },
      ],
    },
    {
      id: "preparation",
      icon: <FileText className="h-5 w-5" />,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      tasks: [
        { id: "task1", completed: false },
        { id: "task2", completed: false },
        { id: "task3", completed: false },
        { id: "task4", completed: false },
        { id: "task5", completed: false },
      ],
    },
    {
      id: "building",
      icon: <Code className="h-5 w-5" />,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      tasks: [
        { id: "task1", completed: false },
        { id: "task2", completed: false },
        { id: "task3", completed: false },
        { id: "task4", completed: false },
        { id: "task5", completed: false },
      ],
    },
    {
      id: "launch",
      icon: <Rocket className="h-5 w-5" />,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      tasks: [
        { id: "task1", completed: false },
        { id: "task2", completed: false },
        { id: "task3", completed: false },
        { id: "task4", completed: false },
      ],
    },
  ]);

  const toggleTask = (phaseId: string, taskId: string) => {
    setPhases(phases.map(phase => {
      if (phase.id === phaseId) {
        return {
          ...phase,
          tasks: phase.tasks.map(task => 
            task.id === taskId ? { ...task, completed: !task.completed } : task
          ),
        };
      }
      return phase;
    }));
  };

  const totalTasks = phases.reduce((acc, phase) => acc + phase.tasks.length, 0);
  const completedTasks = phases.reduce(
    (acc, phase) => acc + phase.tasks.filter(t => t.completed).length, 
    0
  );
  const progressPercentage = Math.round((completedTasks / totalTasks) * 100);

  const tools = [
    { name: "Lovable", url: "https://lovable.dev", description: t("tools.mvp-vibecoding.resources.lovable") },
    { name: "Cursor", url: "https://cursor.com", description: t("tools.mvp-vibecoding.resources.cursor") },
    { name: "v0", url: "https://v0.dev", description: t("tools.mvp-vibecoding.resources.v0") },
    { name: "Bolt", url: "https://bolt.new", description: t("tools.mvp-vibecoding.resources.bolt") },
    { name: "Replit", url: "https://replit.com", description: t("tools.mvp-vibecoding.resources.replit") },
    { name: "Skyone Studio", url: "https://skyone.solutions/", description: t("tools.mvp-vibecoding.resources.skyone") },
  ];

  return (
    <ToolPageLayout toolId="mvp-vibecoding" icon={Sparkles} iconColor="text-fuchsia-500" iconBgColor="bg-fuchsia-500/10">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-fuchsia-500/10 mb-4">
            <Sparkles className="h-8 w-8 text-fuchsia-500" />
          </div>
          <h1 className="text-3xl font-bold mb-2">{t("tools.mvp-vibecoding.title")}</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("tools.mvp-vibecoding.description")}
          </p>
        </div>

        {/* Progress Card */}
        <Card className="mb-8 bg-black text-white border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-fuchsia-400" />
              {t("tools.mvp-vibecoding.progress")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">
                  {completedTasks} / {totalTasks} {t("common.tasks")}
                </span>
                <span className="font-medium text-fuchsia-400">{progressPercentage}%</span>
              </div>
              <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-700">
                <div 
                  className="h-full bg-fuchsia-500 transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Intro Card */}
        <Card className="mb-8 border-fuchsia-500/20 bg-fuchsia-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-fuchsia-500" />
              {t("tools.mvp-vibecoding.intro.title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {t("tools.mvp-vibecoding.intro.description")}
            </p>
          </CardContent>
        </Card>

        {/* Warning Card */}
        <Card className="mb-8 border-amber-500/20 bg-amber-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-5 w-5" />
              {t("tools.mvp-vibecoding.warning.title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {t("tools.mvp-vibecoding.warning.description")}
            </p>
          </CardContent>
        </Card>

        {/* Phases */}
        <Accordion type="single" collapsible className="space-y-4 mb-8">
          {phases.map((phase, index) => {
            const phaseProgress = Math.round(
              (phase.tasks.filter(t => t.completed).length / phase.tasks.length) * 100
            );
            
            return (
              <AccordionItem key={phase.id} value={phase.id} className="border-2 rounded-lg overflow-hidden">
                <AccordionTrigger className={`px-6 py-4 hover:no-underline ${phase.bgColor}`}>
                  <div className="flex items-center gap-4 w-full">
                    <div className={`p-3 rounded-xl bg-background`}>
                      <div className={phase.color}>{phase.icon}</div>
                    </div>
                    <div className="flex-1 text-left">
                      <span className="text-muted-foreground text-sm">
                        {t("tools.mvp-vibecoding.phase")} {index + 1}
                      </span>
                      <h3 className="text-lg font-semibold">
                        {t(`tools.mvp-vibecoding.phases.${phase.id}.title`)}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {t(`tools.mvp-vibecoding.phases.${phase.id}.subtitle`)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative w-20 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-600">
                        <div 
                          className={`h-full transition-all duration-300 ${phase.color.replace('text-', 'bg-')}`}
                          style={{ width: `${phaseProgress}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-12">{phaseProgress}%</span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 py-4 space-y-4">
                  <p className="text-muted-foreground">
                    {t(`tools.mvp-vibecoding.phases.${phase.id}.description`)}
                  </p>

                  {/* Key Points */}
                  <div className="grid gap-2">
                    {["p1", "p2", "p3"].map((point) => (
                      <div key={point} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className={`h-4 w-4 mt-0.5 ${phase.color}`} />
                        <span>{t(`tools.mvp-vibecoding.phases.${phase.id}.points.${point}`)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Checklist */}
                  <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
                    <h4 className="font-medium text-sm">Checklist</h4>
                    {phase.tasks.map((task) => (
                      <button
                        key={task.id}
                        onClick={() => toggleTask(phase.id, task.id)}
                        className="flex items-center gap-3 w-full text-left hover:bg-muted/50 p-2 rounded-lg transition-colors"
                      >
                        {task.completed ? (
                          <CheckCircle2 className={`h-5 w-5 ${phase.color}`} />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground" />
                        )}
                        <span className={task.completed ? "line-through text-muted-foreground" : ""}>
                          {t(`tools.mvp-vibecoding.phases.${phase.id}.tasks.${task.id}`)}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Tip */}
                  <div className={`p-4 rounded-lg ${phase.bgColor}`}>
                    <p className="text-sm">
                      <span className="font-medium">💡 {t("common.tip")}:</span>{" "}
                      {t(`tools.mvp-vibecoding.phases.${phase.id}.tip`)}
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>

        {/* Red Flags */}
        <Card className="mb-8 border-red-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-500">
              <AlertTriangle className="h-5 w-5" />
              {t("tools.mvp-vibecoding.redFlags.title")}
            </CardTitle>
            <CardDescription>
              {t("tools.mvp-vibecoding.redFlags.subtitle")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {["f1", "f2", "f3", "f4"].map((flag) => (
                <div key={flag} className="flex items-start gap-3 p-3 rounded-lg bg-red-500/5">
                  <span className="text-red-500">⚠️</span>
                  <span className="text-sm">{t(`tools.mvp-vibecoding.redFlags.${flag}`)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <ToolTipsBox toolId="mvp-vibecoding" />

        {/* Resources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-fuchsia-500" />
              {t("tools.mvp-vibecoding.resources.title")}
            </CardTitle>
            <CardDescription>
              {t("tools.mvp-vibecoding.resources.subtitle")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {tools.map((tool) => (
                <a
                  key={tool.name}
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="font-medium">{tool.name}</p>
                    <p className="text-sm text-muted-foreground">{tool.description}</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </a>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <div className="mt-8 p-4 bg-gray-50 border border-black/10 rounded-2xl">
          <p className="text-sm text-gray-500 text-center">
            ⚠️ {t("tools.mvp-vibecoding.disclaimer", "Este guia é apenas para fins educacionais. Resultados podem variar dependendo da execução e contexto do seu negócio.")}
          </p>
        </div>

        {/* CTA */}
        <Card className="mt-8 bg-black text-white border-0">
          <CardContent className="pt-6 text-center">
            <h3 className="text-xl font-bold mb-2">Pronto para construir?</h3>
            <p className="text-slate-300 mb-4">Encontre um co-founder para transformar sua ideia em realidade</p>
            <Button 
              size="lg"
              onClick={() => navigate('/auth?view=signup')}
              className="bg-fuchsia-500 hover:bg-fuchsia-600"
            >
              Encontrar Co-Founder
            </Button>
          </CardContent>
        </Card>
      </div>
    </ToolPageLayout>
  );
};

export default MvpVibecoding;
