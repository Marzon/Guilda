-- Reset emails stuck in 'processing' for more than 5 minutes back to 'pending'
UPDATE broadcast_email_queue
SET status = 'pending', attempts = attempts
WHERE status = 'processing'
AND (last_attempt_at < now() - interval '5 minutes' OR last_attempt_at IS NULL);

-- Update the claim_broadcast_emails function to also pick up stuck emails
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
    WHERE 
      -- Normal pending emails
      (status = 'pending' AND attempts < p_max_attempts)
      OR
      -- Emails stuck in processing for more than 5 minutes (zombie recovery)
      (status = 'processing' AND last_attempt_at < now() - interval '5 minutes')
    ORDER BY 
      CASE WHEN status = 'pending' THEN 0 ELSE 1 END, -- Prioritize pending
      created_at
    LIMIT p_batch_size
    FOR UPDATE SKIP LOCKED
  )
  RETURNING *;
END;
$$;