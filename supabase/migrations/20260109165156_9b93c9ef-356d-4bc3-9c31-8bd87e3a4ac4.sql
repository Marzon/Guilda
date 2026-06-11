-- Create investor_deals table
CREATE TABLE public.investor_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  founder_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{"LEAD"}',
  notes TEXT,
  priority TEXT DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ,
  UNIQUE(investor_id, founder_id)
);

-- Create indexes for performance
CREATE INDEX idx_investor_deals_investor ON public.investor_deals(investor_id);
CREATE INDEX idx_investor_deals_founder ON public.investor_deals(founder_id);
CREATE INDEX idx_investor_deals_tags ON public.investor_deals USING GIN(tags);

-- Enable RLS
ALTER TABLE public.investor_deals ENABLE ROW LEVEL SECURITY;

-- Investors can manage their own deals
CREATE POLICY "Investors can manage their deals"
  ON public.investor_deals
  FOR ALL
  TO authenticated
  USING (investor_id = auth.uid())
  WITH CHECK (investor_id = auth.uid());

-- Founders can see if they are in any pipeline (without notes)
CREATE POLICY "Founders can see their deals"
  ON public.investor_deals
  FOR SELECT
  TO authenticated
  USING (founder_id = auth.uid());

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.investor_deals;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_investor_deals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_investor_deals_updated_at
  BEFORE UPDATE ON public.investor_deals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_investor_deals_updated_at();

-- Trigger to set closed_at when deal is closed
CREATE OR REPLACE FUNCTION public.set_deal_closed_at()
RETURNS TRIGGER AS $$
BEGIN
  -- If FECHADO or PASSOU is added and wasn't there before
  IF (('FECHADO' = ANY(NEW.tags) OR 'PASSOU' = ANY(NEW.tags)) 
      AND NOT ('FECHADO' = ANY(OLD.tags) OR 'PASSOU' = ANY(OLD.tags))) THEN
    NEW.closed_at = NOW();
  END IF;
  -- If removed from closed state
  IF (NOT ('FECHADO' = ANY(NEW.tags) OR 'PASSOU' = ANY(NEW.tags)) 
      AND ('FECHADO' = ANY(OLD.tags) OR 'PASSOU' = ANY(OLD.tags))) THEN
    NEW.closed_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_deal_closed_at
  BEFORE UPDATE ON public.investor_deals
  FOR EACH ROW
  EXECUTE FUNCTION public.set_deal_closed_at();

-- Function to notify investors when founder updates profile
CREATE OR REPLACE FUNCTION public.notify_investors_on_profile_update()
RETURNS TRIGGER AS $$
DECLARE
  investor_record RECORD;
BEGIN
  -- Only notify on meaningful changes
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER notify_investors_on_profile_update
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_investors_on_profile_update();

-- Function to notify investors when project is updated
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
          format('/projects/%s', NEW.id)
        );
      ELSE
        INSERT INTO notifications (user_id, type, title, message, related_user_id, action_url)
        VALUES (
          investor_record.investor_id,
          'project_update',
          'Atualização de Projeto',
          format('%s atualizou o projeto %s', project_owner_username, NEW.title),
          NEW.owner_id,
          format('/projects/%s', NEW.id)
        );
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER notify_investors_on_project_update
  AFTER UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_investors_on_project_update();