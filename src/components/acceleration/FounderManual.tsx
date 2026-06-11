import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  BookOpen, 
  Users, 
  FileText, 
  Wrench, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Check,
  Save,
  Loader2,
  Target,
  Map,
  Library,
  Zap,
  DollarSign,
  Camera,
  Clock,
  Scissors,
  Hammer,
  Rocket,
  Scale,
  AlertTriangle
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/routes";
import { AccelerationTeam } from "@/hooks/useAccelerationTeam";
import { CANON_BOOKS } from "@/data/canon-books";

interface FounderManualProps {
  isProgramStarted: boolean;
  team: AccelerationTeam | null;
  onUpdateName: (name: string) => void;
  onUpdateMemorandum: (memo: string) => void;
  onUpdateChecklist: (checklist: string[]) => void;
  isUpdatingName?: boolean;
  isUpdatingMemorandum?: boolean;
}

interface ChecklistItem {
  id: string;
  label: string;
  description?: string;
  link?: string;
  linkLabel?: string;
}

// Axiomas do protocolo
const AXIOMS = [
  {
    icon: Zap,
    title: "Ação > Intenção",
    description: "O que você diz que vai fazer é irrelevante. Só importa o que foi feito e PROVADO.",
    color: "from-red-500 to-rose-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
  {
    icon: DollarSign,
    title: "Venda > Construção",
    description: "Código, landing pages, prompts são zona de conforto. Falar com estranhos e cobrar dinheiro é trabalho real.",
    color: "from-amber-500 to-orange-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
  },
  {
    icon: Camera,
    title: "Prova Material",
    description: '"Feito" sem print, link ou áudio = NÃO FEITO. Sem evidência, não existe.',
    color: "from-blue-500 to-indigo-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  {
    icon: Clock,
    title: "Silêncio é Dado Negativo",
    description: "Sumiço > 24h = falha ou travamento emocional. O sistema está te observando.",
    color: "from-purple-500 to-violet-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
  },
];

// Fases do programa
const PHASES = [
  {
    number: 1,
    name: "O Corte",
    days: "Dias 1-3",
    icon: Scissors,
    color: "bg-red-500",
    borderColor: "border-red-500",
    textColor: "text-red-600",
    description: "Defina problema e solução com clareza brutal",
    details: "Sem jargões, sem buzzwords, sem enrolação. Se não consegue explicar para sua avó, refaça.",
  },
  {
    number: 2,
    name: "A Construção Suja",
    days: "Dias 4-7",
    icon: Hammer,
    color: "bg-amber-500",
    borderColor: "border-amber-500",
    textColor: "text-amber-600",
    description: "Saia do prédio. Fale com humanos reais.",
    details: "Cold calls, landing page, tráfego orgânico. Chega de teoria, hora da validação.",
  },
  {
    number: 3,
    name: "A Ofensiva",
    days: "Dias 8-14",
    icon: Rocket,
    color: "bg-blue-500",
    borderColor: "border-blue-500",
    textColor: "text-blue-600",
    description: "Hora de vender. Dinheiro real na conta.",
    details: "MVP manual, primeiras vendas, unit economics. Teoria virou passado.",
  },
  {
    number: 4,
    name: "O Veredito",
    days: "Dia 15",
    icon: Scale,
    color: "bg-emerald-500",
    borderColor: "border-emerald-500",
    textColor: "text-emerald-600",
    description: "Análise final: DO, PIVOT ou DIE",
    details: "Decisão baseada em dados, não em esperança. Sem meio-termo.",
  },
];

// Livros organizados por estágio
const BOOK_STAGES = [
  {
    stage: "idea",
    title: "Ideação",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    stage: "mvp",
    title: "Construção",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    stage: "traction",
    title: "Tração",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
  },
];

export const FounderManual = ({
  isProgramStarted,
  team,
  onUpdateName,
  onUpdateMemorandum,
  onUpdateChecklist,
  isUpdatingName = false,
  isUpdatingMemorandum = false,
}: FounderManualProps) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(!isProgramStarted);
  const [startupName, setStartupName] = useState(team?.startup_name || "");
  const [memorandum, setMemorandum] = useState((team as any)?.memorandum || "");
  const [checkedItems, setCheckedItems] = useState<Set<string>>(() => {
    const progress = (team as any)?.checklist_progress;
    if (Array.isArray(progress)) {
      return new Set(progress);
    }
    return new Set();
  });

  // Sync with team data
  useEffect(() => {
    if (team?.startup_name) {
      setStartupName(team.startup_name);
    }
    if ((team as any)?.memorandum) {
      setMemorandum((team as any).memorandum);
    }
  }, [team]);

  // Sync checklist from team data when it changes
  useEffect(() => {
    const progress = (team as any)?.checklist_progress;
    if (Array.isArray(progress)) {
      setCheckedItems(new Set(progress));
    }
  }, [(team as any)?.checklist_progress]);

  const checklistItems: ChecklistItem[] = [
    {
      id: "interview",
      label: t("acceleration.manual.checklist.interview", "Realizar entrevista de co-founders"),
      description: t("acceleration.manual.checklist.interviewDesc", "Use o guia de perguntas para se conhecerem melhor"),
      link: `${ROUTES.faq}?section=acceleration-prep`,
      linkLabel: t("acceleration.manual.checklist.interviewLink", "Ver guia no FAQ"),
    },
    {
      id: "explore",
      label: t("acceleration.manual.checklist.explore", "Explorar o site juntos"),
      description: t("acceleration.manual.checklist.exploreDesc", "Conheçam o Blog, as Ferramentas e recursos disponíveis"),
    },
    {
      id: "name",
      label: t("acceleration.manual.checklist.name", "Definir nome da startup"),
      description: t("acceleration.manual.checklist.nameDesc", "Escolham um nome provisório para a empresa"),
    },
    {
      id: "memo",
      label: t("acceleration.manual.checklist.memo", "Escrever memorando de entendimento"),
      description: t("acceleration.manual.checklist.memoDesc", "Documentem quem faz o quê no time"),
    },
  ];

  const toggleItem = (id: string) => {
    setCheckedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      onUpdateChecklist([...next]);
      return next;
    });
  };

  const handleSaveName = () => {
    if (startupName.trim() && startupName !== team?.startup_name) {
      onUpdateName(startupName.trim());
    }
  };

  const handleSaveMemorandum = () => {
    if (memorandum !== (team as any)?.memorandum) {
      onUpdateMemorandum(memorandum);
    }
  };

  const progress = (checkedItems.size / checklistItems.length) * 100;

  // Get essential books (marked as critical or universal)
  const essentialBooks = CANON_BOOKS.filter(book => 
    book.critical_for_stage === 'idea' || book.category === 'universal'
  ).slice(0, 6);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        {/* Header */}
        <CollapsibleTrigger asChild>
          <button className="w-full p-5 flex items-center justify-between hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-foreground text-lg">
                  {t("acceleration.manual.title", "Manual do Protocolo BuildUP")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isProgramStarted 
                    ? t("acceleration.manual.clickToExpand", "Clique para ver filosofia, fases e recursos")
                    : t("acceleration.manual.prepareMessage", "Prepare-se para a intensidade do programa")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isProgramStarted && (
                <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span>{checkedItems.size}/{checklistItems.length}</span>
                </div>
              )}
              {isOpen ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-5 pb-5">
            {/* Warning banner */}
            <div className="p-4 mb-5 bg-gradient-to-r from-destructive/10 to-destructive/5 rounded-xl border border-destructive/20">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-destructive/10">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <p className="font-bold text-destructive text-sm">
                    Você não está num curso. Você está numa simulação de guerra.
                  </p>
                  <p className="text-destructive/80 text-sm mt-1 leading-relaxed">
                    O objetivo é curar sua paralisia por análise. Em 15 dias, você terá um negócio validado com dinheiro na conta ou a certeza absoluta de que deve pivotar ou desistir.
                  </p>
                </div>
              </div>
            </div>

            {/* Accordion Sections */}
            <Accordion type="single" collapsible defaultValue="philosophy" className="space-y-2">
              {/* Section 1: Philosophy */}
              <AccordionItem value="philosophy" className="border border-red-200 rounded-lg overflow-hidden">
                <AccordionTrigger className="px-4 py-3 bg-red-50 hover:bg-red-100 hover:no-underline">
                  <div className="flex items-center gap-3">
                    <Target className="w-5 h-5 text-red-600" />
                    <span className="font-semibold text-red-800">1. Filosofia: Os Axiomas Centrais</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 py-4 bg-white">
                  <p className="text-sm text-slate-600 mb-4">
                    Regras imutáveis do protocolo. Internalize-as antes de começar.
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {AXIOMS.map((axiom, index) => (
                      <div 
                        key={index}
                        className={cn(
                          "p-4 rounded-lg border",
                          axiom.bgColor,
                          axiom.borderColor
                        )}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className={cn("p-1.5 rounded-md bg-gradient-to-br text-white", axiom.color)}>
                            <axiom.icon className="w-4 h-4" />
                          </div>
                          <h4 className="font-bold text-slate-800 text-sm">{axiom.title}</h4>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {axiom.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Section 2: Program Logic */}
              <AccordionItem value="logic" className="border border-slate-200 rounded-lg overflow-hidden">
                <AccordionTrigger className="px-4 py-3 bg-gradient-to-r from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-150 hover:no-underline">
                  <div className="flex items-center gap-3">
                    <Map className="w-5 h-5 text-slate-700" />
                    <span className="font-semibold text-slate-800">2. A Lógica do Programa (4 Fases)</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 py-4 bg-white">
                  <p className="text-sm text-slate-600 mb-4">
                    15 dias divididos em 4 fases progressivas. Cada fase tem um objetivo claro.
                  </p>
                  <div className="space-y-3">
                    {PHASES.map((phase) => (
                      <div 
                        key={phase.number}
                        className={cn(
                          "p-4 rounded-lg border-l-4 bg-slate-50",
                          phase.borderColor
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn("p-2 rounded-lg text-white", phase.color)}>
                            <phase.icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={cn("font-bold", phase.textColor)}>
                                Fase {phase.number}: {phase.name}
                              </span>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">
                                {phase.days}
                              </span>
                            </div>
                            <p className="font-medium text-slate-700 mt-1 text-sm">
                              {phase.description}
                            </p>
                            <p className="text-sm text-slate-500 mt-0.5">
                              {phase.details}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Expected Results */}
                  <div className="mt-4 p-4 bg-slate-100 rounded-lg">
                    <h5 className="font-semibold text-slate-800 mb-2 text-sm">Resultado Esperado ao Final:</h5>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-emerald-500" />
                        <span className="text-slate-700">Negócio validado com dinheiro na conta</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <span className="ml-6">— ou —</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="w-4 h-4 flex items-center justify-center text-red-500">✕</span>
                        <span className="text-slate-700">Certeza absoluta de que deve pivotar ou desistir</span>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Section 3: Resources Value */}
              <AccordionItem value="resources" className="border border-amber-200 rounded-lg overflow-hidden">
                <AccordionTrigger className="px-4 py-3 bg-amber-50 hover:bg-amber-100 hover:no-underline">
                  <div className="flex items-center gap-3">
                    <Wrench className="w-5 h-5 text-amber-600" />
                    <span className="font-semibold text-amber-800">3. Ferramentas & Conteúdos</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 py-4 bg-white">
                  <p className="text-sm text-slate-600 mb-4">
                    Cada tarefa tem recursos associados por um motivo específico.
                  </p>
                  
                  <div className="grid gap-4 sm:grid-cols-2 mb-4">
                    {/* Tools */}
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Wrench className="w-4 h-4 text-purple-600" />
                        <h5 className="font-semibold text-purple-800 text-sm">Ferramentas</h5>
                      </div>
                      <p className="text-sm text-purple-700 mb-2">
                        Aceleradores práticos que transformam horas de trabalho manual em minutos.
                      </p>
                      <ul className="text-xs text-purple-600 space-y-1">
                        <li>• Empathy Map para definir personas</li>
                        <li>• Markup Calculator para precificação</li>
                        <li>• Unit Economics para métricas</li>
                      </ul>
                    </div>
                    
                    {/* Content */}
                    <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="w-4 h-4 text-amber-600" />
                        <h5 className="font-semibold text-amber-800 text-sm">Conteúdos</h5>
                      </div>
                      <p className="text-sm text-amber-700 mb-2">
                        Artigos curtos com exatamente o que você precisa saber para executar a tarefa do dia.
                      </p>
                      <ul className="text-xs text-amber-600 space-y-1">
                        <li>• Customer Development para validação</li>
                        <li>• Lean Canvas para modelo de negócio</li>
                        <li>• Tráfego Orgânico para aquisição</li>
                      </ul>
                    </div>
                  </div>

                  {/* Warning */}
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-red-700">
                        <strong>CUIDADO:</strong> Ferramentas e conteúdos NÃO são desculpa para procrastinar. 
                        Eles existem para <em>acelerar</em> a ação, não para substituí-la.
                      </p>
                    </div>
                  </div>

                  {/* Quick Links */}
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <Link 
                      to={ROUTES.blog}
                      className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
                    >
                      <BookOpen className="w-4 h-4 text-purple-500" />
                      <span className="text-sm font-medium text-slate-700">Blog</span>
                    </Link>
                    <Link 
                      to={ROUTES.tools.equityCalculator}
                      className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
                    >
                      <Wrench className="w-4 h-4 text-purple-500" />
                      <span className="text-sm font-medium text-slate-700">Ferramentas</span>
                    </Link>
                    <Link 
                      to={`${ROUTES.faq}?section=acceleration-prep`}
                      className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
                    >
                      <FileText className="w-4 h-4 text-purple-500" />
                      <span className="text-sm font-medium text-slate-700">FAQ</span>
                    </Link>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Section 4: Canon */}
              <AccordionItem value="canon" className="border border-violet-200 rounded-lg overflow-hidden">
                <AccordionTrigger className="px-4 py-3 bg-violet-50 hover:bg-violet-100 hover:no-underline">
                  <div className="flex items-center gap-3">
                    <Library className="w-5 h-5 text-violet-600" />
                    <span className="font-semibold text-violet-800">4. Cânone de Conhecimento</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 py-4 bg-white">
                  <p className="text-sm text-slate-600 mb-4">
                    Livros fundamentais que todo founder deveria ter lido. O agente avaliador verifica se você aplicou conceitos desses livros.
                  </p>
                  
                  {/* Books by stage */}
                  <div className="space-y-4">
                    {BOOK_STAGES.map((stageInfo) => {
                      const stageBooks = CANON_BOOKS.filter(b => b.critical_for_stage === stageInfo.stage).slice(0, 4);
                      return (
                        <div key={stageInfo.stage} className={cn("p-3 rounded-lg", stageInfo.bgColor)}>
                          <h5 className={cn("font-semibold text-sm mb-2", stageInfo.color)}>
                            {stageInfo.title}
                          </h5>
                          <div className="grid gap-1">
                            {stageBooks.map(book => (
                              <div key={book.id} className="flex items-center gap-2 text-sm">
                                <span className="text-slate-400">•</span>
                                <span className="text-slate-700 font-medium">{book.title}</span>
                                <span className="text-slate-400">— {book.author}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Link to full roadmap */}
                  <Link 
                    to={ROUTES.tools.knowledgeRoadmap}
                    className="mt-4 flex items-center justify-center gap-2 p-3 bg-violet-100 rounded-lg border border-violet-200 hover:bg-violet-200 transition-colors"
                  >
                    <Library className="w-4 h-4 text-violet-600" />
                    <span className="text-sm font-medium text-violet-700">Ver Roadmap Completo de Conhecimento</span>
                    <ExternalLink className="w-3 h-3 text-violet-500" />
                  </Link>
                </AccordionContent>
              </AccordionItem>

              {/* Section 5: Checklist */}
              <AccordionItem value="checklist" className="border border-emerald-200 rounded-lg overflow-hidden">
                <AccordionTrigger className="px-4 py-3 bg-emerald-50 hover:bg-emerald-100 hover:no-underline">
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-emerald-600" />
                    <span className="font-semibold text-emerald-800">5. Checklist de Preparação</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-700">
                      {checkedItems.size}/{checklistItems.length}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 py-4 bg-white">
                  <p className="text-sm text-slate-600 mb-4">
                    Antes de começar, vocês precisam fazer uma primeira reunião entre co-founders para se alinhar.
                  </p>
                  
                  <div className="space-y-2">
                    {checklistItems.map((item) => (
                      <div 
                        key={item.id}
                        className={cn(
                          "p-3 rounded-lg border transition-colors",
                          checkedItems.has(item.id)
                            ? "bg-emerald-50 border-emerald-200"
                            : "bg-slate-50 border-slate-200"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox
                            id={item.id}
                            checked={checkedItems.has(item.id)}
                            onCheckedChange={() => toggleItem(item.id)}
                            className="mt-0.5"
                          />
                          <div className="flex-1 min-w-0">
                            <label 
                              htmlFor={item.id}
                              className={cn(
                                "font-medium cursor-pointer text-sm",
                                checkedItems.has(item.id) ? "text-emerald-700 line-through" : "text-slate-700"
                              )}
                            >
                              {item.label}
                            </label>
                            {item.description && (
                              <p className="text-sm text-slate-500 mt-0.5">{item.description}</p>
                            )}
                            {item.link && (
                              <Link 
                                to={item.link}
                                className="inline-flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 mt-1"
                              >
                                {item.linkLabel}
                                <ExternalLink className="w-3 h-3" />
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Startup Name (only if has team) */}
                  {team && (
                    <div className="mt-6 space-y-3 pt-4 border-t border-slate-200">
                      <h4 className="font-medium text-slate-700 flex items-center gap-2">
                        <Users className="w-4 h-4 text-emerald-500" />
                        Nome da Startup
                      </h4>
                      
                      <div className="flex gap-2">
                        <Input
                          value={startupName}
                          onChange={(e) => setStartupName(e.target.value)}
                          placeholder="Ex: TechStartup"
                          className="flex-1"
                        />
                        <Button 
                          onClick={handleSaveName}
                          disabled={isUpdatingName || !startupName.trim() || startupName === team.startup_name}
                          size="sm"
                        >
                          {isUpdatingName ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Memorandum (only if has team) */}
                  {team && (
                    <div className="mt-4 space-y-3">
                      <h4 className="font-medium text-slate-700 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-emerald-500" />
                        Memorando de Entendimento
                      </h4>
                      <p className="text-sm text-slate-500">
                        Descreva quem faz o quê no time. Isso ajuda a alinhar expectativas e responsabilidades.
                      </p>
                      
                      <Textarea
                        value={memorandum}
                        onChange={(e) => setMemorandum(e.target.value)}
                        placeholder="Ex: João (Builder) cuida de produto e tecnologia. Maria (Seller) cuida de vendas, marketing e relacionamento com clientes..."
                        rows={4}
                        className="resize-none"
                      />
                      
                      <div className="flex justify-end">
                        <Button 
                          onClick={handleSaveMemorandum}
                          disabled={isUpdatingMemorandum || memorandum === (team as any)?.memorandum}
                          size="sm"
                        >
                          {isUpdatingMemorandum ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          ) : (
                            <Save className="w-4 h-4 mr-2" />
                          )}
                          Salvar Memorando
                        </Button>
                      </div>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};
