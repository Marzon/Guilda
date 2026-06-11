-- 1. cleanup_expired_verification_tokens
CREATE OR REPLACE FUNCTION public.cleanup_expired_verification_tokens()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM public.email_verification_tokens 
  WHERE expires_at < now() 
     OR (used_at IS NOT NULL AND created_at < now() - interval '1 day');
END;
$function$;

-- 2. get_pending_testimonial_request
CREATE OR REPLACE FUNCTION public.get_pending_testimonial_request(p_user_id uuid)
 RETURNS TABLE(id uuid, type text, context_message text, partner_username text, partner_avatar text, project_title text, created_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  AND resp.id IS NULL
  AND (tr.expires_at IS NULL OR tr.expires_at > now())
  ORDER BY tr.created_at DESC
  LIMIT 1;
END;
$function$;

-- 3. notify_investors_on_profile_update
CREATE OR REPLACE FUNCTION public.notify_investors_on_profile_update()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  investor_record RECORD;
BEGIN
  IF OLD.bio IS DISTINCT FROM NEW.bio 
     OR OLD.main_skills IS DISTINCT FROM NEW.main_skills
     OR OLD.looking_for IS DISTINCT FROM NEW.looking_for
     OR OLD.offering IS DISTINCT FROM NEW.offering THEN
    
    FOR investor_record IN 
      SELECT d.investor_id 
      FROM investor_deals d
      WHERE d.founder_id = NEW.id
        AND NOT ('PASSOU' = ANY(d.tags))
        AND NOT ('FECHADO' = ANY(d.tags))
    LOOP
      INSERT INTO notifications (user_id, type, title, message, related_user_id, action_url)
      VALUES (
        investor_record.investor_id,
        'founder_update',
        'Atualização de Founder',
        format('%s atualizou seu perfil', NEW.username),
        NEW.id,
        format('/profile/%s', NEW.username)
      );
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 4. notify_investors_on_project_update
CREATE OR REPLACE FUNCTION public.notify_investors_on_project_update()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  investor_record RECORD;
  project_owner_username TEXT;
BEGIN
  SELECT username INTO project_owner_username 
  FROM profiles WHERE id = NEW.owner_id;
  
  IF OLD.title IS DISTINCT FROM NEW.title 
     OR OLD.description IS DISTINCT FROM NEW.description
     OR OLD.status IS DISTINCT FROM NEW.status
     OR OLD.seeking_capital IS DISTINCT FROM NEW.seeking_capital
     OR OLD.capital_amount_sought IS DISTINCT FROM NEW.capital_amount_sought THEN
    
    FOR investor_record IN 
      SELECT DISTINCT d.investor_id 
      FROM investor_deals d
      WHERE d.founder_id = NEW.owner_id
        AND NOT ('PASSOU' = ANY(d.tags))
        AND NOT ('FECHADO' = ANY(d.tags))
    LOOP
      IF NEW.seeking_capital = true AND (OLD.seeking_capital IS NULL OR OLD.seeking_capital = false) THEN
        INSERT INTO notifications (user_id, type, title, message, related_user_id, action_url)
        VALUES (
          investor_record.investor_id,
          'seeking_capital_new',
          'Buscando Investimento',
          format('%s está buscando %s para %s', 
            project_owner_username,
            COALESCE(to_char(NEW.capital_amount_sought, 'FM999,999,999'), 'capital'),
            NEW.title),
          NEW.owner_id,
          format('/projeto/%s', NEW.id)
        );
      ELSE
        INSERT INTO notifications (user_id, type, title, message, related_user_id, action_url)
        VALUES (
          investor_record.investor_id,
          'project_update',
          'Atualização de Projeto',
          format('%s atualizou o projeto %s', project_owner_username, NEW.title),
          NEW.owner_id,
          format('/projeto/%s', NEW.id)
        );
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 5. set_deal_closed_at
CREATE OR REPLACE FUNCTION public.set_deal_closed_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF (('FECHADO' = ANY(NEW.tags) OR 'PASSOU' = ANY(NEW.tags)) 
      AND NOT ('FECHADO' = ANY(OLD.tags) OR 'PASSOU' = ANY(OLD.tags))) THEN
    NEW.closed_at = NOW();
  END IF;
  IF (NOT ('FECHADO' = ANY(NEW.tags) OR 'PASSOU' = ANY(NEW.tags)) 
      AND ('FECHADO' = ANY(OLD.tags) OR 'PASSOU' = ANY(OLD.tags))) THEN
    NEW.closed_at = NULL;
  END IF;
  RETURN NEW;
END;
$function$;

-- 6. update_investor_deals_updated_at
CREATE OR REPLACE FUNCTION public.update_investor_deals_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;