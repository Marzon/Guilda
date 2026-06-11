-- Criar enum para status do membro na turma
CREATE TYPE cohort_member_status AS ENUM ('ENROLLED', 'ACTIVE', 'DROPPED', 'REMOVED', 'GRADUATED');

-- Adicionar coluna member_status na tabela subscriptions
ALTER TABLE public.subscriptions ADD COLUMN member_status cohort_member_status DEFAULT 'ENROLLED';

-- Atualizar membros existentes com cohort_id para ACTIVE (já estão cursando)
UPDATE public.subscriptions SET member_status = 'ACTIVE' WHERE cohort_id IS NOT NULL;