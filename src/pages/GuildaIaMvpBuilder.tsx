import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, ChevronRight, ChevronLeft, Users, Palette, Zap, Check,
  Lightbulb, Target, Layers, HelpCircle, Rocket, Clock, Code2,
  MessageSquare, CreditCard, LayoutDashboard, Bell, Search, Upload,
  Smartphone, Copy, CheckCheck, RefreshCw, ExternalLink, Wand2,
  AlertCircle, Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { useToolTracking } from "@/hooks/useToolTracking";
import { buildLovableUrl, openLovableUrl, type MvpFormData } from "@/lib/lovableUrlBuilder";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SocialShareGate, isShareUnlocked, requiresSignup } from "@/components/tools/SocialShareGate";
import SignupDialog from "@/components/tools/SignupDialog";

type StyleOption = MvpFormData['style'];

interface FeatureOption {
  id: string;
  icon: React.ReactNode;
  label: string;
  description: string;
}

const FEATURES: FeatureOption[] = [
  { id: 'auth', icon: <Users className="h-4 w-4" />, label: 'Login de usuários', description: 'Cadastro, login, recuperação de senha' },
  { id: 'payments', icon: <CreditCard className="h-4 w-4" />, label: 'Pagamentos online', description: 'Checkout, assinaturas, histórico' },
  { id: 'chat', icon: <MessageSquare className="h-4 w-4" />, label: 'Chat em tempo real', description: 'Mensagens instantâneas entre usuários' },
  { id: 'dashboard', icon: <LayoutDashboard className="h-4 w-4" />, label: 'Dashboard/Admin', description: 'Métricas, gráficos, gestão' },
  { id: 'notifications', icon: <Bell className="h-4 w-4" />, label: 'Notificações', description: 'Push e in-app notifications' },
  { id: 'search', icon: <Search className="h-4 w-4" />, label: 'Busca avançada', description: 'Filtros, ordenação, resultados' },
  { id: 'upload', icon: <Upload className="h-4 w-4" />, label: 'Upload de arquivos', description: 'Imagens, documentos, preview' },
  { id: 'responsive', icon: <Smartphone className="h-4 w-4" />, label: 'Layout responsivo', description: 'Mobile, tablet e desktop' },
];

interface StyleConfig {
  id: StyleOption;
  label: string;
  description: string;
  colors: string[];
  preview: string;
}

const STYLES: StyleConfig[] = [
  { id: 'modern', label: 'Moderno & Minimalista', description: 'Clean, espaçoso, cores neutras', colors: ['bg-gray-900', 'bg-gray-100', 'bg-blue-500'], preview: 'Linear, Notion, Vercel' },
  { id: 'startup', label: 'Startup Tech', description: 'Vibrante, dark mode, tech', colors: ['bg-[#7610DC]', 'bg-gray-100', 'bg-cyan-400'], preview: 'Stripe, Figma, Discord' },
  { id: 'professional', label: 'Profissional', description: 'Corporativo, estruturado, sóbrio', colors: ['bg-blue-700', 'bg-gray-600', 'bg-emerald-600'], preview: 'Salesforce, LinkedIn' },
  { id: 'playful', label: 'Divertido & Colorido', description: 'Ilustrações, cores vivas, animações', colors: ['bg-yellow-400', 'bg-pink-500', 'bg-green-500'], preview: 'Duolingo, Slack' },
];

const STEPS = [
  { id: 1, label: 'Ideia', icon: Lightbulb },
  { id: 2, label: 'Público', icon: Target },
  { id: 3, label: 'Features', icon: Layers },
  { id: 4, label: 'Estilo', icon: Palette },
];

const FAQ_ITEMS = [
  { question: 'O que a IA faz exatamente?', answer: 'A IA analisa suas respostas e transforma em um prompt profissional e detalhado, otimizado para ferramentas de geração de código como Lovable, ChatGPT, Claude, Cursor, v0, etc.' },
  { question: 'Onde posso usar o prompt gerado?', answer: 'Em qualquer ferramenta de IA! Lovable.dev (cria o app automaticamente), ChatGPT, Claude, Cursor, v0.dev, Bolt... O prompt é universal e funciona em todas.' },
  { question: 'Preciso pagar para usar?', answer: 'O GuildaIA MVP Builder é 100% gratuito! A IA da Guilda gera seu prompt sem nenhum custo.' },
  { question: 'Posso editar o prompt gerado?', answer: 'Sim! O prompt aparece em uma área editável. Ajuste o que quiser antes de copiar.' },
  { question: 'Como funciona o Regenerar?', answer: 'Se não gostar do prompt, clique em Regenerar. A IA criará uma versão diferente com os mesmos inputs.' },
  { question: 'Preciso saber programar?', answer: 'Não! Essa é a mágica. Você descreve o que quer em português e a IA gera o prompt. Depois é só colar na ferramenta de sua escolha.' },
];

const WHERE_TO_USE = [
  { name: 'Lovable', description: 'Cria o app automaticamente', url: 'https://lovable.dev/invite/3DDMN6I' },
  { name: 'ChatGPT', description: 'Para refinar o prompt', url: 'https://chat.openai.com' },
  { name: 'Claude', description: 'Análise detalhada', url: 'https://claude.ai' },
  { name: 'Cursor', description: 'Para desenvolvedores', url: 'https://cursor.com' },
  { name: 'v0', description: 'UI components', url: 'https://v0.dev' },
];

export default function GuildaIaMvpBuilder() {
  const { t } = useTranslation();
  const { trackDownload } = useToolTracking('guilda-ia-mvp');
  
  const [currentStep, setCurrentStep] = useState(1);
  const [copied, setCopied] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(() => isShareUnlocked());
  const [needsSignup, setNeedsSignup] = useState(() => requiresSignup());
  const [showSignupDialog, setShowSignupDialog] = useState(false);
  const [formData, setFormData] = useState<MvpFormData>({
    idea: '', targetAudience: '', features: ['responsive'], style: 'startup', customFeatures: '',
  });

  const progress = generatedPrompt ? 100 : (currentStep / 4) * 100;

  const canProceed = () => {
    switch (currentStep) {
      case 1: return formData.idea.trim().length >= 20;
      case 2: return formData.targetAudience.trim().length >= 10;
      case 3: return formData.features.length >= 1;
      case 4: return true;
      default: return false;
    }
  };

  const handleFeatureToggle = (featureId: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(featureId)
        ? prev.features.filter(f => f !== featureId)
        : [...prev.features, featureId]
    }));
  };

  const handleStyleSelect = (styleId: StyleOption) => {
    setFormData(prev => ({ ...prev, style: styleId }));
  };

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(prev => prev + 1);
    else handleGeneratePrompt();
  };

  const handleBack = () => {
    if (generatedPrompt) { setGeneratedPrompt(''); setError(null); }
    else if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const handleGeneratePrompt = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('generate-mvp-prompt', {
        body: { idea: formData.idea, targetAudience: formData.targetAudience, features: formData.features, style: formData.style, customFeatures: formData.customFeatures }
      });
      if (fnError) throw new Error(fnError.message || 'Erro ao gerar prompt');
      if (data?.error) throw new Error(data.error);
      if (data?.prompt) {
        setGeneratedPrompt(data.prompt);
        trackDownload('ai-prompt-generated');
        toast.success(t('tools.guilda-ia-mvp.promptGenerated', 'Prompt gerado com sucesso!'));
      } else throw new Error('Resposta vazia da IA');
    } catch (err) {
      console.error('Error generating prompt:', err);
      setError(err instanceof Error ? err.message : 'Erro ao gerar prompt');
      toast.error(t('tools.guilda-ia-mvp.errorGenerating', 'Erro ao gerar prompt. Tente novamente.'));
    } finally { setIsGenerating(false); }
  };

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      setCopied(true);
      trackDownload('prompt-copy');
      toast.success(t('tools.guilda-ia-mvp.promptCopied', 'Prompt copiado! Cole na sua ferramenta de IA favorita.'));
      setTimeout(() => setCopied(false), 3000);
    } catch { toast.error(t('common.copyError', 'Erro ao copiar')); }
  };

  const handleOpenLovable = () => {
    const url = buildLovableUrl({ prompt: generatedPrompt });
    trackDownload('lovable-redirect');
    openLovableUrl(url);
  };

  const [showSignupOverlay, setShowSignupOverlay] = useState(false);

  const handleRegenerate = () => {
    if (requiresSignup()) { setShowSignupOverlay(true); return; }
    handleGeneratePrompt();
  };

  const handleStartOver = () => {
    setGeneratedPrompt('');
    setCurrentStep(1);
    setError(null);
    setFormData({ idea: '', targetAudience: '', features: ['responsive'], style: 'startup', customFeatures: '' });
  };

  return (
    <ToolPageLayout toolId="guilda-ia-mvp" icon={Sparkles} iconColor="text-[#7610DC]" iconBgColor="bg-[#7610DC]/10">
      <Helmet>
        <title>{t('tools.guilda-ia-mvp.title', 'GuildaIA MVP Builder')} | Guilda</title>
        <meta name="description" content={t('tools.guilda-ia-mvp.description', 'Transforme sua ideia em um prompt profissional para criar seu MVP com inteligência artificial')} />
        <meta property="og:title" content="GuildaIA MVP Builder - Crie seu MVP com IA" />
        <meta property="og:description" content="Transforme sua ideia em um prompt profissional para criar seu MVP com inteligência artificial. Grátis, em 2 minutos." />
        <meta property="og:image" content="https://www.guilda.app.br/og-guilda-ia-mvp.png" />
        <meta property="og:url" content="https://www.guilda.app.br/ferramentas-empreendedores/guilda-ia-mvp" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="GuildaIA MVP Builder - Crie seu MVP com IA" />
        <meta name="twitter:description" content="Transforme sua ideia em um prompt profissional para criar seu MVP com IA. Grátis." />
        <meta name="twitter:image" content="https://www.guilda.app.br/og-guilda-ia-mvp.png" />
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Progress Header */}
        <div className="border border-black/10 rounded-2xl bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div 
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all",
                    currentStep >= step.id || generatedPrompt
                      ? "bg-[#7610DC] border-[#7610DC] text-white" 
                      : "border-gray-200 text-gray-400"
                  )}
                >
                  {currentStep > step.id || generatedPrompt ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </div>
                <span className={cn(
                  "ml-2 text-sm font-medium hidden sm:block",
                  currentStep >= step.id || generatedPrompt ? "text-black" : "text-gray-400"
                )}>
                  {step.label}
                </span>
                {index < STEPS.length - 1 && (
                  <div className={cn(
                    "w-8 sm:w-16 h-0.5 mx-2",
                    currentStep > step.id || generatedPrompt ? "bg-[#7610DC]" : "bg-gray-200"
                  )} />
                )}
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-2 [&>div]:bg-[#7610DC]" />
        </div>

        {/* Loading State */}
        {isGenerating && (
          <div className="border border-black/10 rounded-2xl bg-white py-16 text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 mx-auto mb-6"
            >
              <Wand2 className="w-full h-full text-[#7610DC]" />
            </motion.div>
            <h3 className="text-xl font-semibold text-black mb-2">
              {t('tools.guilda-ia-mvp.generating', 'A IA está criando seu prompt...')}
            </h3>
            <p className="text-gray-500">
              {t('tools.guilda-ia-mvp.generatingDescription', 'Isso pode levar alguns segundos')}
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !isGenerating && (
          <div className="border border-red-200 rounded-2xl bg-red-50 py-8 text-center px-6">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-semibold text-black mb-2">{t('tools.guilda-ia-mvp.errorTitle', 'Erro ao gerar prompt')}</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <Button onClick={handleGeneratePrompt} className="gap-2 bg-[#7610DC] hover:bg-[#7610DC]/90 text-white rounded-xl">
              <RefreshCw className="h-4 w-4" />
              {t('common.tryAgain', 'Tentar novamente')}
            </Button>
          </div>
        )}

        {/* Generated Prompt Result */}
        {generatedPrompt && !isGenerating && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="border border-[#7610DC]/20 rounded-2xl bg-white">
              <div className="p-6 border-b border-black/5">
                <h3 className="flex items-center gap-2 text-lg font-bold text-black">
                  <Sparkles className="h-5 w-5 text-[#7610DC]" />
                  {t('tools.guilda-ia-mvp.resultTitle', 'Seu Prompt Otimizado')}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {t('tools.guilda-ia-mvp.resultDescription', 'Copie e cole no Lovable, ChatGPT, Claude ou qualquer ferramenta de IA')}
                </p>
              </div>
              <div className="p-6 space-y-4">
                {isUnlocked ? (
                  <div className="relative">
                    <Textarea
                      value={generatedPrompt}
                      onChange={(e) => setGeneratedPrompt(e.target.value)}
                      className="min-h-[400px] font-mono text-sm resize-none border-black/10 rounded-xl focus-visible:ring-[#7610DC]/30 focus-visible:border-[#7610DC]"
                      readOnly={showSignupOverlay}
                    />
                    <div className="flex items-center justify-between text-sm text-gray-400 mt-4">
                      <span>{generatedPrompt.length} caracteres</span>
                      <span>~{Math.ceil(generatedPrompt.split(/\s+/).length)} palavras</span>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3 mt-4">
                      <Button 
                        onClick={handleCopyPrompt}
                        className="flex-1 gap-2 bg-[#7610DC] hover:bg-[#7610DC]/90 text-white rounded-xl"
                        size="lg"
                        disabled={showSignupOverlay}
                      >
                        {copied ? <CheckCheck className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                        {copied ? t('common.copied', 'Copiado!') : t('tools.guilda-ia-mvp.copyPrompt', 'Copiar Prompt')}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={handleRegenerate}
                        className="gap-2 border-gray-200 text-black hover:bg-gray-50 rounded-xl"
                        disabled={isGenerating}
                      >
                        <RefreshCw className="h-4 w-4" />
                        {t('tools.guilda-ia-mvp.regenerate', 'Regenerar')}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={handleOpenLovable}
                        className="gap-2 border-gray-200 text-black hover:bg-gray-50 rounded-xl"
                        disabled={showSignupOverlay}
                      >
                        <ExternalLink className="h-4 w-4" />
                        Lovable
                      </Button>
                    </div>

                    {/* Signup overlay */}
                    {showSignupOverlay && (
                      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 rounded-xl bg-white/90">
                        <Lock className="h-10 w-10 text-[#7610DC]" />
                        <h3 className="text-xl font-bold text-center px-4 text-black">
                          {t('tools.signupGate.overlayTitle', 'Cadastre-se para gerar mais prompts')}
                        </h3>
                        <p className="text-sm text-gray-500 text-center max-w-sm px-4">
                          {t('tools.signupGate.overlayDesc', 'Você já usou sua geração gratuita. Crie uma conta grátis na Guilda para gerar prompts ilimitados.')}
                        </p>
                        <Button
                          size="lg"
                          className="gap-2 bg-[#F97316] hover:bg-[#F97316]/90 text-white rounded-xl"
                          onClick={() => window.open('https://suprema.guilda.app.br/auth?view=signup', '_blank')}
                        >
                          {t('tools.signupGate.overlayCta', 'Criar conta grátis →')}
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="relative overflow-hidden" style={{ maxHeight: '7.5rem' }}>
                      <pre className="font-mono text-sm whitespace-pre-wrap break-words p-3 rounded-xl border border-black/10 bg-white text-black leading-[1.5rem]">
                        {generatedPrompt.split('\n').slice(0, 5).join('\n')}
                      </pre>
                      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                    </div>
                    <p className="text-center text-sm text-gray-400 mt-2">
                      {t('tools.socialGate.hiddenLines', '... +{{count}} linhas ocultas', {
                        count: Math.max(0, generatedPrompt.split('\n').length - 5),
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Social Share Gate or Signup Gate */}
            {!isUnlocked && !needsSignup && (
              <SocialShareGate onUnlock={() => setIsUnlocked(true)} />
            )}

            {!isUnlocked && needsSignup && (
              <div className="space-y-4">
                <div className="border border-[#7610DC]/20 rounded-2xl bg-[#7610DC]/5 overflow-hidden">
                  <div className="py-6 px-6 space-y-4 text-center">
                    <Lock className="h-8 w-8 mx-auto text-[#7610DC]" />
                    <h3 className="text-lg font-semibold text-black">
                      {t("tools.signupGate.title", "🔒 Crie sua conta gratuita para continuar")}
                    </h3>
                    <p className="text-sm text-gray-500 max-w-md mx-auto">
                      {t("tools.signupGate.description", "Você já usou seu acesso gratuito. Cadastre-se na Guilda para gerar prompts ilimitados e acessar todas as ferramentas.")}
                    </p>
                    <Button
                      onClick={() => setShowSignupDialog(true)}
                      className="gap-2 bg-[#F97316] hover:bg-[#F97316]/90 text-white rounded-xl"
                    >
                      {t("tools.signupGate.cta", "Criar conta grátis")}
                    </Button>
                  </div>
                </div>
                <SignupDialog open={showSignupDialog} onOpenChange={setShowSignupDialog} feature="export" toolName="guilda-ia-mvp" />
              </div>
            )}

            {/* Where to Use */}
            <div className="border border-black/10 rounded-2xl bg-white">
              <div className="p-6 border-b border-black/5">
                <h3 className="text-lg font-bold text-black">
                  {t('tools.guilda-ia-mvp.whereToUse', 'Onde usar seu prompt')}
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {WHERE_TO_USE.map((tool) => (
                    <a
                      key={tool.name}
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-xl border border-black/10 hover:border-[#7610DC]/30 transition-colors text-center"
                    >
                      <div className="font-medium text-sm text-black">{tool.name}</div>
                      <div className="text-xs text-gray-400">{tool.description}</div>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Start Over */}
            <div className="text-center">
              <Button variant="ghost" onClick={handleStartOver} className="gap-2 text-gray-400 hover:text-[#7610DC]">
                <RefreshCw className="h-4 w-4" />
                {t('tools.guilda-ia-mvp.startOver', 'Criar outro MVP')}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step Content */}
        {!generatedPrompt && !isGenerating && !error && (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {currentStep === 1 && (
                  <div className="border border-black/10 rounded-2xl bg-white">
                    <div className="p-6 border-b border-black/5">
                      <h3 className="flex items-center gap-2 text-lg font-bold text-black">
                        <Lightbulb className="h-5 w-5 text-[#7610DC]" />
                        Descreva sua ideia
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Qual problema você quer resolver? O que seu app vai fazer? Seja específico!
                      </p>
                    </div>
                    <div className="p-6 space-y-4">
                      <Textarea
                        placeholder="Ex: Quero criar um marketplace onde veterinários podem oferecer consultas online 24h para donos de pets..."
                        className="min-h-[200px] resize-none border-black/10 rounded-xl focus-visible:ring-[#7610DC]/30"
                        value={formData.idea}
                        onChange={(e) => setFormData(prev => ({ ...prev, idea: e.target.value }))}
                      />
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <HelpCircle className="h-4 w-4 flex-shrink-0" />
                        <span>Mínimo 20 caracteres. Quanto mais detalhes, melhor o resultado!</span>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="border border-black/10 rounded-2xl bg-white">
                    <div className="p-6 border-b border-black/5">
                      <h3 className="flex items-center gap-2 text-lg font-bold text-black">
                        <Target className="h-5 w-5 text-[#7610DC]" />
                        Quem é seu público-alvo?
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Descreva quem vai usar seu produto. Isso ajuda a IA a criar a experiência certa.
                      </p>
                    </div>
                    <div className="p-6 space-y-4">
                      <Textarea
                        placeholder="Ex: Donos de cães e gatos em grandes cidades brasileiras, entre 25-45 anos..."
                        className="min-h-[150px] resize-none border-black/10 rounded-xl focus-visible:ring-[#7610DC]/30"
                        value={formData.targetAudience}
                        onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
                      />
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <HelpCircle className="h-4 w-4 flex-shrink-0" />
                        <span>Pense em idade, localização, comportamento, necessidades.</span>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="border border-black/10 rounded-2xl bg-white">
                    <div className="p-6 border-b border-black/5">
                      <h3 className="flex items-center gap-2 text-lg font-bold text-black">
                        <Layers className="h-5 w-5 text-[#7610DC]" />
                        Funcionalidades principais
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Selecione as features que seu MVP precisa ter. Menos é mais para um MVP!
                      </p>
                    </div>
                    <div className="p-6 space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {FEATURES.map((feature) => (
                          <div
                            key={feature.id}
                            onClick={() => handleFeatureToggle(feature.id)}
                            className={cn(
                              "flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-colors",
                              formData.features.includes(feature.id)
                                ? "border-[#7610DC] bg-[#7610DC]/5"
                                : "border-black/10 hover:border-[#7610DC]/30"
                            )}
                          >
                            <Checkbox
                              checked={formData.features.includes(feature.id)}
                              onCheckedChange={() => handleFeatureToggle(feature.id)}
                              className="mt-0.5 data-[state=checked]:bg-[#7610DC] data-[state=checked]:border-[#7610DC]"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                {feature.icon}
                                <span className="font-medium text-black">{feature.label}</span>
                              </div>
                              <p className="text-sm text-gray-500 mt-1">{feature.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-black">Funcionalidades adicionais (opcional)</Label>
                        <Textarea
                          placeholder="Descreva outras funcionalidades específicas que seu app precisa..."
                          className="min-h-[100px] resize-none border-black/10 rounded-xl focus-visible:ring-[#7610DC]/30"
                          value={formData.customFeatures}
                          onChange={(e) => setFormData(prev => ({ ...prev, customFeatures: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="border border-black/10 rounded-2xl bg-white">
                    <div className="p-6 border-b border-black/5">
                      <h3 className="flex items-center gap-2 text-lg font-bold text-black">
                        <Palette className="h-5 w-5 text-[#7610DC]" />
                        Estilo visual
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Escolha o visual que combina com sua marca e público.
                      </p>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {STYLES.map((style) => (
                          <div
                            key={style.id}
                            onClick={() => handleStyleSelect(style.id)}
                            className={cn(
                              "p-4 rounded-2xl border-2 cursor-pointer transition-colors",
                              formData.style === style.id
                                ? "border-[#7610DC] bg-[#7610DC]/5"
                                : "border-black/10 hover:border-[#7610DC]/30"
                            )}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              {style.colors.map((color, i) => (
                                <div key={i} className={cn("w-4 h-4 rounded-full", color)} />
                              ))}
                            </div>
                            <h4 className="font-medium text-black">{style.label}</h4>
                            <p className="text-sm text-gray-500">{style.description}</p>
                            <p className="text-xs text-gray-400 mt-2">Inspiração: {style.preview}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="gap-2 border-gray-200 text-black hover:bg-gray-50 rounded-xl"
              >
                <ChevronLeft className="h-4 w-4" />
                Voltar
              </Button>

              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="gap-2 bg-[#F97316] hover:bg-[#F97316]/90 text-white rounded-xl"
              >
                {currentStep === 4 ? (
                  <>
                    <Wand2 className="h-4 w-4" />
                    {t('tools.guilda-ia-mvp.generatePrompt', 'Gerar Prompt com IA')}
                  </>
                ) : (
                  <>
                    Próximo
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </>
        )}

        {/* How it Works */}
        <div className="border border-black/10 rounded-2xl bg-white mt-12">
          <div className="p-6 border-b border-black/5">
            <h3 className="flex items-center gap-2 text-lg font-bold text-black">
              <Zap className="h-5 w-5 text-[#F97316]" />
              Como funciona?
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { num: '1', title: 'Descreva sua ideia', desc: 'Preencha o formulário com os detalhes do seu MVP' },
                { num: '2', title: 'IA gera o prompt', desc: 'Nossa IA cria um prompt otimizado e profissional' },
                { num: '3', title: 'Copie e use', desc: 'Cole no Lovable, ChatGPT ou sua ferramenta favorita' },
              ].map((item) => (
                <div key={item.num} className="text-center">
                  <div className="w-12 h-12 rounded-full bg-[#7610DC] flex items-center justify-center mx-auto mb-3">
                    <span className="text-white font-bold">{item.num}</span>
                  </div>
                  <h4 className="font-medium text-black mb-1">{item.title}</h4>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: Clock, value: '~5s', label: 'Tempo de geração' },
            { icon: Code2, value: '0', label: 'Código necessário' },
            { icon: Rocket, value: '100%', label: 'Gratuito' },
          ].map((stat) => (
            <div key={stat.label} className="text-center p-4 border border-black/10 rounded-2xl bg-white">
              <stat.icon className="h-6 w-6 mx-auto text-[#7610DC] mb-2" />
              <div className="text-2xl font-bold text-black">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="border border-black/10 rounded-2xl bg-white">
          <div className="p-6 border-b border-black/5">
            <h3 className="flex items-center gap-2 text-lg font-bold text-black">
              <HelpCircle className="h-5 w-5 text-[#7610DC]" />
              Perguntas Frequentes
            </h3>
          </div>
          <div className="p-6">
            <Accordion type="single" collapsible className="w-full">
              {FAQ_ITEMS.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-black/5">
                  <AccordionTrigger className="hover:text-[#7610DC] text-black">{item.question}</AccordionTrigger>
                  <AccordionContent className="text-gray-500">{item.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-400">
            <Badge variant="outline" className="mr-2 border-[#7610DC]/30 text-[#7610DC]">Powered by AI</Badge>
            {t('tools.guilda-ia-mvp.disclaimerNew', 'Ferramenta gratuita da Guilda. O prompt gerado pode ser usado em qualquer plataforma de IA.')}
          </p>
        </div>
      </div>
    </ToolPageLayout>
  );
}
