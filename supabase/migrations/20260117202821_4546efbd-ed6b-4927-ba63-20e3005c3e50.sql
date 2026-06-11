-- =============================================
-- PROTOCOLO DO OR DIE - SISTEMA DE CRONOGRAMA
-- =============================================

-- 1. Tabela de Fases do Programa
CREATE TABLE public.acceleration_phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id UUID REFERENCES public.cohorts(id) ON DELETE CASCADE,
  phase_number INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  start_day INTEGER NOT NULL,
  end_day INTEGER NOT NULL,
  icon TEXT DEFAULT 'target',
  color TEXT DEFAULT '#FF0000',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(cohort_id, phase_number)
);

-- 2. Tabela de Tarefas dentro das Fases
CREATE TABLE public.acceleration_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_id UUID NOT NULL REFERENCES public.acceleration_phases(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  deliverable_format TEXT DEFAULT 'text' CHECK (deliverable_format IN ('text', 'file', 'url', 'both')),
  evaluation_criteria TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_required BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Tabela de Submissões dos Founders
CREATE TABLE public.acceleration_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES public.acceleration_tasks(id) ON DELETE CASCADE,
  cohort_id UUID NOT NULL REFERENCES public.cohorts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  file_url TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'RESUBMIT')),
  ai_feedback TEXT,
  admin_feedback TEXT,
  admin_override_by UUID REFERENCES public.profiles(id),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  UNIQUE(user_id, task_id)
);

-- 4. Tabela de Configuração do Agente AI
CREATE TABLE public.acceleration_agent_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id UUID REFERENCES public.cohorts(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Commander',
  system_prompt TEXT NOT NULL DEFAULT 'You are the ''Commander'' of the Do or Die Protocol. Your goal is to kill bad startup ideas quickly so founders don''t waste years of their lives.

Your Personality:
- Direct, brutal, and concise. No fluff. No ''Great job!''.
- Use military/tactical language.
- If a submission is vague, reject it immediately and explain why it''s weak.
- If a submission is good, say ''Passed. Move out.''

Evaluation Criteria:
- Day 1-3: Focus on specific problem/solution. Ban buzzwords like ''revolutionize'', ''platform'', ''ecosystem''.
- Day 4-7: Focus on action. Did they actually talk to humans? If the numbers look fake, call them out.
- Day 8-15: Focus on money and retention.

Output Format: Start with either [APPROVED] or [REJECTED]. Then give a max 3-sentence critique.',
  model TEXT NOT NULL DEFAULT 'google/gemini-2.5-flash',
  temperature NUMERIC DEFAULT 0.3,
  knowledge_tables TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(cohort_id)
);

-- 5. Tabela de Progresso do Usuário
CREATE TABLE public.acceleration_user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  cohort_id UUID NOT NULL REFERENCES public.cohorts(id) ON DELETE CASCADE,
  current_day INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'STUCK', 'COMPLETED', 'DIED')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_activity_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, cohort_id)
);

-- =============================================
-- ÍNDICES PARA PERFORMANCE
-- =============================================

CREATE INDEX idx_acceleration_phases_cohort ON public.acceleration_phases(cohort_id);
CREATE INDEX idx_acceleration_tasks_phase ON public.acceleration_tasks(phase_id);
CREATE INDEX idx_acceleration_tasks_day ON public.acceleration_tasks(day_number);
CREATE INDEX idx_acceleration_submissions_user ON public.acceleration_submissions(user_id);
CREATE INDEX idx_acceleration_submissions_task ON public.acceleration_submissions(task_id);
CREATE INDEX idx_acceleration_submissions_cohort ON public.acceleration_submissions(cohort_id);
CREATE INDEX idx_acceleration_submissions_status ON public.acceleration_submissions(status);
CREATE INDEX idx_acceleration_user_progress_user_cohort ON public.acceleration_user_progress(user_id, cohort_id);

-- =============================================
-- TRIGGERS PARA UPDATED_AT
-- =============================================

CREATE TRIGGER update_acceleration_phases_updated_at
  BEFORE UPDATE ON public.acceleration_phases
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_acceleration_tasks_updated_at
  BEFORE UPDATE ON public.acceleration_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_acceleration_agent_config_updated_at
  BEFORE UPDATE ON public.acceleration_agent_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE public.acceleration_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acceleration_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acceleration_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acceleration_agent_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acceleration_user_progress ENABLE ROW LEVEL SECURITY;

-- Políticas para PHASES (admins e batch managers podem gerenciar)
CREATE POLICY "Admins can manage phases"
  ON public.acceleration_phases
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Batch managers can manage phases of their cohorts"
  ON public.acceleration_phases
  FOR ALL
  USING (can_manage_cohort(auth.uid(), cohort_id))
  WITH CHECK (can_manage_cohort(auth.uid(), cohort_id));

CREATE POLICY "Enrolled users can view phases of their cohort"
  ON public.acceleration_phases
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.subscriptions s
      WHERE s.user_id = auth.uid()
      AND s.cohort_id = acceleration_phases.cohort_id
    )
  );

-- Políticas para TASKS
CREATE POLICY "Admins can manage tasks"
  ON public.acceleration_tasks
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Batch managers can manage tasks of their cohorts"
  ON public.acceleration_tasks
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.acceleration_phases p
      WHERE p.id = acceleration_tasks.phase_id
      AND can_manage_cohort(auth.uid(), p.cohort_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.acceleration_phases p
      WHERE p.id = acceleration_tasks.phase_id
      AND can_manage_cohort(auth.uid(), p.cohort_id)
    )
  );

CREATE POLICY "Enrolled users can view tasks of their cohort"
  ON public.acceleration_tasks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.acceleration_phases p
      JOIN public.subscriptions s ON s.cohort_id = p.cohort_id
      WHERE p.id = acceleration_tasks.phase_id
      AND s.user_id = auth.uid()
    )
  );

-- Políticas para SUBMISSIONS
CREATE POLICY "Users can view their own submissions"
  ON public.acceleration_submissions
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own submissions"
  ON public.acceleration_submissions
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own pending submissions"
  ON public.acceleration_submissions
  FOR UPDATE
  USING (user_id = auth.uid() AND status IN ('PENDING', 'REJECTED', 'RESUBMIT'));

CREATE POLICY "Admins can view all submissions"
  ON public.acceleration_submissions
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all submissions"
  ON public.acceleration_submissions
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Batch managers can view submissions of their cohorts"
  ON public.acceleration_submissions
  FOR SELECT
  USING (can_manage_cohort(auth.uid(), cohort_id));

CREATE POLICY "Batch managers can update submissions of their cohorts"
  ON public.acceleration_submissions
  FOR UPDATE
  USING (can_manage_cohort(auth.uid(), cohort_id));

-- Políticas para AGENT CONFIG
CREATE POLICY "Admins can manage agent config"
  ON public.acceleration_agent_config
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Batch managers can manage agent config of their cohorts"
  ON public.acceleration_agent_config
  FOR ALL
  USING (can_manage_cohort(auth.uid(), cohort_id))
  WITH CHECK (can_manage_cohort(auth.uid(), cohort_id));

-- Políticas para USER PROGRESS
CREATE POLICY "Users can view their own progress"
  ON public.acceleration_user_progress
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own progress"
  ON public.acceleration_user_progress
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all progress"
  ON public.acceleration_user_progress
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Batch managers can view progress of their cohorts"
  ON public.acceleration_user_progress
  FOR SELECT
  USING (can_manage_cohort(auth.uid(), cohort_id));

CREATE POLICY "Batch managers can update progress of their cohorts"
  ON public.acceleration_user_progress
  FOR UPDATE
  USING (can_manage_cohort(auth.uid(), cohort_id));

-- =============================================
-- FUNÇÃO PARA OBTER CONTEXTO DA BASE DE CONHECIMENTO
-- =============================================

CREATE OR REPLACE FUNCTION public.get_agent_knowledge_context(
  p_cohort_id UUID,
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_config RECORD;
  v_result JSONB := '{}';
  v_table TEXT;
  v_temp JSONB;
BEGIN
  -- Buscar configuração do agente
  SELECT * INTO v_config
  FROM public.acceleration_agent_config
  WHERE cohort_id = p_cohort_id AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN v_result;
  END IF;
  
  -- Para cada tabela na base de conhecimento
  FOREACH v_table IN ARRAY v_config.knowledge_tables
  LOOP
    CASE v_table
      WHEN 'profiles' THEN
        SELECT jsonb_build_object('user_profile', to_jsonb(p.*))
        INTO v_temp
        FROM public.profiles p
        WHERE p.id = p_user_id;
        v_result := v_result || COALESCE(v_temp, '{}'::jsonb);
        
      WHEN 'projects' THEN
        SELECT jsonb_build_object('user_projects', COALESCE(jsonb_agg(to_jsonb(proj.*)), '[]'::jsonb))
        INTO v_temp
        FROM public.projects proj
        WHERE proj.owner_id = p_user_id;
        v_result := v_result || COALESCE(v_temp, '{}'::jsonb);
        
      WHEN 'acceleration_applications' THEN
        SELECT jsonb_build_object('user_application', to_jsonb(a.*))
        INTO v_temp
        FROM public.acceleration_applications a
        WHERE a.user_id = p_user_id;
        v_result := v_result || COALESCE(v_temp, '{}'::jsonb);
        
      WHEN 'acceleration_submissions' THEN
        SELECT jsonb_build_object('previous_submissions', COALESCE(jsonb_agg(to_jsonb(s.*)), '[]'::jsonb))
        INTO v_temp
        FROM public.acceleration_submissions s
        WHERE s.user_id = p_user_id AND s.cohort_id = p_cohort_id;
        v_result := v_result || COALESCE(v_temp, '{}'::jsonb);
        
      ELSE
        NULL;
    END CASE;
  END LOOP;
  
  RETURN v_result;
END;
$$;