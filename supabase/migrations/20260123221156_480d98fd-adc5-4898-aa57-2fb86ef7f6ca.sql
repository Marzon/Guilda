-- 1. Adicionar política RLS para admins lerem a fila de broadcast
CREATE POLICY "Admin can read broadcast queue" 
ON public.broadcast_email_queue
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- 2. Criar função claim_broadcast_emails para evitar duplicações
CREATE OR REPLACE FUNCTION public.claim_broadcast_emails(
  p_batch_size integer DEFAULT 10,
  p_max_attempts integer DEFAULT 3
)
RETURNS SETOF public.broadcast_email_queue
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  UPDATE public.broadcast_email_queue
  SET 
    status = 'processing',
    last_attempt_at = now()
  WHERE id IN (
    SELECT id FROM public.broadcast_email_queue
    WHERE status = 'pending' AND attempts < p_max_attempts
    ORDER BY created_at
    LIMIT p_batch_size
    FOR UPDATE SKIP LOCKED
  )
  RETURNING *;
END;
$$;

-- Garantir que a função pode ser chamada via RPC
GRANT EXECUTE ON FUNCTION public.claim_broadcast_emails(integer, integer) TO service_role;