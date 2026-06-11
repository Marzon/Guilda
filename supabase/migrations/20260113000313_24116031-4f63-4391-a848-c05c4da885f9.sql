-- Tabela para solicitações de depoimentos
CREATE TABLE public.testimonial_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('individual', 'partnership')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'responded', 'approved', 'rejected', 'expired')),
  
  -- Para individual
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Para parceria (match existente)
  match_id UUID REFERENCES public.matches(id) ON DELETE SET NULL,
  founder_1_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  founder_2_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Contexto opcional
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  context_message TEXT, -- Mensagem do admin para contextualizar
  
  -- Controle
  requested_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '30 days'),
  
  -- Constraint: individual precisa de user_id, parceria precisa de founder_1_id e founder_2_id
  CONSTRAINT valid_type_users CHECK (
    (type = 'individual' AND user_id IS NOT NULL) OR
    (type = 'partnership' AND founder_1_id IS NOT NULL AND founder_2_id IS NOT NULL)
  )
);

-- Tabela para respostas dos depoimentos
CREATE TABLE public.testimonial_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES public.testimonial_requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Respostas às perguntas (em JSON para flexibilidade)
  answers JSONB NOT NULL DEFAULT '{}',
  
  -- Campos extraídos/editados pelo admin
  final_quote TEXT, -- Depoimento final aprovado
  
  -- Controle
  responded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(request_id, user_id)
);

-- Tabela para depoimentos aprovados e publicados
CREATE TABLE public.published_testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID REFERENCES public.testimonial_requests(id) ON DELETE SET NULL,
  response_id UUID REFERENCES public.testimonial_responses(id) ON DELETE SET NULL,
  
  -- Dados do depoimento
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- Para parcerias
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  
  quote TEXT NOT NULL,
  partnership_type TEXT, -- cofounder, team, mentor, investor, etc
  
  -- Controle de exibição
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER,
  display_pages TEXT[] DEFAULT ARRAY['home']::TEXT[], -- home, builders, sellers, investors, success
  
  -- Aprovação
  approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  approved_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX idx_testimonial_requests_user ON public.testimonial_requests(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_testimonial_requests_founders ON public.testimonial_requests(founder_1_id, founder_2_id);
CREATE INDEX idx_testimonial_requests_status ON public.testimonial_requests(status);
CREATE INDEX idx_testimonial_responses_request ON public.testimonial_responses(request_id);
CREATE INDEX idx_published_testimonials_pages ON public.published_testimonials USING GIN(display_pages);
CREATE INDEX idx_published_testimonials_featured ON public.published_testimonials(is_featured) WHERE is_featured = true;

-- Enable RLS
ALTER TABLE public.testimonial_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonial_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.published_testimonials ENABLE ROW LEVEL SECURITY;

-- RLS Policies para testimonial_requests
CREATE POLICY "Users can view their own requests"
  ON public.testimonial_requests
  FOR SELECT
  USING (
    auth.uid() = user_id OR 
    auth.uid() = founder_1_id OR 
    auth.uid() = founder_2_id OR
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can create requests"
  ON public.testimonial_requests
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update requests"
  ON public.testimonial_requests
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete requests"
  ON public.testimonial_requests
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies para testimonial_responses
CREATE POLICY "Users can view their own responses"
  ON public.testimonial_responses
  FOR SELECT
  USING (
    auth.uid() = user_id OR
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Users can insert their own response"
  ON public.testimonial_responses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own response"
  ON public.testimonial_responses
  FOR UPDATE
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- RLS Policies para published_testimonials
CREATE POLICY "Anyone can view published testimonials"
  ON public.published_testimonials
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage published testimonials"
  ON public.published_testimonials
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Trigger para updated_at
CREATE TRIGGER update_published_testimonials_updated_at
  BEFORE UPDATE ON public.published_testimonials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Função para verificar se usuário tem depoimento pendente
CREATE OR REPLACE FUNCTION public.get_pending_testimonial_request(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  type TEXT,
  context_message TEXT,
  partner_username TEXT,
  partner_avatar TEXT,
  project_title TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    tr.id,
    tr.type,
    tr.context_message,
    CASE 
      WHEN tr.type = 'partnership' AND tr.founder_1_id = p_user_id THEN p2.username
      WHEN tr.type = 'partnership' AND tr.founder_2_id = p_user_id THEN p1.username
      ELSE NULL
    END as partner_username,
    CASE 
      WHEN tr.type = 'partnership' AND tr.founder_1_id = p_user_id THEN p2.avatar_url
      WHEN tr.type = 'partnership' AND tr.founder_2_id = p_user_id THEN p1.avatar_url
      ELSE NULL
    END as partner_avatar,
    proj.title as project_title,
    tr.created_at
  FROM public.testimonial_requests tr
  LEFT JOIN public.profiles p1 ON tr.founder_1_id = p1.id
  LEFT JOIN public.profiles p2 ON tr.founder_2_id = p2.id
  LEFT JOIN public.projects proj ON tr.project_id = proj.id
  LEFT JOIN public.testimonial_responses resp ON resp.request_id = tr.id AND resp.user_id = p_user_id
  WHERE (
    tr.user_id = p_user_id OR 
    tr.founder_1_id = p_user_id OR 
    tr.founder_2_id = p_user_id
  )
  AND tr.status = 'pending'
  AND resp.id IS NULL -- Ainda não respondeu
  AND (tr.expires_at IS NULL OR tr.expires_at > now())
  ORDER BY tr.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;