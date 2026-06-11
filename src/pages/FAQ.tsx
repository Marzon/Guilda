import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { Wrench, Rocket, TrendingUp, DollarSign, MessageCircle, Lightbulb, Users, Search, Zap, Shield, Bell, Mail, Settings, Sparkles } from 'lucide-react';
import { InternalNavbar } from '@/components/InternalNavbar';
import { PageContainer } from '@/components/layout/PageContainer';
import { useAuth } from '@/hooks/useAuth';
import { useLogout } from '@/hooks/useLogout';
import { useSubscription } from '@/hooks/useSubscription';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { SocialPaymentBanner } from "@/components/monetization/SocialPaymentBanner";
import { FAQAnswer } from '@/components/faq/FAQAnswer';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface FAQItem {
  question: string;
  answer: string | React.ReactNode;
}

interface FAQSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  colorClass: string;
  questions: FAQItem[];
}

export default function FAQ() {
  const { t } = useTranslation();
  const { data: auth } = useAuth();
  const { logout } = useLogout();
  const { isPremium } = useSubscription(auth?.user?.id);
  const isLoggedIn = !!auth?.user;
  const userArchetype = auth?.profile?.archetype;
  const [searchParams] = useSearchParams();
  const targetSection = searchParams.get('section');
  const targetQuestion = searchParams.get('q');
  
  const [openValues, setOpenValues] = useState<Record<string, string | undefined>>({});

  // Seção GERAL - Como a Guilda funciona (para todos)
  const generalSections: FAQSection[] = [
    {
      id: 'platform-overview',
      title: t('faq.sections.platformOverview.title', 'Como a Guilda Funciona'),
      icon: <Users className="w-5 h-5" />,
      colorClass: 'text-primary',
      questions: [
        {
          question: t('faq.sections.platformOverview.q1.question', 'O que é a Guilda?'),
          answer: t('faq.sections.platformOverview.q1.answer', 'A Guilda é uma plataforma que conecta Builders (técnicos/devs), Sellers (comerciais/growth) e Investidores para formar parcerias, cofundar startups e fechar negócios. Nossa missão é resolver o problema da solidão do empreendedor, conectando perfis complementares.')
        },
        {
          question: t('faq.sections.platformOverview.q2.question', 'Quais são os três arquétipos?'),
          answer: t('faq.sections.platformOverview.q2.answer', 'Builder: Perfil técnico - desenvolvedores, designers, engenheiros, cientistas de dados. Cria e constrói produtos. Seller: Perfil comercial - vendas, marketing, growth, operações. Faz o produto chegar ao mercado. Investidor: Anjos, VCs, fundos. Investe capital e mentoria em startups.')
        },
        {
          question: t('faq.sections.platformOverview.q3.question', 'Como funciona o sistema de conexões?'),
          answer: t('faq.sections.platformOverview.q3.answer', 'Você envia um convite de conexão para outros usuários. Se aceito, vocês podem trocar mensagens diretamente. Convites pendentes expiram após 7 dias. Você pode gerenciar todas as suas conexões, pendentes e aceitas, na seção "Conexões".')
        },
        {
          question: t('faq.sections.platformOverview.q4.question', 'O que é a Taverna?'),
          answer: t('faq.sections.platformOverview.q4.answer', 'A Taverna é o feed principal onde você descobre novos perfis. Funciona como um "Tinder de cofounders" - você pode filtrar por arquétipo, skills, interesses e mais. É o melhor lugar para encontrar seu próximo parceiro de negócios.')
        },
        {
          question: t('faq.sections.platformOverview.q5.question', 'Como criar e publicar uma startup?'),
          answer: t('faq.sections.platformOverview.q5.answer', 'Clique em "Criar Startup" no menu. Adicione nome, descrição do problema que resolve, estágio atual (ideia, MVP, tração) e uma imagem. Você pode definir vagas abertas com descrição, responsabilidades e equity oferecido para atrair cofundadores.')
        },
        {
          question: t('faq.sections.platformOverview.q6.question', 'O que são as Vagas de startups?'),
          answer: t('faq.sections.platformOverview.q6.answer', 'Vagas são posições abertas em startups. Founders definem título, descrição, equity oferecido e skills desejadas. Interessados podem se candidatar enviando uma mensagem personalizada. O owner da startup revisa e responde as aplicações.')
        },
      ]
    },
    {
      id: 'discovery',
      title: t('faq.sections.discovery.title', 'Busca e Descoberta'),
      icon: <Search className="w-5 h-5" />,
      colorClass: 'text-blue-500',
      questions: [
        {
          question: t('faq.sections.discovery.q1.question', 'Como encontrar pessoas pelo filtro?'),
          answer: t('faq.sections.discovery.q1.answer', 'Na Taverna, use os filtros para buscar por arquétipo (Builder/Seller/Investor), skills específicas, se estão buscando cofounders, localização e mais. Combine filtros para encontrar exatamente o perfil que você procura.')
        },
        {
          question: t('faq.sections.discovery.q2.question', 'Como funciona o AI Matching?'),
          answer: t('faq.sections.discovery.q2.answer', 'O AI Matching (recurso premium) analisa seu perfil, skills, interesses e objetivos para sugerir conexões complementares automaticamente. Builders recebem sugestões de Sellers ideais e vice-versa, baseado em compatibilidade.')
        },
        {
          question: t('faq.sections.discovery.q3.question', 'Como buscar projetos e startups?'),
          answer: t('faq.sections.discovery.q3.answer', 'Acesse a seção "Startups" no menu. Explore projetos ativos filtrados por estágio (ideia, MVP, tração), setor e se têm vagas abertas. Clique em cada projeto para ver detalhes, equipe e oportunidades.')
        },
        {
          question: t('faq.sections.discovery.q4.question', 'O que é "Quem Viu Meu Perfil"?'),
          answer: t('faq.sections.discovery.q4.answer', 'Recurso premium que mostra quem visitou seu perfil nos últimos dias. Útil para identificar interesse de outros usuários e iniciar conversas proativamente. Visualizações indicam que alguém está curioso sobre você.')
        },
      ]
    },
    {
      id: 'tools-overview',
      title: t('faq.sections.toolsOverview.title', 'Ferramentas da Plataforma'),
      icon: <Zap className="w-5 h-5" />,
      colorClass: 'text-amber-500',
      questions: [
        {
          question: t('faq.sections.toolsOverview.q1.question', 'Quais ferramentas estão disponíveis?'),
          answer: t('faq.sections.toolsOverview.q1.answer', 'Oferecemos +15 ferramentas gratuitas: Calculadora de Equity, Simulador de Cap Table, Calculadora de Valuation, Runway Calculator, Quiz de Arquétipo, Gerador de Contratos, Calculadora de Markup, Breakeven, Taxas de Cartão, Gerador de Propostas, Canvas de Negócios, e mais.')
        },
        {
          question: t('faq.sections.toolsOverview.q2.question', 'As ferramentas são gratuitas?'),
          answer: t('faq.sections.toolsOverview.q2.answer', 'Sim! Todas as ferramentas de startup são gratuitas e acessíveis para qualquer usuário registrado. Você pode usar, exportar resultados em PDF e compartilhar. Sem limites de uso.')
        },
        {
          question: t('faq.sections.toolsOverview.q3.question', 'Como exportar resultados das calculadoras?'),
          answer: t('faq.sections.toolsOverview.q3.answer', 'Cada ferramenta tem um botão "Exportar PDF" ou "Baixar Relatório". Os PDFs são formatados profissionalmente para apresentar a investidores, sócios ou para seu próprio registro.')
        },
        {
          question: t('faq.sections.toolsOverview.q4.question', 'O que é o Quiz de Arquétipo?'),
          answer: t('faq.sections.toolsOverview.q4.answer', 'O Quiz analisa suas preferências, experiências e objetivos para determinar se você é mais Builder ou Seller. Ajuda novos usuários a entenderem seu perfil e como podem agregar valor em parcerias.')
        },
      ]
    },
    {
      id: 'communication',
      title: t('faq.sections.communication.title', 'Mensagens e Comunicação'),
      icon: <MessageCircle className="w-5 h-5" />,
      colorClass: 'text-emerald-500',
      questions: [
        {
          question: t('faq.sections.communication.q1.question', 'Como funciona o sistema de mensagens?'),
          answer: t('faq.sections.communication.q1.answer', 'Após uma conexão ser aceita, você pode enviar mensagens ilimitadas (no plano premium) ou até o limite do seu plano. As mensagens são em tempo real, com indicador de leitura e suporte a anexos de arquivos.')
        },
        {
          question: t('faq.sections.communication.q2.question', 'Posso enviar arquivos nas mensagens?'),
          answer: t('faq.sections.communication.q2.answer', 'Sim! Você pode enviar documentos, imagens e PDFs nas conversas. Ideal para compartilhar pitch decks, propostas, contratos e outros materiais com suas conexões.')
        },
        {
          question: t('faq.sections.communication.q3.question', 'Como funcionam as notificações?'),
          answer: t('faq.sections.communication.q3.answer', 'Você recebe notificações de: novos convites de conexão, conexões aceitas, novas mensagens, candidaturas em vagas, menções em projetos. Configure suas preferências de email e push em "Configurações".')
        },
        {
          question: t('faq.sections.communication.q4.question', 'O que são Grupos de Apresentação?'),
          answer: t('faq.sections.communication.q4.answer', 'Quando você é apresentado a outra pessoa (via funcionalidade de introdução), um grupo de conversa é criado com você, quem te indicou e a pessoa apresentada. Facilita networking mediado.')
        },
      ]
    },
    {
      id: 'account-settings',
      title: t('faq.sections.accountSettings.title', 'Conta e Configurações'),
      icon: <Settings className="w-5 h-5" />,
      colorClass: 'text-muted-foreground',
      questions: [
        {
          question: t('faq.sections.accountSettings.q1.question', 'Como editar meu perfil?'),
          answer: t('faq.sections.accountSettings.q1.answer', 'Clique no menu e selecione "Editar Perfil". Atualize foto, bio, skills, o que você oferece e busca. Perfis completos têm muito mais visibilidade e chances de conexão. Recomendamos preencher todos os campos.')
        },
        {
          question: t('faq.sections.accountSettings.q2.question', 'Como alterar minhas preferências de notificação?'),
          answer: t('faq.sections.accountSettings.q2.answer', 'Vá em "Configurações" > "Notificações". Escolha quais tipos de email receber (mensagens, matches, resumos semanais) e configure notificações push no seu navegador ou dispositivo móvel.')
        },
        {
          question: t('faq.sections.accountSettings.q3.question', 'Como deletar minha conta?'),
          answer: t('faq.sections.accountSettings.q3.answer', 'Vá em "Configurações" > "Conta" > "Deletar Conta". Confirme a ação. Seus dados serão removidos em até 30 dias conforme nossa política de privacidade. Esta ação é irreversível.')
        },
        {
          question: t('faq.sections.accountSettings.q4.question', 'A plataforma é segura?'),
          answer: t('faq.sections.accountSettings.q4.answer', 'Sim. Usamos criptografia, autenticação segura e políticas rigorosas de privacidade. Nunca compartilhamos seus dados com terceiros sem consentimento. Informações de contato são protegidas.')
        },
        {
          question: t('faq.sections.accountSettings.q5.question', 'Como entrar em contato com o suporte?'),
          answer: t('faq.sections.accountSettings.q5.answer', 'Use o e-mail contato@guilda.app.br ou a comunidade no Discord. Tempo médio de resposta: 24 horas em dias úteis. Para bugs urgentes, descreva o problema com prints se possível.')
        },
      ]
    },
    {
      id: 'premium',
      title: t('faq.sections.premium.title', 'Recursos Premium'),
      icon: <Rocket className="w-5 h-5" />,
      colorClass: 'text-violet-500',
      questions: [
        {
          question: t('faq.sections.premium.q1.question', 'Quais são os benefícios premium?'),
          answer: t('faq.sections.premium.q1.answer', `O plano **Founder** 👑 desbloqueia tudo na Guilda:

**Networking:**
• Projetos ilimitados
• Matches ilimitados
• Mensagens ilimitadas
• Ver quem visitou seu perfil
• Destaque no grid da Taverna
• Badge verificado no perfil
• **Acesso a telefone e e-mail** de conexões (mesmo antes de aceitar)

**Ferramentas:**
• Contratos jurídicos prontos
• Todas as calculadoras premium
• Exportação de relatórios em PDF

**Aceleração:**
• Acesso ao Programa de Aceleração de 15 dias
• Mentoria do Commander (IA)
• Análise do Pivoter com 7 ideias de pivot`)
        },
        {
          question: t('faq.sections.premium.contactAccess.question', '📞 Como funciona o acesso a contatos (telefone/e-mail)?'),
          answer: t('faq.sections.premium.contactAccess.answer', `**Usuários Premium têm acesso completo a contatos!**

Como funciona:

**Usuários Founder/Premium 👑:**
• Podem ver telefone e e-mail de qualquer pessoa com quem tenham interação
• Funciona mesmo ANTES de o convite ser aceito
• Basta enviar um convite de conexão para ter acesso aos dados
• Facilita contato direto via WhatsApp ou e-mail

**Usuários Scout (gratuito):**
• Contatos bloqueados - não veem telefone nem e-mail
• Precisam aguardar o convite ser aceito para trocar mensagens na plataforma
• Para desbloquear, podem assinar o plano Founder ou usar Social Payment

**Por que isso é útil?**
• Acelera o networking - não precisa esperar respostas
• Permite contato direto via WhatsApp (mais rápido)
• Ideal para quem quer fechar parcerias com agilidade

**Dica:** Ao enviar um convite, você já pode adicionar a pessoa no WhatsApp e iniciar a conversa imediatamente!`)
        },
        {
          question: t('faq.sections.premium.acceleration.question', 'Preciso ser premium para fazer a Aceleração?'),
          answer: t('faq.sections.premium.acceleration.answer', `**Sim, o Programa de Aceleração é exclusivo para usuários Founder.**

Mas você tem duas formas de acessar:

**1. Assinatura Founder**
• R$139,90/semestre (~R$23/mês)
• Acesso imediato a todos os recursos
• Pode cancelar a qualquer momento

**2. Social Payment (Gratuito)**
• Compartilhe a Guilda nas suas redes sociais
• Ganhe acesso às ferramentas premium divulgando
• Clique em "Ou ganhe grátis divulgando" na página de preços

O Social Payment é ideal para quem quer experimentar a plataforma antes de assinar.`)
        },
        {
          question: t('faq.sections.premium.socialPayment.question', '💳 O que é Social Payment e como funciona?'),
          answer: t('faq.sections.premium.socialPayment.answer', `O **Social Payment** é uma forma de desbloquear recursos premium sem pagar, apenas compartilhando a Guilda nas suas redes.

**Como fazer:**

**Passo 1:** Acesse a página de "Preços" ou qualquer ferramenta premium

**Passo 2:** Clique em "Ou ganhe grátis divulgando"

**Passo 3:** Escolha a rede social (LinkedIn, Twitter/X, Instagram, WhatsApp)

**Passo 4:** Compartilhe o post sugerido com seu link de referência

**Passo 5:** Cole o link do seu post para validarmos

**Importante:**
• O post deve ser público para contarmos
• O acesso dura enquanto seus posts estiverem ativos
• Não vale deletar depois de compartilhar!

**Dica:** LinkedIn e Twitter são os mais fáceis de validar porque os posts são públicos por padrão.`)
        },
        {
          question: t('faq.sections.premium.q2.question', 'Quais são os planos disponíveis?'),
          answer: t('faq.sections.premium.q2.answer', `Temos **2 planos** simples:

**Scout (Gratuito - R$0)**
• Perfil Builder ou Seller
• 1 projeto ativo
• 3 matches por semana
• 30 mensagens/mês
• Acesso à Taverna e ferramentas básicas
• Contatos bloqueados (sem telefone/e-mail)

**Founder 👑 (R$139,90/semestre)**
• ~R$23/mês (cobrança semestral)
• Projetos ilimitados
• Matches ilimitados
• Mensagens ilimitadas
• Ver quem viu seu perfil
• Destaque no grid
• Badge verificado
• Contratos jurídicos
• **Acesso a telefone/e-mail de conexões**
• Acesso ao Programa de Aceleração

**Dica:** Você pode ganhar acesso Founder gratuitamente usando o Social Payment (divulgando a Guilda nas redes).`)
        },
        {
          question: t('faq.sections.premium.q3.question', 'Como assinar o plano Founder?'),
          answer: t('faq.sections.premium.q3.answer', `**Para assinar:**

**1.** Acesse "Preços" no menu principal

**2.** Clique em "Assinar com Pix" no card Founder

**3.** Complete o pagamento via PIX

**4.** Acesso liberado imediatamente!

**Valor:** R$139,90/semestre (~R$23/mês)

**Alternativa gratuita:** Clique em "Ou ganhe grátis divulgando" para usar o Social Payment e ganhar acesso premium compartilhando a Guilda nas suas redes sociais.`)
        },
      ]
    },
  ];

  // Seções específicas por arquétipo
  const builderSections: FAQSection[] = [
    {
      id: 'builders',
      title: t('faq.sections.builders.title', 'Para Builders'),
      icon: <Wrench className="w-5 h-5" />,
      colorClass: 'text-primary',
      questions: [
        {
          question: t('faq.sections.builders.q1.question', 'Como completar meu perfil de Builder?'),
          answer: t('faq.sections.builders.q1.answer', 'Acesse "Editar Perfil" no menu. Adicione uma foto profissional, escreva uma bio destacando suas skills técnicas, selecione até 10 habilidades principais e descreva o que você oferece e busca. Perfis completos têm 3x mais chances de receber conexões.')
        },
        {
          question: t('faq.sections.builders.q2.question', 'Como criar um projeto ou startup?'),
          answer: t('faq.sections.builders.q2.answer', 'Clique em "Criar Projeto" no menu principal. Adicione nome, descrição do problema que resolve, estágio atual (ideia, MVP, tração) e uma imagem. Você pode definir vagas abertas para atrair cofundadores. Projetos ativos aparecem para toda a comunidade.')
        },
        {
          question: t('faq.sections.builders.q3.question', 'Como publicar uma vaga no meu projeto?'),
          answer: t('faq.sections.builders.q3.answer', 'Dentro do seu projeto, vá em "Configurações" e depois "Vagas". Defina o título da vaga, descrição das responsabilidades, equity oferecido e skills desejadas. Candidatos interessados enviarão aplicações que você pode revisar.')
        },
        {
          question: t('faq.sections.builders.q7.question', 'Como gerenciar candidaturas e aprovar membros?'),
          answer: t('faq.sections.builders.q7.answer', 'Na aba "Candidaturas" das configurações do projeto, você vê todas as aplicações. Aceite ou rejeite candidatos pendentes. Candidatos aceitos aparecem na aba "Equipe" onde você pode aprovar para adicionar ao time ou rejeitar. O botão desaparece automaticamente após a aprovação.')
        },
        {
          question: t('faq.sections.builders.q8.question', 'Posso re-adicionar um membro que foi removido?'),
          answer: t('faq.sections.builders.q8.answer', 'Sim! Se você removeu alguém do time, pode adicioná-lo novamente. Basta aprovar a candidatura existente ou adicionar manualmente na aba "Equipe". O sistema detecta automaticamente que a pessoa já foi membro e reativa o acesso.')
        },
        {
          question: t('faq.sections.builders.q4.question', 'Como encontrar um cofounder comercial (Seller)?'),
          answer: t('faq.sections.builders.q4.answer', 'Use a Taverna e filtre por "Sellers". Analise os perfis de profissionais com experiência em vendas, marketing ou growth. Envie um convite de conexão destacando seu projeto e como um Seller pode agregar. Após aceito, inicie a conversa sobre a oportunidade.')
        },
        {
          question: t('faq.sections.builders.q5.question', 'Como usar as ferramentas de startup?'),
          answer: t('faq.sections.builders.q5.answer', 'Acesse "Ferramentas" no menu. Você encontra calculadoras de equity, valuation, cap table, runway e mais. Cada ferramenta guia você passo a passo. Resultados podem ser exportados em PDF. O Commander (IA) também recomenda artigos do blog e livros da Biblioteca quando identifica gaps no seu conhecimento.')
        },
        {
          question: t('faq.sections.builders.autoIntro.question', 'O que são as auto-introduções?'),
          answer: t('faq.sections.builders.autoIntro.answer', 'O sistema analisa perfis complementares e sugere conexões automaticamente. Se você é Builder buscando Seller, pode receber introduções de Sellers com skills que complementam as suas. Aceite ou ignore as sugestões no seu feed de notificações.')
        },
      ]
    },
    {
      id: 'builders-advanced',
      title: t('faq.sections.buildersAdvanced.title', 'Dicas Avançadas para Builders'),
      icon: <Lightbulb className="w-5 h-5" />,
      colorClass: 'text-primary',
      questions: [
        {
          question: t('faq.sections.buildersAdvanced.q1.question', 'Como otimizar meu perfil para atrair Sellers de qualidade?'),
          answer: t('faq.sections.buildersAdvanced.q1.answer', 'Destaque métricas do seu projeto (usuários, receita, crescimento). Sellers experientes buscam startups com tração real. Mencione o tamanho do mercado e diferencial competitivo na bio. Perfis com projetos ativos recebem 5x mais visualizações.')
        },
        {
          question: t('faq.sections.buildersAdvanced.q2.question', 'Estratégias de networking para validação de mercado'),
          answer: t('faq.sections.buildersAdvanced.q2.answer', 'Conecte-se com Sellers do seu setor. Peça feedback sobre pitch e estratégia comercial antes de formalizar parcerias. Muitos oferecem consultoria gratuita em troca de conhecer o projeto. Responder rápido a candidaturas aumenta taxa de conversão.')
        },
        {
          question: t('faq.sections.buildersAdvanced.q3.question', 'Como usar ferramentas para impressionar investidores?'),
          answer: t('faq.sections.buildersAdvanced.q3.answer', 'Gere relatórios de Cap Table, Valuation e Runway antes de reuniões. Apresentar projeções bem fundamentadas demonstra maturidade e aumenta credibilidade com VCs. Usar calculadoras e compartilhar resultados mostra profissionalismo.')
        },
        {
          question: t('faq.sections.buildersAdvanced.q4.question', 'Qual o timing ideal para postar projetos e vagas?'),
          answer: t('faq.sections.buildersAdvanced.q4.answer', 'Segundas e terças de manhã têm 2x mais visualizações. Evite postar sextas à tarde ou fins de semana. Atualize vagas abertas semanalmente para manter visibilidade no feed.')
        },
        {
          question: t('faq.sections.buildersAdvanced.q5.question', 'Como construir credibilidade na comunidade?'),
          answer: t('faq.sections.buildersAdvanced.q5.answer', 'Comente em projetos de outros founders. Compartilhe aprendizados e erros. Founders ativos e colaborativos recebem mais convites de conexão de Sellers qualificados. Participar constrói reputação.')
        },
      ]
    },
  ];

  const sellerSections: FAQSection[] = [
    {
      id: 'sellers',
      title: t('faq.sections.sellers.title', 'Para Sellers'),
      icon: <TrendingUp className="w-5 h-5" />,
      colorClass: 'text-emerald-500',
      questions: [
        {
          question: t('faq.sections.sellers.q1.question', 'Como me posicionar como Seller na plataforma?'),
          answer: t('faq.sections.sellers.q1.answer', 'Ao criar seu perfil, selecione o arquétipo "Seller". Destaque experiências em vendas, marketing, growth ou operações comerciais. Mencione setores onde atuou e métricas de resultados. Builders buscam Sellers com track record comprovado.')
        },
        {
          question: t('faq.sections.sellers.q2.question', 'Como encontrar startups para me juntar?'),
          answer: t('faq.sections.sellers.q2.answer', 'Use a seção "Startups" ou "Vagas" para explorar projetos com posições abertas. Filtre por estágio, setor ou tipo de vaga. Leia as descrições e candidate-se aos projetos que combinam com seu perfil e interesses.')
        },
        {
          question: t('faq.sections.sellers.q3.question', 'Como usar as ferramentas de vendas?'),
          answer: t('faq.sections.sellers.q3.answer', 'Acesse a seção de Ferramentas. Encontre calculadoras de markup, simulador de taxas de cartão, calculadora de breakeven e gerador de propostas. Ideais para demonstrar seu conhecimento comercial e apoiar startups parceiras.')
        },
        {
          question: t('faq.sections.sellers.q4.question', 'Como me candidatar a uma vaga?'),
          answer: t('faq.sections.sellers.q4.answer', 'Ao ver uma vaga interessante, clique em "Candidatar". Escreva uma mensagem personalizada explicando por que você é ideal para a posição. O fundador receberá sua aplicação e pode aceitar, recusar ou iniciar uma conversa.')
        },
        {
          question: t('faq.sections.sellers.q5.question', 'Como fazer networking eficiente?'),
          answer: t('faq.sections.sellers.q5.answer', 'Explore a Taverna diariamente. Envie convites de conexão para Builders com projetos interessantes. Seja específico na mensagem inicial. Você também pode receber auto-introduções de Builders compatíveis. O sistema cruza skills e interesses para sugerir parcerias promissoras.')
        },
        {
          question: t('faq.sections.sellers.commander.question', 'Como o Commander me ajuda?'),
          answer: t('faq.sections.sellers.commander.answer', 'Durante a Aceleração, o Commander avalia suas entregas e recomenda recursos específicos: artigos sobre vendas no blog, livros de pricing na Biblioteca, ou conexões na Taverna quando você precisa de skills complementares.')
        },
      ]
    },
    {
      id: 'sellers-advanced',
      title: t('faq.sections.sellersAdvanced.title', 'Dicas Avançadas para Sellers'),
      icon: <Lightbulb className="w-5 h-5" />,
      colorClass: 'text-emerald-500',
      questions: [
        {
          question: t('faq.sections.sellersAdvanced.q1.question', 'Como identificar startups com alto potencial?'),
          answer: t('faq.sections.sellersAdvanced.q1.answer', 'Procure projetos em estágio de tração (não apenas ideias). Analise se o founder tem histórico técnico sólido. Startups com MVPs lançados e primeiros clientes oferecem mais segurança e oportunidade real de crescimento.')
        },
        {
          question: t('faq.sections.sellersAdvanced.q2.question', 'Como se destacar entre candidatos?'),
          answer: t('faq.sections.sellersAdvanced.q2.answer', 'Na sua candidatura, mencione métricas específicas de resultados anteriores. "Aumentei vendas em 40%" é mais impactante que "experiência em vendas". Quantifique seu impacto sempre que possível.')
        },
        {
          question: t('faq.sections.sellersAdvanced.q3.question', 'Como demonstrar ROI ao abordar founders?'),
          answer: t('faq.sections.sellersAdvanced.q3.answer', 'Proponha um plano de 30 dias com metas claras antes de discutir equity. Mostrar como você pode gerar resultados rápidos constrói confiança. Oferecer advisory antes de equity pode abrir portas.')
        },
        {
          question: t('faq.sections.sellersAdvanced.q4.question', 'Quando e como fazer follow-up?'),
          answer: t('faq.sections.sellersAdvanced.q4.answer', 'Espere 3 dias úteis após enviar convite. Um follow-up educado mostra interesse genuíno sem parecer insistente. Após 2 tentativas sem resposta, siga em frente para outras oportunidades.')
        },
        {
          question: t('faq.sections.sellersAdvanced.q5.question', 'Como usar seu track record para negociar equity?'),
          answer: t('faq.sections.sellersAdvanced.q5.answer', 'Documente resultados anteriores com prints e métricas. Sellers com histórico comprovado podem negociar entre 5-15% dependendo do estágio e contribuição esperada. Ter perfil de LinkedIn atualizado passa credibilidade.')
        },
      ]
    },
  ];

  const investorSections: FAQSection[] = [
    {
      id: 'investors',
      title: t('faq.sections.investors.title', 'Para Investidores'),
      icon: <DollarSign className="w-5 h-5" />,
      colorClass: 'text-violet-500',
      questions: [
        {
          question: t('faq.sections.investors.q1.question', 'Como usar o Deal Flow?'),
          answer: t('faq.sections.investors.q1.answer', 'O Deal Flow está integrado à Taverna. Filtre por "founders captando" para ver startups abertas a investimento. Salve perfis interessantes clicando no bookmark. Organize por prioridade, adicione tags e anote observações para acompanhar negociações.')
        },
        {
          question: t('faq.sections.investors.q2.question', 'Como encontrar founders para investir?'),
          answer: t('faq.sections.investors.q2.answer', 'Acesse a Taverna e use os filtros para encontrar founders por estágio (pré-seed, seed, Series A), setor, localização e se estão captando. Analise perfis, projetos e métricas antes de iniciar contato.')
        },
        {
          question: t('faq.sections.investors.q3.question', 'Como entrar em contato com founders?'),
          answer: t('faq.sections.investors.q3.answer', 'Investidores premium podem contatar founders diretamente via chat na Taverna. Seja objetivo sobre seu interesse e tese de investimento. Founders apreciam feedback construtivo mesmo quando o investimento não acontece.')
        },
        {
          question: t('faq.sections.investors.q4.question', 'Como configurar meu perfil de investidor?'),
          answer: t('faq.sections.investors.q4.answer', 'Em "Editar Perfil", selecione arquétipo "Investidor". Adicione tese de investimento, ticket médio, setores de interesse e portfolio de startups investidas. Perfis completos atraem mais founders qualificados.')
        },
        {
          question: t('faq.sections.investors.q5.question', 'O que é o Tour do Investidor?'),
          answer: t('faq.sections.investors.q5.answer', 'O Tour é um guia interativo que apresenta todas as funcionalidades para investidores. Mostra como usar os filtros de founders, sistema de mensagens e Deal Flow. Acesse pelo menu para fazer o tour completo.')
        },
      ]
    },
    {
      id: 'investors-advanced',
      title: t('faq.sections.investorsAdvanced.title', 'Dicas Avançadas para Investidores'),
      icon: <Lightbulb className="w-5 h-5" />,
      colorClass: 'text-violet-500',
      questions: [
        {
          question: t('faq.sections.investorsAdvanced.q1.question', 'Como usar o Deal Flow para criar pipeline de qualidade?'),
          answer: t('faq.sections.investorsAdvanced.q1.answer', 'Salve deals regularmente e categorize por prioridade. Use tags para organizar por setor, estágio e ticket. Revisite semanalmente para acompanhar progresso. Tags no Deal Flow ajudam a manter pipeline organizado.')
        },
        {
          question: t('faq.sections.investorsAdvanced.q2.question', 'Estratégias de sourcing passivo'),
          answer: t('faq.sections.investorsAdvanced.q2.answer', 'Complete seu perfil com tese clara e ticket médio. Founders buscam investidores pelo filtro. Perfis com portfolio e tese detalhada recebem 3x mais inbound de founders qualificados.')
        },
        {
          question: t('faq.sections.investorsAdvanced.q3.question', 'Como otimizar perfil para atrair deals qualificados?'),
          answer: t('faq.sections.investorsAdvanced.q3.answer', 'Liste setores de interesse e estágios preferidos. Mencione startups investidas anteriormente. Seja claro sobre o que busca e o que oferece além de capital (mentoria, network, experiência).')
        },
        {
          question: t('faq.sections.investorsAdvanced.q4.question', 'Técnicas de triagem rápida de founders'),
          answer: t('faq.sections.investorsAdvanced.q4.answer', 'Analise: equipe técnica completa? Tem tração ou só ideia? Mercado grande o suficiente? Cap table limpo? Founders full-time? Estes filtros economizam tempo e focam em deals com potencial real.')
        },
        {
          question: t('faq.sections.investorsAdvanced.q5.question', 'Como manter relacionamento com portfolio via plataforma?'),
          answer: t('faq.sections.investorsAdvanced.q5.answer', 'Use mensagens para check-ins mensais com founders investidos. Acompanhe atualizações de projetos. Estar presente fortalece o relacionamento, abre portas para follow-ons e gera referências.')
        },
      ]
    },
  ];

  // Seção de Preparação para Aceleração
  // Guia de entrevista para Sellers (avaliar Builders) - só visível para SELLER
  const sellerInterviewGuide = {
    question: t('faq.sections.accelerationPrep.sellerGuide.question', '🎯 Guia de Entrevista para Sellers: Como avaliar um Builder?'),
    answer: (
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-foreground mb-2">📋 Perguntas Técnicas:</h4>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Me mostre algo que você construiu do zero. Qual foi o maior desafio técnico?</li>
            <li>Como você decide qual tecnologia usar em um projeto?</li>
            <li>Quanto tempo você levaria para construir um MVP funcional?</li>
            <li>Como você lida com bugs críticos em produção?</li>
          </ol>
        </div>
        <div>
          <h4 className="font-semibold text-foreground mb-2">⚙️ Perguntas de Processo:</h4>
          <ol className="list-decimal list-inside space-y-1 text-sm" start={5}>
            <li>Como você organiza seu trabalho? Usa sprints, kanban?</li>
            <li>Como você comunica progresso técnico para não-técnicos?</li>
            <li>Qual sua experiência com entregas sob pressão?</li>
          </ol>
        </div>
        <div className="bg-red-50 dark:bg-red-950/30 p-3 rounded-lg border border-red-200 dark:border-red-900">
          <h4 className="font-semibold text-red-700 dark:text-red-400 mb-2">🚩 Red Flags para Observar:</h4>
          <ul className="space-y-1 text-sm text-red-600 dark:text-red-400">
            <li>⚠️ Não consegue explicar decisões técnicas de forma simples</li>
            <li>⚠️ Nunca terminou um projeto pessoal</li>
            <li>⚠️ Foca mais em tecnologia perfeita do que em resolver o problema</li>
            <li>⚠️ Não aceita feedback ou críticas</li>
            <li>⚠️ Estima prazos muito otimistas sem considerar imprevistos</li>
          </ul>
        </div>
        <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded-lg border border-green-200 dark:border-green-900">
          <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2">✅ Green Flags:</h4>
          <ul className="space-y-1 text-sm text-green-600 dark:text-green-400">
            <li>✅ Portfolio com projetos finalizados</li>
            <li>✅ Explica conceitos técnicos claramente</li>
            <li>✅ Pergunta sobre o problema antes de propor solução</li>
            <li>✅ Tem noção de produto, não só código</li>
            <li>✅ Admite o que não sabe e propõe como aprender</li>
          </ul>
        </div>
      </div>
    )
  };

  // Guia de entrevista para Builders (avaliar Sellers) - só visível para BUILDER
  const builderInterviewGuide = {
    question: t('faq.sections.accelerationPrep.builderGuide.question', '🎯 Guia de Entrevista para Builders: Como avaliar um Seller?'),
    answer: (
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-foreground mb-2">💼 Perguntas de Vendas:</h4>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Me conta uma venda difícil que você fechou. Qual foi sua estratégia?</li>
            <li>Como você faz prospecção de clientes? Qual seu processo?</li>
            <li>Qual foi a maior objeção que você superou?</li>
            <li>Como você mede seu próprio desempenho em vendas?</li>
          </ol>
        </div>
        <div>
          <h4 className="font-semibold text-foreground mb-2">📊 Perguntas de Mercado:</h4>
          <ol className="list-decimal list-inside space-y-1 text-sm" start={5}>
            <li>Como você valida se um produto tem demanda?</li>
            <li>Como você descobre o preço certo para um produto?</li>
            <li>Qual sua experiência com marketing digital e growth?</li>
          </ol>
        </div>
        <div>
          <h4 className="font-semibold text-foreground mb-2">🚀 Perguntas de Startup:</h4>
          <ol className="list-decimal list-inside space-y-1 text-sm" start={8}>
            <li>Você está confortável vendendo algo que ainda não existe 100%?</li>
            <li>Como você lida com rejeição constante?</li>
            <li>Já trabalhou sem salário fixo antes? Como foi?</li>
          </ol>
        </div>
        <div className="bg-red-50 dark:bg-red-950/30 p-3 rounded-lg border border-red-200 dark:border-red-900">
          <h4 className="font-semibold text-red-700 dark:text-red-400 mb-2">🚩 Red Flags para Observar:</h4>
          <ul className="space-y-1 text-sm text-red-600 dark:text-red-400">
            <li>⚠️ Só fala de teoria, sem exemplos práticos</li>
            <li>⚠️ Nunca vendeu algo "do zero" (só manteve carteira existente)</li>
            <li>⚠️ Não demonstra curiosidade sobre o produto/tecnologia</li>
            <li>⚠️ Foco excessivo em comissão antes de entender o projeto</li>
            <li>⚠️ Não consegue explicar um funil de vendas básico</li>
          </ul>
        </div>
        <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded-lg border border-green-200 dark:border-green-900">
          <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2">✅ Green Flags:</h4>
          <ul className="space-y-1 text-sm text-green-600 dark:text-green-400">
            <li>✅ Histórico comprovado de vendas B2B ou B2C</li>
            <li>✅ Entende métricas (CAC, LTV, churn, conversão)</li>
            <li>✅ Faz perguntas inteligentes sobre o problema e mercado</li>
            <li>✅ Experiência em early-stage ou startup</li>
            <li>✅ Confortável com ambiguidade e "fazer acontecer"</li>
            <li>✅ Tem rede de contatos relevante para o setor</li>
          </ul>
        </div>
      </div>
    )
  };

  // Perguntas base da seção de aceleração
  const baseAccelerationQuestions: FAQItem[] = [
    {
      question: t('faq.sections.accelerationPrep.q1.question', 'Como me preparar para a primeira reunião com meu co-founder?'),
      answer: t('faq.sections.accelerationPrep.q1.answer', 'Antes de começar o programa, reserve 1-2 horas para uma reunião inicial. Usem este tempo para se conhecer melhor, explorar o site juntos (Blog, FAQ, Ferramentas) e alinhar expectativas. Sigam o guia de entrevista de co-founders abaixo.')
    },
    {
      question: t('faq.sections.accelerationPrep.q2.question', 'Quais perguntas fazer na entrevista de co-founders?'),
      answer: t('faq.sections.accelerationPrep.q2.answer', '1) Qual sua motivação para empreender? 2) Quanto tempo você pode dedicar semanalmente? 3) Qual sua situação financeira e runway pessoal? 4) Quais são seus pontos fortes e fracos? 5) Como você lida com conflitos? 6) Qual seu objetivo em 5 anos? 7) Você já teve sociedades antes? Como foram? 8) O que te faria desistir deste projeto?')
    },
  ];

  // Perguntas finais da seção
  const endAccelerationQuestions: FAQItem[] = [
    {
      question: t('faq.sections.accelerationPrep.q3.question', 'Como dividir responsabilidades (Builder vs Seller)?'),
      answer: t('faq.sections.accelerationPrep.q3.answer', 'Builder: foca em produto, tecnologia, desenvolvimento, UX/UI, arquitetura técnica. Seller: foca em vendas, marketing, growth, relacionamento com clientes, parcerias. Ambos participam de decisões estratégicas. Documentem isso no memorando de entendimento.')
    },
    {
      question: t('faq.sections.accelerationPrep.q4.question', 'O que é o memorando de entendimento?'),
      answer: t('faq.sections.accelerationPrep.q4.answer', 'É um documento informal onde vocês registram quem faz o quê, expectativas de dedicação, divisão inicial de equity, e como vão lidar com decisões importantes. Não é um contrato legal, mas ajuda a alinhar expectativas desde o início.')
    },
    {
      question: t('faq.sections.accelerationPrep.q5.question', 'Como alinhar expectativas de equity e dedicação?'),
      answer: t('faq.sections.accelerationPrep.q5.answer', 'Sejam honestos sobre: 1) Quantas horas semanais cada um pode dedicar 2) Se é full-time ou part-time 3) Quanto tempo podem viver sem salário 4) Como querem dividir equity (não precisa ser 50/50). Use nossa calculadora de equity para simular cenários.')
    },
  ];

  // Monta as perguntas da seção de aceleração baseado no arquétipo
  const getAccelerationQuestions = () => {
    const questions = [...baseAccelerationQuestions];
    
    // Seller vê o guia para entrevistar Builder
    if (userArchetype === 'SELLER') {
      questions.push(sellerInterviewGuide);
    }
    // Builder vê o guia para entrevistar Seller
    else if (userArchetype === 'BUILDER') {
      questions.push(builderInterviewGuide);
    }
    // Se não está logado ou é outro tipo, não mostra os guias de entrevista
    
    questions.push(...endAccelerationQuestions);
    return questions;
  };

  // Nova seção: Programa de Aceleração (visão geral, Commander, Pivoter)
  const accelerationProgramSection: FAQSection = {
    id: 'acceleration-program',
    title: t('faq.sections.accelerationProgram.title', 'Programa de Aceleração'),
    icon: <Rocket className="w-5 h-5" />,
    colorClass: 'text-purple-500',
    questions: [
      {
        question: t('faq.sections.accelerationProgram.overview.question', 'O que é o Programa de Aceleração da Guilda?'),
        answer: t('faq.sections.accelerationProgram.overview.answer', `O Programa de Aceleração é uma jornada intensiva de 15 dias onde Builders e Sellers trabalham juntos para validar uma ideia de startup. O programa combina:

🚀 **Missões diárias** - Tarefas práticas com feedback imediato de IA
🤖 **Commander** - Seu mentor de IA que avalia cada entrega com rigor e profundidade
✨ **Pivoter** - Análise estratégica que gera 7 ideias de pivot personalizadas

Ao final, você terá uma startup validada ou clareza sobre o próximo passo.`)
      },
      {
        question: t('faq.sections.accelerationProgram.commander.question', '🤖 O que é o Commander e como ele funciona?'),
        answer: t('faq.sections.accelerationProgram.commander.answer', `O **Commander** é seu mentor de IA no programa de aceleração. Ele funciona como um investidor exigente que:

📋 **Avalia cada entrega** - Analisa se você cumpriu os critérios da missão
💬 **Dá feedback detalhado** - Explica o que está bom e o que precisa melhorar
✅ **Aprova ou rejeita** - Só avança para o próximo dia quando a entrega está no padrão

**Por que isso importa?**
Startups falham por falta de feedback honesto. O Commander não te deixa avançar com entregas medianas - ele te força a melhorar.

**Dica:** Leia o feedback com atenção e resubmeta se for rejeitado. Cada iteração te deixa mais forte.`)
      },
      {
        question: t('faq.sections.accelerationProgram.pivoter.question', '✨ O que é o Pivoter e quando ele aparece?'),
        answer: t('faq.sections.accelerationProgram.pivoter.answer', `O **Pivoter** é uma ferramenta de análise estratégica que aparece no **Dia 15 (O Veredito)** do programa. Ele:

🔍 **Analisa todas suas entregas** - Revisa as 15 missões que você completou
📊 **Calcula seu Score de Crescimento** - Avalia a viabilidade do seu negócio
💡 **Gera 7 ideias de pivot** - Sugestões personalizadas baseadas em seus pontos fortes e fracos

**O que cada pivot inclui:**
• Nome e conceito da transformação
• Por que tem potencial para você
• Dificuldade técnica (1-5 estrelas)
• Modelo de monetização sugerido
• Como fazer o MVP em 7 dias

**Importante:** O Pivoter não decide por você - ele expande suas opções para uma decisão mais informada.`)
      },
      {
        question: t('faq.sections.accelerationProgram.forBuilders.question', '🔧 Como funciona o programa para Builders?'),
        answer: t('faq.sections.accelerationProgram.forBuilders.answer', `Como **Builder**, seu papel é transformar ideias em realidade. No programa você vai:

**Suas responsabilidades:**
• Construir o MVP técnico da startup
• Definir a arquitetura e stack tecnológico
• Validar viabilidade técnica das soluções
• Estimar prazos e complexidade

**O que você vai aprender:**
• Como validar antes de construir
• Técnicas de prototipagem rápida
• Como comunicar progresso para não-técnicos
• Equilíbrio entre perfeição e velocidade

**Dica para Builders:**
Você vai se sentir tentado a construir primeiro e validar depois. O programa te força a inverter isso - e isso vai te poupar meses de trabalho desperdiçado.`)
      },
      {
        question: t('faq.sections.accelerationProgram.forSellers.question', '🎯 Como funciona o programa para Sellers?'),
        answer: t('faq.sections.accelerationProgram.forSellers.answer', `Como **Seller**, seu papel é garantir que estamos construindo algo que as pessoas querem comprar. No programa você vai:

**Suas responsabilidades:**
• Conversar com clientes potenciais
• Validar hipóteses de mercado
• Definir posicionamento e proposta de valor
• Criar estratégia de go-to-market

**O que você vai aprender:**
• Técnicas de customer discovery
• Como fazer entrevistas de problema
• Criação de landing pages de validação
• Métricas de tração inicial

**Dica para Sellers:**
Seu maior inimigo é o viés de confirmação. O programa te treina para ouvir o que os clientes realmente dizem, não o que você quer ouvir.`)
      },
      {
        question: t('faq.sections.accelerationProgram.forInvestors.question', '💰 Como investidores podem usar a plataforma?'),
        answer: t('faq.sections.accelerationProgram.forInvestors.answer', `A Guilda oferece acesso antecipado às startups mais promissoras da comunidade. Como investidor, você pode:

**Benefícios:**
• 🔍 **Dealflow qualificado** - Startups que passaram pelo programa têm validação real
• 📊 **Dados de execução** - Veja como a dupla executa sob pressão (15 entregas avaliadas)
• 🤝 **Acesso direto** - Conecte-se com fundadores antes de qualquer rodada

**O que diferencia nossas startups:**
• Passaram por validação intensiva de 15 dias
• Têm dupla Builder + Seller (execução balanceada)
• Receberam feedback brutal da IA (sem ego inflado)
• Sabem pivotar (foram treinados para isso)

**Como participar:**
Cadastre-se como investidor para receber nossa newsletter mensal com as melhores startups do programa.`)
      },
      {
        question: t('faq.sections.accelerationProgram.phases.question', 'Quais são as fases do programa?'),
        answer: t('faq.sections.accelerationProgram.phases.answer', `O programa é dividido em **3 fases** ao longo de 15 dias:

**🔍 Fase 1: Descoberta (Dias 1-5)**
• Definir o problema que você resolve
• Identificar seu público-alvo
• Mapear a concorrência
• Criar hipóteses iniciais

**🧪 Fase 2: Validação (Dias 6-10)**
• Conversar com clientes reais
• Testar proposta de valor
• Criar protótipos de baixa fidelidade
• Coletar evidências de tração

**🚀 Fase 3: Tração (Dias 11-15)**
• Construir MVP funcional
• Definir estratégia de lançamento
• Validar modelo de negócios
• **Dia 15: O Veredito** (análise final + Pivoter)

Cada dia tem uma missão específica com critérios claros de aprovação.`)
      }
    ]
  };

  const accelerationSections: FAQSection[] = [
    accelerationProgramSection,
    {
      id: 'acceleration-prep',
      title: t('faq.sections.accelerationPrep.title', 'Preparação para Aceleração'),
      icon: <Lightbulb className="w-5 h-5" />,
      colorClass: 'text-violet-500',
      questions: getAccelerationQuestions()
    },
  ];

  // Seções específicas para Starters
  const starterSections: FAQSection[] = [
    {
      id: 'starters',
      title: t('faq.sections.starters.title', 'Para Starters'),
      icon: <Sparkles className="w-5 h-5" />,
      colorClass: 'text-purple-500',
      questions: [
        {
          question: t('faq.sections.starters.q1.question', 'O que é o arquétipo Starter?'),
          answer: t('faq.sections.starters.q1.answer', 'O Starter é alguém com potencial e ambição, mas ainda no início da jornada empreendedora. Você pode não ter experiência técnica ou comercial comprovada, mas tem vontade de aprender e contribuir. É o ponto de partida para quem quer entrar no mundo das startups sem pressão.')
        },
        {
          question: t('faq.sections.starters.q2.question', 'O que posso fazer na plataforma como Starter?'),
          answer: t('faq.sections.starters.q2.answer', '• Explorar a Taverna para conhecer Builders, Sellers e Investidores\n• Acessar a Biblioteca com livros essenciais para founders\n• Ler artigos do blog sobre validação, customer development e growth\n• Participar de Missões para ganhar XP e evoluir\n• Candidatar-se a vagas em startups como aprendiz ou contribuidor')
        },
        {
          question: t('faq.sections.starters.q3.question', 'Como evoluir de Starter para Builder ou Seller?'),
          answer: t('faq.sections.starters.q3.answer', 'À medida que você desenvolve suas skills, pode atualizar seu perfil para Builder (se focou em produto/código) ou Seller (se focou em vendas/growth). Vá em "Editar Perfil" e mude seu arquétipo quando se sentir pronto. Não há prazo - evolua no seu ritmo.')
        },
        {
          question: t('faq.sections.starters.q4.question', 'Posso participar do Programa de Aceleração?'),
          answer: t('faq.sections.starters.q4.answer', 'O Programa de 15 dias é para duplas Builder+Seller com uma ideia para validar. Como Starter, você pode participar se encontrar um parceiro experiente disposto a mentorar você durante o programa. Use a Taverna para encontrar founders abertos a ensinar.')
        },
        {
          question: t('faq.sections.starters.q5.question', 'Como encontrar um mentor ou primeira oportunidade?'),
          answer: t('faq.sections.starters.q5.answer', 'Use a Taverna para filtrar por perfis com mais experiência. Envie convites de conexão explicando que você é Starter e busca aprender. Muitos founders valorizam pessoas motivadas e dispostas a contribuir mesmo sem experiência formal.')
        },
        {
          question: t('faq.sections.starters.q6.question', 'Quais recursos usar para aprender?'),
          answer: t('faq.sections.starters.q6.answer', '• **Biblioteca**: Livros como "Lean Startup", "Business Model Generation"\n• **Blog**: Artigos sobre validação, primeira venda, customer discovery\n• **Missões**: Tarefas práticas que ensinam conceitos enquanto você executa\n• **FAQ**: Este guia que você está lendo agora!')
        },
      ]
    },
    {
      id: 'starters-advanced',
      title: t('faq.sections.startersAdvanced.title', 'Dicas para Starters'),
      icon: <Lightbulb className="w-5 h-5" />,
      colorClass: 'text-purple-500',
      questions: [
        {
          question: t('faq.sections.startersAdvanced.q1.question', 'Como construir credibilidade sem experiência?'),
          answer: t('faq.sections.startersAdvanced.q1.answer', 'Mostre proatividade. Complete seu perfil com bio sincera sobre seus objetivos. Participe de discussões, ajude outros usuários. Credibilidade vem de consistência, não de currículo.')
        },
        {
          question: t('faq.sections.startersAdvanced.q2.question', 'Como usar a Taverna para networking inicial?'),
          answer: t('faq.sections.startersAdvanced.q2.answer', 'Filtre por arquétipos que te interessam. Leia bios antes de conectar. Envie mensagens personalizadas explicando por que quer se conectar e o que busca aprender. Seja específico, não genérico.')
        },
        {
          question: t('faq.sections.startersAdvanced.q3.question', 'Quais vagas são ideais para Starters?'),
          answer: t('faq.sections.startersAdvanced.q3.answer', 'Procure vagas que mencionam "aprendiz", "estágio", "contribuidor" ou "low equity/high learning". Startups em fase de ideia ou MVP são mais abertas a Starters do que empresas em tração.')
        },
        {
          question: t('faq.sections.startersAdvanced.q4.question', 'Quando migrar de Starter para Builder/Seller?'),
          answer: t('faq.sections.startersAdvanced.q4.answer', 'Quando você tiver: 1) Um projeto pessoal no portfolio, 2) Skills demonstráveis, 3) Experiência prática (mesmo que pequena). Não precisa ser perfeito - a migração é um marco, não um diploma.')
        },
        {
          question: t('faq.sections.startersAdvanced.q5.question', 'Como usar a Biblioteca para acelerar aprendizado?'),
          answer: t('faq.sections.startersAdvanced.q5.answer', 'Comece por "Lean Startup" para entender validação. Depois "Business Model Generation" para modelar negócios. Leia 1 capítulo por dia e aplique imediatamente em exercícios das Missões.')
        },
      ]
    },
  ];

  // Determinar quais seções específicas mostrar
  const getArchetypeSections = (): FAQSection[] => {
    // Se não está logado, mostra todas as seções específicas
    if (!isLoggedIn || !userArchetype) {
      return [...builderSections, ...sellerSections, ...investorSections, ...starterSections];
    }

    // Mostra apenas as seções do arquétipo do usuário
    switch (userArchetype) {
      case 'BUILDER':
        return builderSections;
      case 'SELLER':
        return sellerSections;
      case 'INVESTOR':
        return investorSections;
      case 'STARTER':
        return starterSections;
      default:
        return [...builderSections, ...sellerSections, ...investorSections, ...starterSections];
    }
  };

  const archetypeSections = getArchetypeSections();

  // Título da seção específica baseado no arquétipo
  const getArchetypeSectionTitle = () => {
    if (!isLoggedIn || !userArchetype) {
      return t('faq.specificSections.all', 'Guias por Tipo de Usuário');
    }
    switch (userArchetype) {
      case 'BUILDER':
        return t('faq.specificSections.builder', 'Guia para Builders');
      case 'SELLER':
        return t('faq.specificSections.seller', 'Guia para Sellers');
      case 'INVESTOR':
        return t('faq.specificSections.investor', 'Guia para Investidores');
      case 'STARTER':
        return t('faq.specificSections.starter', 'Guia para Starters');
      default:
        return t('faq.specificSections.all', 'Guias por Tipo de Usuário');
    }
  };

  // Handle scroll to section/question from URL params
  useEffect(() => {
    if (targetQuestion && targetSection) {
      setOpenValues(prev => ({ ...prev, [targetSection]: targetQuestion }));
      
      setTimeout(() => {
        const element = document.getElementById(targetQuestion);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('ring-2', 'ring-amber-400', 'ring-offset-2');
          setTimeout(() => {
            element.classList.remove('ring-2', 'ring-amber-400', 'ring-offset-2');
          }, 2000);
        }
      }, 300);
    } else if (targetSection) {
      const sectionEl = document.getElementById(`section-${targetSection}`);
      if (sectionEl) {
        sectionEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [targetSection, targetQuestion]);

  const renderSection = (section: FAQSection) => (
    <div key={section.id} id={`section-${section.id}`} className="bg-card rounded-xl border shadow-sm overflow-hidden">
      <div className="p-4 border-b bg-muted/30 flex items-center gap-3">
        <div className={section.colorClass}>{section.icon}</div>
        <h2 className={`font-semibold text-lg ${section.colorClass}`}>
          {section.title}
        </h2>
      </div>

      <Accordion 
        type="single" 
        collapsible 
        className="px-4"
        value={openValues[section.id]}
        onValueChange={(value) => setOpenValues(prev => ({ ...prev, [section.id]: value }))}
      >
        {section.questions.map((item, index) => {
          const questionId = `${section.id}-q${index + 1}`;
          return (
            <AccordionItem 
              key={index} 
              value={questionId}
              id={questionId}
              className="transition-all duration-300"
            >
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="font-medium text-foreground">{item.question}</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pb-4">
                <FAQAnswer content={item.answer} />
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>{t('faq.pageTitle', 'FAQ - Central de Ajuda | Guilda')}</title>
        <meta name="description" content={t('faq.pageDescription', 'Tire suas dúvidas sobre como usar a Guilda. Guia completo para Builders, Sellers e Investidores.')} />
        <link rel="canonical" href="https://www.guilda.app.br/faq" />
      </Helmet>

      {isLoggedIn ? (
        <InternalNavbar 
          userId={auth?.user?.id}
          username={auth?.profile?.username}
          avatarUrl={auth?.profile?.avatar_url}
          isPremium={isPremium}
          onLogout={logout}
          archetype={auth?.profile?.archetype}
        />
      ) : (
        <LandingNavbar />
      )}
      <SocialPaymentBanner />

      <PageContainer maxWidth="4xl" className="py-8 pb-24 lg:pb-8">
        {/* Header */}
        <div className="text-center mb-10 mt-2">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {t('faq.title', 'Central de Ajuda')}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t('faq.subtitle', 'Tire suas dúvidas sobre como usar a Guilda')}
          </p>
        </div>

        {/* Seção Geral - Como a Guilda Funciona */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            {t('faq.generalSection.title', 'Como a Guilda Funciona')}
          </h2>
          <div className="space-y-4">
            {generalSections.map(renderSection)}
          </div>
        </div>

        {/* Seção do Programa de Aceleração */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Rocket className="w-5 h-5 text-purple-500" />
            {t('faq.accelerationSection.title', 'Aceleração')}
          </h2>
          <div className="space-y-4">
            {accelerationSections.map(renderSection)}
          </div>
        </div>

        {/* Seção Específica por Arquétipo */}
        <div>
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            {userArchetype === 'BUILDER' && <Wrench className="w-5 h-5 text-primary" />}
            {userArchetype === 'SELLER' && <TrendingUp className="w-5 h-5 text-emerald-500" />}
            {userArchetype === 'INVESTOR' && <DollarSign className="w-5 h-5 text-violet-500" />}
            {userArchetype === 'STARTER' && <Sparkles className="w-5 h-5 text-purple-500" />}
            {!userArchetype && <Lightbulb className="w-5 h-5 text-amber-500" />}
            {getArchetypeSectionTitle()}
          </h2>
          <div className="space-y-4">
            {archetypeSections.map(renderSection)}
          </div>
        </div>
      </PageContainer>

      {!isLoggedIn && <LandingFooter />}
    </>
  );
}
