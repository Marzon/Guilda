-- Adicionar coluna is_test_user na tabela acceleration_user_progress
-- Isso identifica batch managers que estão testando a jornada
ALTER TABLE public.acceleration_user_progress 
ADD COLUMN IF NOT EXISTS is_test_user boolean DEFAULT false;

-- Criar índice para consultas filtradas
CREATE INDEX IF NOT EXISTS idx_acceleration_user_progress_is_test_user 
ON public.acceleration_user_progress(is_test_user);

-- Atualizar RLS para permitir batch managers criar seu próprio progresso de teste
CREATE POLICY "Batch managers can create test progress"
ON public.acceleration_user_progress
FOR INSERT
WITH CHECK (
  auth.uid() = user_id 
  AND is_test_user = true
  AND EXISTS (
    SELECT 1 FROM cohort_managers cm 
    WHERE cm.user_id = auth.uid() 
    AND cm.cohort_id = acceleration_user_progress.cohort_id
  )
);

-- Batch managers podem atualizar seu próprio progresso de teste
CREATE POLICY "Batch managers can update their test progress"
ON public.acceleration_user_progress
FOR UPDATE
USING (
  auth.uid() = user_id 
  AND is_test_user = true
  AND EXISTS (
    SELECT 1 FROM cohort_managers cm 
    WHERE cm.user_id = auth.uid() 
    AND cm.cohort_id = acceleration_user_progress.cohort_id
  )
);

-- Batch managers podem ver seu próprio progresso de teste
CREATE POLICY "Batch managers can view their test progress"
ON public.acceleration_user_progress
FOR SELECT
USING (
  auth.uid() = user_id 
  AND is_test_user = true
);

-- Comentário para documentação
COMMENT ON COLUMN public.acceleration_user_progress.is_test_user IS 'True para batch managers testando a jornada. Não são listados como membros e não têm times.';