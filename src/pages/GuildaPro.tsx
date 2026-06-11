import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  Sparkles, Globe, ChevronDown, Wrench, Target, Rocket, Users,
  MessageCircle, Clock, Mic, Send, Swords, Percent, PieChart, Tag,
  FileText, Map, UserPlus, Heart, LayoutTemplate, ClipboardCheck,
  BookOpen, MessageSquare, Shield, BarChart, Clipboard, ClipboardList,
  ListChecks, DollarSign, TrendingDown, Calculator, Receipt, TrendingUp,
  Scale, Flame, Lightbulb, Megaphone, Folder, FileSignature } from
'lucide-react';

const construirItems = [
{ icon: Percent, title: 'Equity Split', desc: 'Calcule a divisão ideal de equity entre cofounders' },
{ icon: PieChart, title: 'Cap Table', desc: 'Monte e simule sua cap table' },
{ icon: Tag, title: 'Pricing Strategy', desc: 'Defina a estratégia de precificação ideal' },
{ icon: FileText, title: 'PRD Engine', desc: 'Gere um PRD completo para seu produto' },
{ icon: Map, title: 'Roadmap', desc: 'Construa um roadmap de produto com timeline' },
{ icon: UserPlus, title: 'Persona Builder', desc: 'Crie personas detalhadas do seu cliente ideal' },
{ icon: Heart, title: 'Empathy Map', desc: 'Mapeie o que seu cliente pensa, sente, faz e diz' },
{ icon: Sparkles, title: 'MVP Builder IA', desc: 'Construa seu MVP com assistência de IA' },
{ icon: LayoutTemplate, title: 'Gerador de LPs', desc: 'Crie landing pages estratégicas com IA' },
{ icon: ClipboardCheck, title: 'Checklist Abertura', desc: 'Guia completo para abrir sua empresa' },
{ icon: BookOpen, title: 'Knowledge Roadmap', desc: 'Mapeie o que você precisa aprender para crescer' },
{ icon: MessageSquare, title: 'Customer Dev Script', desc: 'Roteiro de entrevista de validação com clientes' }];


const validarItems = [
{ icon: Shield, title: 'SWOT Analysis', desc: 'Analise forças, fraquezas, oportunidades e ameaças' },
{ icon: BarChart, title: 'Business Model Canvas', desc: 'Mapeie os 9 blocos do seu modelo de negócio' },
{ icon: ClipboardList, title: 'Lean Canvas', desc: 'Crie seu Lean Canvas interativo de 9 blocos' },
{ icon: Target, title: 'Análise Competitiva', desc: 'Mapeie concorrentes e encontre diferenciais' },
{ icon: ListChecks, title: 'OKR Generator', desc: 'Defina OKRs claros e mensuráveis' },
{ icon: Clipboard, title: 'Business Plan', desc: 'Construa seu Business Plan interativo via chat' },
{ icon: Sparkles, title: 'Pitch Maker', desc: 'Crie um pitch deck profissional' }];


const escalarItems = [
{ icon: DollarSign, title: 'Valuation', desc: 'Estime o valuation da sua startup' },
{ icon: TrendingDown, title: 'Runway', desc: 'Calcule por quanto tempo seu dinheiro dura' },
{ icon: Calculator, title: 'Unit Economics', desc: 'Calcule CAC, LTV e métricas unitárias' },
{ icon: Receipt, title: 'Markup Calculator', desc: 'Calcule markup e margem de lucro ideal' },
{ icon: TrendingUp, title: 'ROI Calculator', desc: 'Calcule o retorno sobre investimento' },
{ icon: Scale, title: 'Break-even', desc: 'Descubra quando sua startup se paga' },
{ icon: Flame, title: 'Burn Rate Optimizer', desc: 'Otimize seus gastos e estenda o runway' },
{ icon: Rocket, title: 'Go-to-Market', desc: 'Crie uma estratégia de entrada no mercado' },
{ icon: Globe, title: 'TAM SAM SOM', desc: 'Dimensione seu mercado total, acessível e obtível' },
{ icon: Lightbulb, title: 'Marketing Planner', desc: 'Planeje sua estratégia de marketing e tráfego' },
{ icon: Send, title: 'Cold Outreach', desc: 'Crie scripts de abordagem fria para vendas' },
{ icon: Megaphone, title: 'Roteiro de Call', desc: 'Roteiro para calls com investidores ou clientes' },
{ icon: Folder, title: 'Data Room', desc: 'Monte seu data room para investidores' },
{ icon: FileSignature, title: 'Contract Generator', desc: 'Gere minutas de contratos para sua startup' },
{ icon: FileText, title: 'Gerador de Propostas', desc: 'Gere propostas comerciais profissionais' },
{ icon: Shield, title: 'Guia LGPD', desc: 'Adeque sua startup à Lei Geral de Proteção de Dados' }];


const sociosItems = [
{ icon: Users, title: 'Co-Founder Match', desc: 'Encontre o co-founder ideal para sua startup' },
{ icon: Rocket, title: 'Oportunidades', desc: 'Descubra vagas, investimentos, parcerias e negócios' }];


type TabKey = 'construir' | 'validar' | 'escalar' | 'socios';

const tabs: {key: TabKey;label: string;icon: React.ElementType;}[] = [
{ key: 'construir', label: 'Construir', icon: Wrench },
{ key: 'validar', label: 'Validar', icon: Target },
{ key: 'escalar', label: 'Escalar', icon: Rocket },
{ key: 'socios', label: 'Sócios', icon: Users }];


const tabItems: Record<TabKey, typeof construirItems> = {
  construir: construirItems,
  validar: validarItems,
  escalar: escalarItems,
  socios: sociosItems
};

const GoogleIcon = () =>
<svg className="w-5 h-5" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>;


export default function GuildaPro() {
  const [activeTab, setActiveTab] = useState<TabKey | null>(null);

  const handleTabClick = (key: TabKey) => {
    setActiveTab((prev) => prev === key ? null : key);
  };

  return (
    <>
      <Helmet>
        <title>Guilda PRO — Crie, Valide e Escale sua Startup</title>
        <meta name="description" content="Plataforma completa para empreendedores criarem, validarem e escalarem suas startups com ferramentas inteligentes e network." />
      </Helmet>

      <div className="min-h-screen bg-white text-[#111111] selection:bg-[#ea7100]/30">
        {/* Navbar */}
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-black/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Swords className="w-6 h-6 text-[#7610dc]" />
              <span className="text-xl font-bold tracking-tight">
                Guilda <span className="text-[#7610dc]">PRO</span>
              </span>
            </div>

            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#111111]/70">
              <a href="#" className="hover:text-[#111111] transition-colors">Área de criação</a>
              <a href="#" className="hover:text-[#111111] transition-colors">Aceleração</a>
              <a href="#" className="hover:text-[#111111] transition-colors">Oportunidades</a>
            </div>

            <div className="flex items-center gap-3">
              <button className="p-2 text-[#111111]/50 hover:text-[#111111] transition-colors">
                <Globe className="w-5 h-5" />
              </button>
              <button className="hidden sm:inline-flex px-4 py-2 text-sm font-medium border border-[#111111]/15 rounded-full hover:bg-[#111111]/5 transition-colors">
                Entrar
              </button>
              <button className="px-4 py-2 text-sm font-medium text-white bg-[#ea7100] rounded-full hover:bg-[#d06400] transition-colors">
                Experimente
              </button>
            </div>
          </div>
        </nav>

        {/* Main */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 lg:items-center">
            {/* Left Column */}
            <div className="space-y-8">
              <h1
                className="text-5xl lg:text-[4rem] font-serif leading-[1.1] tracking-tight"
                style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
                
                Vamos criar,<br />
                validar e escalar<br />
                sua startup?
              </h1>

              {/* Signup Card */}
              <div className="rounded-[2rem] border border-black/10 shadow-2xl p-8 space-y-6 max-w-md">
                <button className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-black/10 rounded-full hover:bg-black/[0.02] transition-colors font-medium">
                  <GoogleIcon />
                  Continuar com Google
                </button>

                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-black/10" />
                  <span className="text-sm text-[#111111]/40">ou</span>
                  <div className="flex-1 h-px bg-black/10" />
                </div>

                <div className="space-y-3">
                  <input
                    type="email"
                    placeholder="Digite seu email"
                    className="w-full py-3 px-4 border border-black/10 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#7610dc]/30 focus:border-[#7610dc] transition-all" />
                  
                  <button className="w-full py-3 px-4 bg-[#7610dc] text-white rounded-full font-medium hover:bg-[#5c0db3] transition-colors">
                    Continuar com email
                  </button>
                </div>

                <p className="text-xs text-[#111111]/40 text-center">
                  Ao continuar, você concorda com a{' '}
                  <a href="/privacy" className="underline hover:text-[#111111]/60">Política de Privacidade</a> da Guilda.
                </p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6 lg:pt-8">
              <div className="max-w-xl mx-auto space-y-4">
                {/* Intro text */}
                <p className="text-[#111111]/60 text-center text-base">
                  Escolha uma ferramenta abaixo ou simplesmente digite o que precisa.
                </p>

                {/* Action Chips */}
                <div className="flex flex-wrap justify-center gap-2 lg:flex-nowrap lg:gap-2">
                  {tabs.map(({ key, label, icon: Icon }) =>
                  <button
                    key={key}
                    onClick={() => handleTabClick(key)}
                    className={`flex items-center gap-1.5 px-4 py-2 text-sm border rounded-full hover:shadow-md transition-all whitespace-nowrap ${
                    activeTab === key ?
                    'bg-[#7610dc] border-[#7610dc] text-white' :
                    'bg-white border-[#111111]/10 text-[#111111]/80'}`
                    }>

                      <Icon className="w-4 h-4" />
                      {label}
                    </button>
                  )}
                  <button className="flex items-center gap-1.5 px-4 py-2 text-sm border border-[#111111]/10 rounded-full bg-white text-[#111111]/80 hover:shadow-md transition-all whitespace-nowrap">
                    <MessageCircle className="w-4 h-4" />
                    Network
                  </button>
                </div>
              </div>

              {/* Tool Items */}
              <AnimatePresence mode="wait">
                {activeTab &&
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                    {tabItems[activeTab].map((item, idx) =>
                  <button
                    key={idx}
                    className="flex items-start gap-3 p-4 rounded-2xl border border-black/5 hover:border-[#7610dc]/30 hover:shadow-md transition-all text-left group">
                    
                        <div className="p-2 rounded-xl bg-[#7610dc]/10 text-[#7610dc] group-hover:bg-[#7610dc] group-hover:text-white transition-colors flex-shrink-0">
                          <item.icon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm">{item.title}</p>
                          <p className="text-xs text-[#111111]/50 mt-0.5 leading-relaxed">{item.desc}</p>
                        </div>
                      </button>
                  )}
                  </motion.div>
                }
              </AnimatePresence>

              {/* Prompt Area */}
              <div className="rounded-2xl border border-black/10 p-5">
                <textarea
                  placeholder="Descreva o próximo passo da sua startup..."
                  rows={3}
                  className="w-full resize-none text-sm text-[#111111] placeholder:text-[#111111]/30 focus:outline-none bg-transparent" />
                
                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-1 text-[#111111]/70 hover:text-[#111111] transition-colors font-medium text-sm">
                      Ferramentas
                      <div className="relative">
                        <ChevronDown className="w-4 h-4 ml-1" />
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                      </div>
                    </button>
                    <button className="text-[#111111]/40 hover:text-[#111111]/70 transition-colors">
                      <Clock className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-4">
                    <button className="text-[#111111]/40 hover:text-[#111111]/70 transition-colors">
                      <Mic className="w-5 h-5" />
                    </button>
                    <button className="text-[#111111]/40 hover:text-[#ea7100] transition-colors">
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Social Proof */}
              <div className="flex flex-col items-center mt-12 mb-12">
                <div className="flex -space-x-4 mb-4">
                  <img className="w-12 h-12 rounded-full border-2 border-white" src="https://i.pravatar.cc/100?img=11" alt="User" />
                  <div className="w-12 h-12 rounded-full border-2 border-white bg-[#ea7100] flex items-center justify-center text-white font-bold opacity-90">
                    <span className="text-xl leading-none -mt-2">. .</span>
                  </div>
                  <img className="w-12 h-12 rounded-full border-2 border-white" src="https://i.pravatar.cc/100?img=12" alt="User" />
                  <img className="w-12 h-12 rounded-full border-2 border-white" src="https://i.pravatar.cc/100?img=5" alt="User" />
                  <img className="w-12 h-12 rounded-full border-2 border-white" src="https://i.pravatar.cc/100?img=14" alt="User" />
                  <img className="w-12 h-12 rounded-full border-2 border-white" src="https://i.pravatar.cc/100?img=15" alt="User" />
                  <div className="w-12 h-12 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-gray-500 font-medium text-sm">
                    +500
                  </div>
                </div>
                <p className="text-[#111111]/60 text-center text-base">
                  Junte-se a mais de <span className="font-bold text-[#111111]">578</span> empreendedores criando com a Guilda PRO.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>);

}