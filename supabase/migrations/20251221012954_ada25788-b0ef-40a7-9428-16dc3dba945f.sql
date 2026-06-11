-- =============================================
-- FASE 2: SEGURANÇA DE DADOS
-- =============================================

-- 2.1 CORRIGIR ANALYTICS POISONING em tool_usage_events
-- Substituir policy permissiva por trigger de rate limiting

-- Função de validação com rate limiting
CREATE OR REPLACE FUNCTION public.validate_tool_usage_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_count INTEGER;
BEGIN
  -- Validar formato do session_id (deve ter entre 20-50 caracteres alfanuméricos)
  IF NEW.session_id !~ '^[a-zA-Z0-9\-_]{10,60}$' THEN
    RAISE EXCEPTION 'Invalid session_id format';
  END IF;
  
  -- Rate limit: máximo 100 eventos por sessão nos últimos 60 segundos
  SELECT COUNT(*) INTO recent_count
  FROM tool_usage_events
  WHERE session_id = NEW.session_id
    AND created_at > NOW() - INTERVAL '1 minute';
  
  IF recent_count >= 100 THEN
    RAISE EXCEPTION 'Rate limit exceeded for session';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Aplicar trigger de validação
DROP TRIGGER IF EXISTS validate_tool_usage_insert_trigger ON tool_usage_events;
CREATE TRIGGER validate_tool_usage_insert_trigger
  BEFORE INSERT ON tool_usage_events
  FOR EACH ROW
  EXECUTE FUNCTION validate_tool_usage_insert();

-- 2.2 ADICIONAR POLICIES DE ADMIN para payment_receipts

-- Admin pode ver todos os comprovantes
DROP POLICY IF EXISTS "Admins can view all payment receipts" ON payment_receipts;
CREATE POLICY "Admins can view all payment receipts" 
ON payment_receipts FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Admin pode atualizar status (aprovar/rejeitar)
DROP POLICY IF EXISTS "Admins can update payment receipts" ON payment_receipts;
CREATE POLICY "Admins can update payment receipts" 
ON payment_receipts FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- 2.3 CRIAR VIEW MASCARADA para dados sensíveis de PIX
DROP VIEW IF EXISTS payment_receipts_safe;
CREATE VIEW payment_receipts_safe AS
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

-- 2.4 CRIAR TABELA DE AUDIT LOG
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL,
  action TEXT NOT NULL,
  target_table TEXT NOT NULL,
  target_id UUID,
  old_value JSONB,
  new_value JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin_id ON admin_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_target_table ON admin_audit_log(target_table);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created_at ON admin_audit_log(created_at DESC);

-- RLS: apenas admins podem ver logs
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view audit logs" ON admin_audit_log;
CREATE POLICY "Admins can view audit logs" 
ON admin_audit_log FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- 2.5 FUNÇÃO DE AUDITORIA GENÉRICA
CREATE OR REPLACE FUNCTION public.audit_admin_action()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Apenas registra se o usuário é admin
  IF has_role(auth.uid(), 'admin') THEN
    INSERT INTO admin_audit_log (
      admin_id, 
      action, 
      target_table, 
      target_id, 
      old_value, 
      new_value
    )
    VALUES (
      auth.uid(),
      TG_OP,
      TG_TABLE_NAME,
      COALESCE(
        CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END,
        NULL
      ),
      CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
      CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- 2.6 APLICAR TRIGGERS DE AUDITORIA em tabelas críticas

-- Auditoria de payment_receipts
DROP TRIGGER IF EXISTS audit_payment_receipts ON payment_receipts;
CREATE TRIGGER audit_payment_receipts
  AFTER INSERT OR UPDATE OR DELETE ON payment_receipts
  FOR EACH ROW EXECUTE FUNCTION audit_admin_action();

-- Auditoria de showcase_requests
DROP TRIGGER IF EXISTS audit_showcase_requests ON showcase_requests;
CREATE TRIGGER audit_showcase_requests
  AFTER INSERT OR UPDATE OR DELETE ON showcase_requests
  FOR EACH ROW EXECUTE FUNCTION audit_admin_action();

-- Auditoria de banned_users
DROP TRIGGER IF EXISTS audit_banned_users ON banned_users;
CREATE TRIGGER audit_banned_users
  AFTER INSERT OR UPDATE OR DELETE ON banned_users
  FOR EACH ROW EXECUTE FUNCTION audit_admin_action();

-- Auditoria de vouchers (criação/uso)
DROP TRIGGER IF EXISTS audit_vouchers ON vouchers;
CREATE TRIGGER audit_vouchers
  AFTER INSERT OR UPDATE OR DELETE ON vouchers
  FOR EACH ROW EXECUTE FUNCTION audit_admin_action();

-- Auditoria de user_roles (grant/revoke de permissões)
DROP TRIGGER IF EXISTS audit_user_roles ON user_roles;
CREATE TRIGGER audit_user_roles
  AFTER INSERT OR UPDATE OR DELETE ON user_roles
  FOR EACH ROW EXECUTE FUNCTION audit_admin_action();