
-- Function to calculate total XP for a user based on their actions
CREATE OR REPLACE FUNCTION public.calculate_user_xp(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_xp integer := 0;
  v_matches_accepted integer;
  v_messages_sent integer;
  v_projects_created integer;
  v_comments_made integer;
  v_reactions_given integer;
  v_skills_count integer;
  v_has_bio boolean;
  v_has_avatar boolean;
BEGIN
  -- Matches accepted (50 XP each)
  SELECT COUNT(*) INTO v_matches_accepted
  FROM matches
  WHERE (requester_id = p_user_id OR target_id = p_user_id)
    AND status = 'ACCEPTED';
  v_xp := v_xp + (v_matches_accepted * 50);

  -- Messages sent (5 XP each, max 500 XP from messages)
  SELECT COUNT(*) INTO v_messages_sent
  FROM messages
  WHERE sender_id = p_user_id;
  v_xp := v_xp + LEAST(v_messages_sent * 5, 500);

  -- Projects created (100 XP each)
  SELECT COUNT(*) INTO v_projects_created
  FROM projects
  WHERE owner_id = p_user_id AND is_showcase = false;
  v_xp := v_xp + (v_projects_created * 100);

  -- Comments made (10 XP each, max 200 XP)
  SELECT COUNT(*) INTO v_comments_made
  FROM project_comments
  WHERE author_id = p_user_id;
  v_xp := v_xp + LEAST(v_comments_made * 10, 200);

  -- Reactions given (2 XP each, max 100 XP)
  SELECT COUNT(*) INTO v_reactions_given
  FROM profile_reactions
  WHERE reactor_id = p_user_id;
  v_xp := v_xp + LEAST(v_reactions_given * 2, 100);

  -- Skills added (5 XP each, max 60 XP)
  SELECT COUNT(*) INTO v_skills_count
  FROM user_skills
  WHERE user_id = p_user_id;
  v_xp := v_xp + LEAST(v_skills_count * 5, 60);

  -- Profile completeness bonus
  SELECT 
    (bio IS NOT NULL AND bio != ''),
    (avatar_url IS NOT NULL)
  INTO v_has_bio, v_has_avatar
  FROM profiles
  WHERE id = p_user_id;

  IF v_has_bio THEN
    v_xp := v_xp + 20;
  END IF;

  IF v_has_avatar THEN
    v_xp := v_xp + 30;
  END IF;

  RETURN v_xp;
END;
$$;

-- Function to convert XP to level (sqrt-based progression)
-- Lv1: 0, Lv2: 100, Lv3: 300, Lv4: 600, Lv5: 1000, etc.
CREATE OR REPLACE FUNCTION public.xp_to_level(p_xp integer)
RETURNS integer
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT GREATEST(1, FLOOR(1 + SQRT(p_xp::numeric / 50))::integer)
$$;

-- Function to update a user's XP level
CREATE OR REPLACE FUNCTION public.update_user_xp_level(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_xp integer;
  v_level integer;
BEGIN
  v_xp := calculate_user_xp(p_user_id);
  v_level := xp_to_level(v_xp);
  
  UPDATE profiles
  SET xp_level = v_level
  WHERE id = p_user_id;
END;
$$;

-- Trigger function to update XP after relevant actions
CREATE OR REPLACE FUNCTION public.trigger_update_xp_level()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Determine which user to update based on the table
  IF TG_TABLE_NAME = 'matches' THEN
    IF TG_OP = 'UPDATE' AND NEW.status = 'ACCEPTED' THEN
      PERFORM update_user_xp_level(NEW.requester_id);
      PERFORM update_user_xp_level(NEW.target_id);
    END IF;
  ELSIF TG_TABLE_NAME = 'messages' THEN
    PERFORM update_user_xp_level(NEW.sender_id);
  ELSIF TG_TABLE_NAME = 'projects' THEN
    PERFORM update_user_xp_level(NEW.owner_id);
  ELSIF TG_TABLE_NAME = 'project_comments' THEN
    PERFORM update_user_xp_level(NEW.author_id);
  ELSIF TG_TABLE_NAME = 'profile_reactions' THEN
    PERFORM update_user_xp_level(NEW.reactor_id);
  ELSIF TG_TABLE_NAME = 'user_skills' THEN
    PERFORM update_user_xp_level(NEW.user_id);
  ELSIF TG_TABLE_NAME = 'profiles' THEN
    PERFORM update_user_xp_level(NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create triggers for XP updates
CREATE TRIGGER update_xp_on_match_accept
  AFTER UPDATE ON matches
  FOR EACH ROW
  WHEN (NEW.status = 'ACCEPTED' AND OLD.status != 'ACCEPTED')
  EXECUTE FUNCTION trigger_update_xp_level();

CREATE TRIGGER update_xp_on_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_xp_level();

CREATE TRIGGER update_xp_on_project
  AFTER INSERT ON projects
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_xp_level();

CREATE TRIGGER update_xp_on_comment
  AFTER INSERT ON project_comments
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_xp_level();

CREATE TRIGGER update_xp_on_reaction
  AFTER INSERT ON profile_reactions
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_xp_level();

CREATE TRIGGER update_xp_on_skill
  AFTER INSERT ON user_skills
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_xp_level();

CREATE TRIGGER update_xp_on_profile_update
  AFTER UPDATE OF bio, avatar_url ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_xp_level();

-- Calculate retroactive XP for ALL existing users
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT id FROM profiles LOOP
    PERFORM update_user_xp_level(r.id);
  END LOOP;
END;
$$;
