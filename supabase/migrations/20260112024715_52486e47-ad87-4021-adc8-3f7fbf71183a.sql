-- Update the notify_investors_on_project_update function to use correct URL format
CREATE OR REPLACE FUNCTION public.notify_investors_on_project_update()
RETURNS TRIGGER AS $$
DECLARE
  investor_record RECORD;
  project_owner_username TEXT;
BEGIN
  -- Get the project owner's username
  SELECT username INTO project_owner_username 
  FROM profiles WHERE id = NEW.owner_id;
  
  -- Only notify on meaningful changes
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
      -- Special notification if now seeking capital
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
$$ LANGUAGE plpgsql SECURITY DEFINER;