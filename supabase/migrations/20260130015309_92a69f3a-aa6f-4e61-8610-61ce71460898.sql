-- Criar enum para tipo de banner
CREATE TYPE public.banner_type AS ENUM ('top_bar', 'modal', 'floating', 'inline');

-- Criar enum para público-alvo
CREATE TYPE public.banner_audience AS ENUM ('all', 'anonymous', 'authenticated', 'free', 'premium');

-- Criar enum para variante visual
CREATE TYPE public.banner_variant AS ENUM ('default', 'success', 'warning', 'info', 'gradient', 'custom');

-- Criar tabela de banners
CREATE TABLE public.banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificação
  name TEXT NOT NULL, -- Nome interno para admin
  slug TEXT UNIQUE, -- Identificador único (ex: 'social-payment', 'acceleration-promo')
  
  -- Conteúdo
  title TEXT NOT NULL,
  description TEXT,
  cta_text TEXT, -- Texto do botão
  cta_link TEXT, -- Link do botão
  secondary_cta_text TEXT, -- Segundo botão opcional
  secondary_cta_link TEXT,
  icon TEXT, -- Nome do ícone Lucide
  image_url TEXT, -- URL de imagem opcional
  
  -- Configurações visuais
  type banner_type NOT NULL DEFAULT 'top_bar',
  variant banner_variant NOT NULL DEFAULT 'default',
  custom_gradient TEXT, -- Ex: 'from-purple-600 via-pink-600 to-purple-600'
  custom_bg_color TEXT, -- Cor de fundo customizada
  custom_text_color TEXT, -- Cor do texto customizada
  
  -- Exibição
  audience banner_audience NOT NULL DEFAULT 'all',
  pages TEXT[] DEFAULT '{}', -- Páginas específicas (vazio = todas)
  exclude_pages TEXT[] DEFAULT '{}', -- Páginas a excluir
  
  -- Comportamento
  is_dismissible BOOLEAN DEFAULT true,
  dismiss_duration_hours INTEGER DEFAULT 24, -- Horas até reaparecer após dismiss
  show_once_per_session BOOLEAN DEFAULT false,
  priority INTEGER DEFAULT 0, -- Maior = mais prioritário
  
  -- Agendamento
  is_active BOOLEAN DEFAULT false,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  
  -- Métricas
  views_count INTEGER DEFAULT 0,
  clicks_count INTEGER DEFAULT 0,
  dismisses_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Tabela para tracking de dismiss por usuário
CREATE TABLE public.banner_dismissals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  banner_id UUID NOT NULL REFERENCES public.banners(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT, -- Para usuários anônimos
  dismissed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(banner_id, user_id),
  UNIQUE(banner_id, session_id)
);

-- Habilitar RLS
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banner_dismissals ENABLE ROW LEVEL SECURITY;

-- Policies para banners
CREATE POLICY "Banners ativos são públicos" 
ON public.banners FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins podem ver todos os banners" 
ON public.banners FOR SELECT 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem criar banners" 
ON public.banners FOR INSERT 
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem atualizar banners" 
ON public.banners FOR UPDATE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem deletar banners" 
ON public.banners FOR DELETE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Policies para dismissals
CREATE POLICY "Usuários podem ver seus próprios dismissals" 
ON public.banner_dismissals FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Usuários podem criar seus próprios dismissals" 
ON public.banner_dismissals FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Anônimos podem criar dismissals por session" 
ON public.banner_dismissals FOR INSERT 
TO anon
WITH CHECK (user_id IS NULL AND session_id IS NOT NULL);

CREATE POLICY "Anônimos podem ver dismissals por session" 
ON public.banner_dismissals FOR SELECT 
TO anon
USING (user_id IS NULL);

-- Trigger para updated_at
CREATE TRIGGER update_banners_updated_at
BEFORE UPDATE ON public.banners
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_banners_active ON public.banners(is_active) WHERE is_active = true;
CREATE INDEX idx_banners_dates ON public.banners(start_date, end_date) WHERE is_active = true;
CREATE INDEX idx_banners_priority ON public.banners(priority DESC) WHERE is_active = true;
CREATE INDEX idx_banner_dismissals_user ON public.banner_dismissals(user_id, banner_id);
CREATE INDEX idx_banner_dismissals_session ON public.banner_dismissals(session_id, banner_id);

-- Inserir banners existentes migrados
INSERT INTO public.banners (
  name, slug, title, description, cta_text, cta_link, 
  icon, type, variant, custom_gradient, audience, 
  is_dismissible, dismiss_duration_hours, priority, is_active, pages
) VALUES 
(
  'Social Payment Banner',
  'social-payment',
  'Ganhe 6 meses de acesso ao Guilda',
  'Divulgue a Guilda nas redes sociais e ganhe 6 meses de acesso premium',
  'Quero Divulgar',
  '/auth',
  'Crown',
  'top_bar',
  'gradient',
  'from-purple-600 via-pink-600 to-purple-600',
  'free',
  true,
  24,
  10,
  true,
  '{}'
),
(
  'Aceleração Promo',
  'acceleration-promo',
  'ACELERAÇÃO DO OR DIE',
  'De Ideia a MVP em 15 Dias',
  'Conhecer Programa',
  '/aceleracao',
  'Rocket',
  'modal',
  'custom',
  'from-slate-900 via-slate-800 to-slate-900',
  'all',
  true,
  168, -- 7 dias
  5,
  true,
  '{}'
);