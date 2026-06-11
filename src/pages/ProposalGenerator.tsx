import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { ToolPageLayout } from '@/components/tools/ToolPageLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileText, Download, Eye, TrendingUp, Calculator, Cloud, Code, Megaphone, Sparkles, CheckCircle2, Palette, Camera, GraduationCap, ShoppingCart, Home } from 'lucide-react';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';

// Tipos
type NicheKey = 'consultoria' | 'contabilidade' | 'saas' | 'freelance' | 'marketing' | 'design' | 'fotografia' | 'treinamento' | 'ecommerce' | 'arquitetura';

interface NicheTemplate {
  label: string;
  icon: React.ElementType;
  color: string;
  headline: string;
  intro: string;
  valueProps: string[];
  closingCTA: string;
  paymentTerms: string;
}

// Templates por nicho com copywriting persuasivo
const nicheTemplates: Record<NicheKey, NicheTemplate> = {
  consultoria: {
    label: "Consultoria",
    icon: TrendingUp,
    color: "text-blue-500",
    headline: "Proposta de Consultoria Estratégica",
    intro: "Nossa metodologia proprietária foi desenvolvida para transformar desafios complexos em resultados mensuráveis. Com anos de experiência no mercado, entendemos que cada negócio é único e merece uma abordagem personalizada que maximize seu potencial de crescimento.",
    valueProps: [
      "Diagnóstico completo da situação atual com análise SWOT",
      "Metodologia comprovada com cases de sucesso documentados",
      "Acompanhamento de ROI e métricas de resultado",
      "Relatórios executivos mensais com insights acionáveis",
      "Acesso direto ao consultor responsável pelo projeto"
    ],
    closingCTA: "Investir agora em consultoria estratégica significa garantir vantagem competitiva sustentável. Empresas que adiam decisões estratégicas perdem oportunidades que seus concorrentes aproveitam.",
    paymentTerms: "50% na assinatura do contrato • 50% na entrega do relatório final"
  },
  contabilidade: {
    label: "Contabilidade",
    icon: Calculator,
    color: "text-green-500",
    headline: "Proposta de Serviços Contábeis",
    intro: "Sua tranquilidade fiscal é nossa prioridade absoluta. Com experiência comprovada e uma equipe de especialistas dedicados, oferecemos muito mais do que números — oferecemos a segurança que seu negócio precisa para crescer sem preocupações tributárias.",
    valueProps: [
      "Segurança fiscal total com conformidade garantida",
      "Planejamento tributário para economia legal de impostos",
      "Zero burocracia — cuidamos de todas as obrigações",
      "Alertas preventivos sobre prazos e mudanças na legislação",
      "Atendimento prioritário via WhatsApp e telefone"
    ],
    closingCTA: "Proteja seu negócio com quem entende de conformidade fiscal. Cada dia sem um contador de confiança é um risco desnecessário para seu patrimônio e reputação.",
    paymentTerms: "Mensalidade fixa • Sem taxas ocultas • Cancelamento flexível"
  },
  saas: {
    label: "SaaS B2B",
    icon: Cloud,
    color: "text-purple-500",
    headline: "Proposta de Solução SaaS",
    intro: "Escale suas operações com tecnologia que cresce junto com você. Nossa plataforma foi desenvolvida para eliminar gargalos operacionais e liberar sua equipe para focar no que realmente importa: gerar resultados para o negócio.",
    valueProps: [
      "Escalabilidade infinita sem custos de infraestrutura",
      "Suporte técnico dedicado com SLA garantido",
      "Atualizações contínuas sem custo adicional",
      "Integrações nativas com as principais ferramentas do mercado",
      "Treinamento completo para sua equipe incluído"
    ],
    closingCTA: "O custo de não automatizar é maior do que você imagina. Empresas que digitalizam processos crescem 2x mais rápido que concorrentes que ainda dependem de planilhas.",
    paymentTerms: "Plano anual com desconto de 20% • Ou mensal sem fidelidade"
  },
  freelance: {
    label: "Desenvolvimento Tech",
    icon: Code,
    color: "text-orange-500",
    headline: "Proposta de Desenvolvimento de Software",
    intro: "Do escopo à entrega, cada milestone é cuidadosamente planejado para garantir qualidade e transparência total. Utilizo metodologias ágeis que permitem acompanhamento em tempo real e ajustes durante o desenvolvimento.",
    valueProps: [
      "Escopo técnico claro com documentação completa",
      "Entregas por etapas (milestones) com aprovação",
      "Código limpo e bem documentado para manutenção futura",
      "Suporte pós-entrega de 30 dias incluído",
      "Comunicação diária sobre progresso do projeto"
    ],
    closingCTA: "Seu projeto merece um profissional comprometido com excelência. Cada linha de código é escrita pensando na escalabilidade e manutenibilidade do seu sistema.",
    paymentTerms: "40% entrada • 30% no meio do projeto • 30% na entrega final"
  },
  marketing: {
    label: "Marketing Digital",
    icon: Megaphone,
    color: "text-pink-500",
    headline: "Proposta de Marketing Digital",
    intro: "Estratégias baseadas em dados para impulsionar sua presença digital e converter visitantes em clientes fiéis. Combinamos criatividade com análise rigorosa para maximizar cada real investido em marketing.",
    valueProps: [
      "Estratégia personalizada baseada em análise de mercado",
      "Gestão completa de campanhas e conteúdo",
      "Métricas claras com dashboard de acompanhamento",
      "Otimização contínua para maximizar conversões",
      "Relatórios semanais com insights e recomendações"
    ],
    closingCTA: "Cada dia sem presença digital otimizada é uma oportunidade perdida para seus concorrentes. Marketing bem feito não é custo — é investimento com retorno mensurável.",
    paymentTerms: "Fee mensal fixo + % sobre investimento em mídia"
  },
  design: {
    label: "Design & Branding",
    icon: Palette,
    color: "text-cyan-500",
    headline: "Proposta de Design e Identidade Visual",
    intro: "Sua marca é a primeira impressão que seu cliente tem do seu negócio. Criamos identidades visuais que comunicam seus valores, diferenciam você da concorrência e criam conexões emocionais duradouras com seu público.",
    valueProps: [
      "Pesquisa de mercado e análise de concorrentes",
      "Identidade visual completa (logo, cores, tipografia)",
      "Manual de marca para aplicação consistente",
      "Materiais de papelaria e digital inclusos",
      "Revisões ilimitadas até aprovação final"
    ],
    closingCTA: "Empresas com identidade visual profissional são percebidas como 60% mais confiáveis. Não deixe sua marca passar despercebida.",
    paymentTerms: "50% na aprovação do conceito • 50% na entrega dos arquivos finais"
  },
  fotografia: {
    label: "Fotografia & Vídeo",
    icon: Camera,
    color: "text-rose-500",
    headline: "Proposta de Produção Audiovisual",
    intro: "Uma imagem vale mais que mil palavras. Criamos conteúdo visual que conta a história da sua marca, conecta emocionalmente com seu público e transforma visualizações em clientes fiéis.",
    valueProps: [
      "Planejamento criativo e roteirização",
      "Produção profissional com equipamentos de alta qualidade",
      "Direção de arte e styling inclusos",
      "Edição profissional e tratamento de imagens",
      "Entrega otimizada para todas as plataformas (Instagram, YouTube, site)"
    ],
    closingCTA: "Conteúdo visual de qualidade gera 94% mais engajamento que texto puro. Não deixe sua marca passar despercebida no feed.",
    paymentTerms: "50% na aprovação do conceito criativo • 50% na entrega dos arquivos finais"
  },
  treinamento: {
    label: "Treinamento & Mentoria",
    icon: GraduationCap,
    color: "text-indigo-500",
    headline: "Proposta de Programa de Treinamento",
    intro: "O maior ativo de qualquer empresa são as pessoas. Desenvolvemos programas de capacitação que transformam equipes, aumentam produtividade e criam uma cultura de excelência e melhoria contínua.",
    valueProps: [
      "Diagnóstico de necessidades da equipe",
      "Conteúdo customizado para sua realidade",
      "Metodologia prática com exercícios aplicados",
      "Material de apoio e certificados inclusos",
      "Acompanhamento pós-treinamento de 30 dias"
    ],
    closingCTA: "Empresas que investem em treinamento têm colaboradores 40% mais engajados e produtivos. O conhecimento é o único investimento que ninguém pode tirar de você.",
    paymentTerms: "50% na contratação • 50% após realização do programa"
  },
  ecommerce: {
    label: "E-commerce & Loja Virtual",
    icon: ShoppingCart,
    color: "text-emerald-500",
    headline: "Proposta de Desenvolvimento de E-commerce",
    intro: "Sua loja aberta 24 horas, 7 dias por semana, para clientes de todo o Brasil. Desenvolvemos e-commerces otimizados para conversão, com design profissional e tecnologia que suporta seu crescimento.",
    valueProps: [
      "Loja virtual responsiva e otimizada para mobile",
      "Integração com meios de pagamento e frete",
      "Painel administrativo fácil de gerenciar",
      "SEO configurado para aparecer no Google",
      "Treinamento completo para gestão da loja"
    ],
    closingCTA: "O e-commerce brasileiro cresce 20% ao ano. Cada dia sem vender online é receita que você está deixando na mesa para seus concorrentes.",
    paymentTerms: "40% na aprovação do layout • 30% no desenvolvimento • 30% no lançamento"
  },
  arquitetura: {
    label: "Arquitetura & Interiores",
    icon: Home,
    color: "text-slate-600",
    headline: "Proposta de Projeto Arquitetônico",
    intro: "Transformamos espaços em experiências. Cada projeto é desenvolvido para unir estética, funcionalidade e valorização do imóvel, criando ambientes que refletem sua personalidade e otimizam seu dia a dia.",
    valueProps: [
      "Projeto personalizado com visitas técnicas",
      "Renderizações 3D realistas do projeto",
      "Acompanhamento completo da execução",
      "Lista de fornecedores e orçamentos",
      "Garantia de qualidade e prazos definidos"
    ],
    closingCTA: "Um projeto bem executado valoriza o imóvel em até 30%. Investir em arquitetura profissional é investir no seu patrimônio.",
    paymentTerms: "30% na assinatura • 40% na aprovação do projeto • 30% na entrega final"
  }
};

const ProposalGenerator = () => {
  const { t } = useTranslation();
  
  // Estados do formulário
  const [selectedNiche, setSelectedNiche] = useState<NicheKey | ''>('');
  const [clientName, setClientName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [projectValue, setProjectValue] = useState(0);
  const [deliveryDays, setDeliveryDays] = useState(30);
  const [validityDays, setValidityDays] = useState(7);
  const [differential, setDifferential] = useState('');

  // Template selecionado
  const currentTemplate = selectedNiche ? nicheTemplates[selectedNiche] : null;

  // Formatar moeda
  const formatCurrency = (val: number): string => {
    return val.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    });
  };

  // Calcular data de validade
  const getValidityDate = (): string => {
    const date = new Date();
    date.setDate(date.getDate() + validityDays);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  // Verificar se formulário está válido
  const isFormValid = useMemo(() => {
    return selectedNiche && clientName.trim() && projectValue > 0 && deliveryDays > 0;
  }, [selectedNiche, clientName, projectValue, deliveryDays]);

  // Gerar PDF profissional
  const generatePDF = () => {
    if (!currentTemplate || !isFormValid) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      let yPos = 20;

      // Cores
      const primaryColor: [number, number, number] = [212, 175, 55]; // Guilda Gold
      const textColor: [number, number, number] = [51, 51, 51];
      const mutedColor: [number, number, number] = [128, 128, 128];

      // Cabeçalho
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, pageWidth, 35, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(companyName || 'Proposta Comercial', margin, 22);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }), pageWidth - margin, 22, { align: 'right' });

      yPos = 50;

      // Título da proposta
      doc.setTextColor(...textColor);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text(currentTemplate.headline, margin, yPos);
      yPos += 8;
      
      doc.setFontSize(14);
      doc.setTextColor(...primaryColor);
      doc.text(`para ${clientName}`, margin, yPos);
      yPos += 15;

      // Linha separadora
      doc.setDrawColor(...primaryColor);
      doc.setLineWidth(0.5);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 15;

      // Introdução
      doc.setTextColor(...textColor);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      const introLines = doc.splitTextToSize(currentTemplate.intro, contentWidth);
      doc.text(introLines, margin, yPos);
      yPos += introLines.length * 6 + 10;

      // O que está incluído
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('O que está incluído:', margin, yPos);
      yPos += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      currentTemplate.valueProps.forEach((prop) => {
        doc.setTextColor(...primaryColor);
        doc.text('✓', margin, yPos);
        doc.setTextColor(...textColor);
        doc.text(prop, margin + 8, yPos);
        yPos += 7;
      });
      yPos += 8;

      // Escopo/Diferencial (se preenchido)
      if (differential.trim()) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Escopo do Projeto:', margin, yPos);
        yPos += 8;
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const diffLines = doc.splitTextToSize(differential, contentWidth);
        doc.text(diffLines, margin, yPos);
        yPos += diffLines.length * 5 + 10;
      }

      // Box de Investimento (destacado)
      const boxHeight = 35;
      doc.setFillColor(245, 245, 245);
      doc.roundedRect(margin, yPos, contentWidth, boxHeight, 3, 3, 'F');
      doc.setDrawColor(...primaryColor);
      doc.setLineWidth(1);
      doc.roundedRect(margin, yPos, contentWidth, boxHeight, 3, 3, 'S');

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...mutedColor);
      doc.text('INVESTIMENTO', margin + 10, yPos + 12);
      
      doc.setFontSize(24);
      doc.setTextColor(...primaryColor);
      doc.text(formatCurrency(projectValue), margin + 10, yPos + 28);

      doc.setFontSize(12);
      doc.setTextColor(...textColor);
      doc.text(`Prazo: ${deliveryDays} dias úteis`, pageWidth - margin - 10, yPos + 20, { align: 'right' });
      yPos += boxHeight + 15;

      // CTA Persuasivo
      doc.setFontSize(11);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(...textColor);
      const ctaLines = doc.splitTextToSize(currentTemplate.closingCTA, contentWidth);
      doc.text(ctaLines, margin, yPos);
      yPos += ctaLines.length * 6 + 12;

      // Condições de pagamento
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Condições de Pagamento:', margin, yPos);
      yPos += 7;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(currentTemplate.paymentTerms, margin, yPos);
      yPos += 15;

      // Validade
      doc.setFillColor(...primaryColor);
      doc.roundedRect(margin, yPos, contentWidth, 20, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`Esta proposta é válida até ${getValidityDate()}`, pageWidth / 2, yPos + 12, { align: 'center' });

      // Rodapé
      const footerY = doc.internal.pageSize.getHeight() - 15;
      doc.setTextColor(...mutedColor);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('Proposta gerada com Guilda — guilda.app.br', pageWidth / 2, footerY, { align: 'center' });

      // Salvar PDF
      const fileName = `proposta-${clientName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.pdf`;
      doc.save(fileName);
      
      toast.success('Proposta PDF gerada com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar o PDF. Tente novamente.');
    }
  };

  return (
    <ToolPageLayout toolId="proposal-generator" icon={FileText}>
      <Helmet>
        <title>Gerador de Proposta Comercial com Copywriting | Guilda</title>
        <meta name="description" content="Gere propostas comerciais profissionais com templates inteligentes para Consultoria, Contabilidade, SaaS, Tech e Marketing. Copywriting persuasivo incluso." />
        <link rel="canonical" href="https://www.guilda.app.br/ferramentas-empreendedores/proposal-generator" />
      </Helmet>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Coluna do Formulário */}
          <div className="space-y-6">
            {/* Seleção de Nicho */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-guilda-gold" />
                  1. Escolha o Tipo de Serviço
                </CardTitle>
                <CardDescription>
                  Cada nicho possui copywriting persuasivo específico
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={selectedNiche} onValueChange={(v) => setSelectedNiche(v as NicheKey)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o nicho do serviço" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.entries(nicheTemplates) as [NicheKey, NicheTemplate][]).map(([key, template]) => {
                      const Icon = template.icon;
                      return (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <Icon className={`h-4 w-4 ${template.color}`} />
                            <span>{template.label}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>

                {currentTemplate && (
                  <div className="mt-4 p-4 bg-muted/50 rounded-lg border">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary" className="bg-guilda-gold/20 text-guilda-gold">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Copywriting Aplicado
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{currentTemplate.intro.substring(0, 120)}...</p>
                    <div className="space-y-1">
                      {currentTemplate.valueProps.slice(0, 3).map((prop, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-3 w-3 text-guilda-gold" />
                          <span>{prop}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Dados do Cliente */}
            <Card>
              <CardHeader>
                <CardTitle>2. Dados do Cliente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="clientName">Nome do Cliente *</Label>
                  <Input
                    id="clientName"
                    placeholder="Ex: Empresa XPTO Ltda"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="companyName">Nome da Sua Empresa (opcional)</Label>
                  <Input
                    id="companyName"
                    placeholder="Ex: Minha Consultoria"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Aparecerá no cabeçalho do PDF
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Valor e Prazo */}
            <Card>
              <CardHeader>
                <CardTitle>3. Investimento e Prazo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="projectValue">Valor do Projeto *</Label>
                  <CurrencyInput
                    id="projectValue"
                    value={projectValue}
                    onChange={setProjectValue}
                    placeholder="0,00"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="deliveryDays">Prazo de Entrega (dias) *</Label>
                    <Input
                      id="deliveryDays"
                      type="number"
                      min="1"
                      value={deliveryDays}
                      onChange={(e) => setDeliveryDays(parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="validityDays">Validade (dias)</Label>
                    <Input
                      id="validityDays"
                      type="number"
                      min="1"
                      value={validityDays}
                      onChange={(e) => setValidityDays(parseInt(e.target.value) || 7)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Diferencial */}
            <Card>
              <CardHeader>
                <CardTitle>4. Escopo / Diferencial (Opcional)</CardTitle>
                <CardDescription>
                  Descreva detalhes específicos do projeto
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Ex: Desenvolvimento de landing page responsiva com integração de formulário de contato e analytics..."
                  value={differential}
                  onChange={(e) => setDifferential(e.target.value)}
                  rows={4}
                />
              </CardContent>
            </Card>
          </div>

          {/* Coluna do Preview */}
          <div className="lg:sticky lg:top-24 h-fit space-y-4">
            <Card className="border-guilda-gold/30">
              <CardHeader className="bg-guilda-gold/10">
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Preview da Proposta
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {!selectedNiche ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Selecione um nicho para ver o preview</p>
                  </div>
                ) : (
                  <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
                    {/* Header do Preview */}
                    <div className="flex justify-between items-start border-b pb-4">
                      <div>
                        <p className="font-bold text-lg">{companyName || 'Sua Empresa'}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date().toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <Badge className="bg-guilda-gold text-guilda-black">
                        {currentTemplate?.label}
                      </Badge>
                    </div>

                    {/* Título */}
                    <div>
                      <h2 className="text-xl font-bold">{currentTemplate?.headline}</h2>
                      <p className="text-guilda-gold font-medium">
                        para {clientName || '[Nome do Cliente]'}
                      </p>
                    </div>

                    <Separator />

                    {/* Intro */}
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {currentTemplate?.intro}
                    </p>

                    {/* Value Props */}
                    <div>
                      <h3 className="font-semibold mb-2">O que está incluído:</h3>
                      <ul className="space-y-2">
                        {currentTemplate?.valueProps.map((prop, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-guilda-gold shrink-0 mt-0.5" />
                            <span>{prop}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Escopo */}
                    {differential && (
                      <div>
                        <h3 className="font-semibold mb-2">Escopo do Projeto:</h3>
                        <p className="text-sm text-muted-foreground">{differential}</p>
                      </div>
                    )}

                    {/* Investimento Box */}
                    <div className="bg-muted p-4 rounded-lg border-2 border-guilda-gold/50">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Investimento</p>
                      <p className="text-2xl font-bold text-guilda-gold">
                        {formatCurrency(projectValue)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Prazo: {deliveryDays} dias úteis
                      </p>
                    </div>

                    {/* CTA */}
                    <p className="text-sm italic text-muted-foreground">
                      {currentTemplate?.closingCTA}
                    </p>

                    {/* Condições */}
                    <div className="text-sm">
                      <p className="font-semibold">Condições de Pagamento:</p>
                      <p className="text-muted-foreground">{currentTemplate?.paymentTerms}</p>
                    </div>

                    {/* Validade */}
                    <div className="bg-guilda-gold text-guilda-black text-center py-2 rounded-lg text-sm font-medium">
                      Válida até {getValidityDate()}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Botão Gerar PDF */}
            <Button
              className="w-full bg-guilda-gold hover:bg-guilda-gold/90 text-guilda-black"
              size="lg"
              onClick={generatePDF}
              disabled={!isFormValid}
            >
              <Download className="mr-2 h-5 w-5" />
              Gerar Proposta em PDF
            </Button>

            {!isFormValid && selectedNiche && (
              <p className="text-xs text-center text-muted-foreground">
                Preencha todos os campos obrigatórios para gerar o PDF
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-8 p-4 bg-gray-50 border border-black/10 rounded-2xl">
        <p className="text-sm text-gray-500 text-center">
          ⚠️ Esta ferramenta é apenas para fins educacionais. As propostas geradas são modelos sugestivos e não substituem assessoria comercial ou jurídica profissional.
        </p>
      </div>
    </ToolPageLayout>
  );
};

export default ProposalGenerator;
