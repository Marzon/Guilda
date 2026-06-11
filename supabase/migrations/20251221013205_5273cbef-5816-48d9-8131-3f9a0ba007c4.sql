-- Fase 1: Remover sistema de feedback completo

-- Remover policies primeiro
DROP POLICY IF EXISTS "Admins can update feedback" ON feedback;
DROP POLICY IF EXISTS "Admins can view all feedback" ON feedback;
DROP POLICY IF EXISTS "Users can create feedback" ON feedback;
DROP POLICY IF EXISTS "Users can view own feedback" ON feedback;

-- Deletar tabela feedback
DROP TABLE IF EXISTS feedback;