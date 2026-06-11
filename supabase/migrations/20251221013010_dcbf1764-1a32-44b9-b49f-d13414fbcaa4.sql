-- =============================================
-- CORREÇÃO DE WARNINGS DE SEGURANÇA
-- =============================================

-- 1. Corrigir SECURITY DEFINER VIEW
-- Recriar view payment_receipts_safe como SECURITY INVOKER (padrão)
DROP VIEW IF EXISTS payment_receipts_safe;

CREATE VIEW payment_receipts_safe 
WITH (security_invoker = true)
AS
SELECT 
  id,
  user_id,
  product_type,
  receipt_url,
  status,
  rejection_reason,
  extracted_amount,
  extracted_transaction_id,
  extracted_date,
  -- Mascarar PIX key: mostrar apenas últimos 4 caracteres
  CASE 
    WHEN extracted_pix_key IS NOT NULL AND LENGTH(extracted_pix_key) > 4
    THEN '***' || RIGHT(extracted_pix_key, 4)
    WHEN extracted_pix_key IS NOT NULL
    THEN '****'
    ELSE NULL 
  END as extracted_pix_key_masked,
  ai_confidence,
  created_at,
  reviewed_at,
  reviewed_by
FROM payment_receipts;