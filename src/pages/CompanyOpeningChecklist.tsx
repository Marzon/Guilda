import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { ToolPageLayout } from '@/components/tools/ToolPageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { StickyActionBar } from '@/components/tools/StickyActionBar';
import { Building2, Share2, CheckCircle, Circle, Lightbulb, ArrowRight, RotateCcw, User, Users } from 'lucide-react';
import { toast } from 'sonner';

interface Step {
  id: string;
  title: string;
  description: string;
  tip?: string;
  link?: { label: string; url: string };
}

const MEI_STEPS: Step[] = [
  {
    id: 'mei-1',
    title: 'Verificar Elegibilidade',
    description: 'Confirme que você se enquadra como MEI: faturamento até R$ 81.000/ano, máximo 1 funcionário, atividades permitidas.',
    tip: 'Algumas profissões regulamentadas (advogado, médico, engenheiro) não podem ser MEI.',
    link: { label: 'Lista de atividades permitidas', url: 'https://www.gov.br/empresas-e-negocios/pt-br/empreendedor/quero-ser-mei/atividades-permitidas' },
  },
  {
    id: 'mei-2',
    title: 'Criar Conta Gov.br',
    description: 'Acesse gov.br e crie uma conta com nível Prata ou Ouro. Você precisará de certificado digital, banco ou reconhecimento facial.',
    tip: 'A validação facial pelo app gov.br é a forma mais rápida de conseguir nível Prata.',
    link: { label: 'Criar conta gov.br', url: 'https://sso.acesso.gov.br/login' },
  },
  {
    id: 'mei-3',
    title: 'Formalizar no Portal do Empreendedor',
    description: 'Acesse o Portal do Empreendedor, preencha seus dados pessoais, atividades e endereço comercial. É gratuito e leva cerca de 15 minutos.',
    tip: 'Você pode usar seu endereço residencial como sede do MEI.',
    link: { label: 'Portal do Empreendedor', url: 'https://www.gov.br/empresas-e-negocios/pt-br/empreendedor' },
  },
  {
    id: 'mei-4',
    title: 'Emitir CCMEI (Certificado)',
    description: 'Após a formalização, baixe o CCMEI (Certificado da Condição de Microempreendedor Individual). Ele funciona como seu alvará provisório.',
    tip: 'O CCMEI substitui o alvará de funcionamento para atividades de baixo risco.',
  },
  {
    id: 'mei-5',
    title: 'Configurar Emissão de Notas Fiscais',
    description: 'Acesse o sistema da prefeitura da sua cidade para emitir NFS-e (serviços) ou o portal da SEFAZ para NF-e (produtos).',
    tip: 'Como MEI, você só é obrigado a emitir nota quando vender para outras empresas (B2B).',
  },
];

const ME_STEPS: Step[] = [
  {
    id: 'me-1',
    title: 'Viabilidade e Nome Empresarial',
    description: 'Faça a consulta prévia de viabilidade na prefeitura (Redesim) para verificar se o endereço e nome escolhidos são permitidos.',
    tip: 'Não alugue o imóvel antes de receber o "OK" da prefeitura. Alguns endereços não permitem atividades comerciais.',
    link: { label: 'Portal Redesim', url: 'https://www.gov.br/empresas-e-negocios/pt-br/redesim' },
  },
  {
    id: 'me-2',
    title: 'Elaboração do Contrato Social',
    description: 'Defina sócios, percentuais de participação, capital social e CNAEs (atividades). Você precisará de um contador para isso.',
    tip: 'Escolha o CNAE principal com cuidado - ele afeta diretamente a alíquota de impostos e exigências legais.',
  },
  {
    id: 'me-3',
    title: 'Registro na Junta Comercial (NIRE)',
    description: 'Protocole o contrato social na Junta Comercial do seu estado. Em muitos estados, isso já gera o CNPJ automaticamente via integração.',
    tip: 'Alguns estados como SP e MG têm processo 100% digital. Consulte a Junta do seu estado.',
  },
  {
    id: 'me-4',
    title: 'CNPJ e Inscrições',
    description: 'Obtenha o CNPJ na Receita Federal. Se for comércio/indústria, solicite Inscrição Estadual. Se for serviços, solicite Inscrição Municipal.',
    tip: 'A Inscrição Estadual é obrigatória para quem vende produtos físicos e precisa emitir NF-e.',
  },
  {
    id: 'me-5',
    title: 'Licenciamento e Alvarás',
    description: 'Solicite: Alvará de Funcionamento (prefeitura), Auto de Vistoria do Corpo de Bombeiros (AVCB) e Vigilância Sanitária (se aplicável).',
    tip: 'Muitas atividades de baixo risco hoje são dispensadas de alvará físico e AVCB. Consulte a classificação de risco da sua atividade.',
  },
  {
    id: 'me-6',
    title: 'Configuração Fiscal',
    description: 'Configure certificado digital A1, sistema de emissão de notas fiscais e contabilidade. Escolha entre Simples Nacional, Lucro Presumido ou Real.',
    tip: 'O Simples Nacional é ideal para a maioria das pequenas empresas. Seu contador pode fazer a opção no portal.',
  },
];

const CompanyOpeningChecklist = () => {
  const { t } = useTranslation();
  const [companyType, setCompanyType] = useState<'mei' | 'me' | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});

  const steps = companyType === 'mei' ? MEI_STEPS : companyType === 'me' ? ME_STEPS : [];

  const progress = useMemo(() => {
    if (steps.length === 0) return 0;
    const completed = steps.filter(s => completedSteps[s.id]).length;
    return (completed / steps.length) * 100;
  }, [steps, completedSteps]);

  const toggleStep = (id: string) => {
    setCompletedSteps(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleShare = async () => {
    const type = companyType === 'mei' ? 'MEI' : 'ME/EPP';
    const completed = steps.filter(s => completedSteps[s.id]).length;
    
    const text = `📋 Checklist de Abertura de Empresa (${type})\n\nProgresso: ${completed}/${steps.length} etapas concluídas\n\nOrganize sua abertura: guilda.app.br/tools/company-opening-checklist`;
    
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t('common.linkCopied'));
    } catch {
      toast.error('Erro ao copiar');
    }
  };

  const handleReset = () => {
    setCompanyType(null);
    setCompletedSteps({});
  };

  if (!companyType) {
    return (
      <ToolPageLayout toolId="company-opening-checklist" icon={Building2}>
        <Helmet>
          <title>Checklist de Abertura de Empresa | Guilda</title>
          <meta name="description" content="Passo a passo para abrir seu CNPJ no Brasil. Checklist interativo para MEI ou ME/EPP com todos os documentos necessários." />
          <link rel="canonical" href="https://www.guilda.app.br/ferramentas-empreendedores/company-opening-checklist" />
        </Helmet>

        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">O que você pretende abrir?</h2>
            <p className="text-muted-foreground">Escolha o tipo de empresa para ver o passo a passo específico.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card 
              className="cursor-pointer hover:border-primary hover:shadow-lg transition-all group"
              onClick={() => setCompanyType('mei')}
            >
              <CardContent className="py-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">MEI</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Microempreendedor Individual
                </p>
                <ul className="text-sm text-left space-y-2 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Gratuito e 100% online
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Faturamento até R$ 81k/ano
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Imposto fixo mensal (~R$ 70)
                  </li>
                </ul>
                <Button className="w-full group-hover:bg-primary">
                  Escolher MEI <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:border-primary hover:shadow-lg transition-all group"
              onClick={() => setCompanyType('me')}
            >
              <CardContent className="py-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-accent/10 rounded-full flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <Users className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-bold mb-2">ME / EPP / LTDA</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Microempresa ou Empresa de Pequeno Porte
                </p>
                <ul className="text-sm text-left space-y-2 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Faturamento até R$ 4,8M/ano
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Pode ter sócios e funcionários
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Todas as atividades permitidas
                  </li>
                </ul>
                <Button variant="outline" className="w-full group-hover:border-accent group-hover:text-accent">
                  Escolher ME/EPP <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </ToolPageLayout>
    );
  }

  return (
    <ToolPageLayout toolId="company-opening-checklist" icon={Building2}>
      <Helmet>
        <title>Checklist de Abertura de Empresa | Guilda</title>
        <meta name="description" content="Passo a passo para abrir seu CNPJ no Brasil. Checklist interativo para MEI ou ME/EPP com todos os documentos necessários." />
        <link rel="canonical" href="https://www.guilda.app.br/ferramentas-empreendedores/company-opening-checklist" />
      </Helmet>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${companyType === 'mei' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'}`}>
              {companyType === 'mei' ? 'MEI' : 'ME / EPP'}
            </div>
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-1" />
              Trocar tipo
            </Button>
          </div>
        </div>

        {/* Progress */}
        <Card className="mb-8">
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progresso</span>
              <span className="text-sm text-muted-foreground">
                {steps.filter(s => completedSteps[s.id]).length}/{steps.length} etapas
              </span>
            </div>
            <Progress value={progress} className="h-3 bg-guilda-gold/30" />
          </CardContent>
        </Card>

        {/* Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => {
            const isCompleted = completedSteps[step.id];
            const prevCompleted = index === 0 || completedSteps[steps[index - 1].id];

            return (
              <Card 
                key={step.id}
                className={`transition-all ${isCompleted ? 'border-green-500/50 bg-green-500/5' : ''} ${!prevCompleted && !isCompleted ? 'opacity-60' : ''}`}
              >
                <CardContent className="py-4">
                  <div className="flex gap-4">
                    {/* Step indicator */}
                    <div className="flex flex-col items-center">
                      <button
                        onClick={() => toggleStep(step.id)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                          isCompleted 
                            ? 'bg-green-500 text-white' 
                            : 'bg-muted text-muted-foreground hover:bg-muted-foreground/20'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <span className="text-sm font-bold">{index + 1}</span>
                        )}
                      </button>
                      {index < steps.length - 1 && (
                        <div className={`w-0.5 h-full mt-2 ${isCompleted ? 'bg-green-500' : 'bg-border'}`} />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className={`font-bold ${isCompleted ? 'text-green-700 dark:text-green-400' : ''}`}>
                            {step.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {step.description}
                          </p>
                        </div>
                        <Checkbox
                          checked={isCompleted}
                          onCheckedChange={() => toggleStep(step.id)}
                          className="mt-1"
                        />
                      </div>

                      {step.tip && (
                        <div className="mt-3 flex items-start gap-2 p-3 bg-yellow-500/10 rounded-lg">
                          <Lightbulb className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-yellow-800 dark:text-yellow-200">{step.tip}</p>
                        </div>
                      )}

                      {step.link && (
                        <a
                          href={step.link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 mt-3 text-sm text-primary hover:underline"
                        >
                          {step.link.label} <ArrowRight className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Completion message */}
        {progress === 100 && (
          <Card className="mt-8 border-green-500 bg-green-500/10">
            <CardContent className="py-6 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-green-700 dark:text-green-400 mb-2">
                Parabéns! Checklist completo!
              </h3>
              <p className="text-sm text-muted-foreground">
                Você concluiu todas as etapas de abertura. Sua empresa está pronta para operar!
              </p>
            </CardContent>
          </Card>
        )}

        {/* Disclaimer */}
        <div className="mt-8 p-4 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
          <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
            ⚠️ Este checklist é apenas para fins educacionais. Não substitui orientação contábil, jurídica ou de um contador especializado em abertura de empresas.
          </p>
        </div>
      </div>

      {/* Removed StickyActionBar - no download or email functionality needed */}
    </ToolPageLayout>
  );
};

export default CompanyOpeningChecklist;
