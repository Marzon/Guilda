-- 1. Limpar solicitações pendentes de projetos que já são públicos
UPDATE showcase_requests sr
SET 
  status = 'approved',
  reviewed_at = now(),
  rejection_reason = 'Auto-approved: projeto já era público'
WHERE sr.status = 'pending'
  AND EXISTS (
    SELECT 1 FROM projects p 
    WHERE p.id = sr.project_id 
    AND p.is_showcase = true
  );