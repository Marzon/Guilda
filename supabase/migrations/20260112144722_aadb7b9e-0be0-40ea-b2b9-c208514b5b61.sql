-- Update handle_new_user to handle duplicate phone numbers gracefully
-- If phone already exists, create profile without phone (user can add later)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
DECLARE
  deleted_record RECORD;
  phone_to_use TEXT;
BEGIN
  -- Check if email is in deleted profiles (soft delete)
  SELECT id, email INTO deleted_record
  FROM public.deleted_profiles
  WHERE email = NEW.email
  LIMIT 1;
  
  -- If email is in trash, DON'T create profile automatically
  IF deleted_record.id IS NOT NULL THEN
    RETURN NEW;
  END IF;
  
  -- Get phone from metadata, but only use it if not already taken
  phone_to_use := NEW.raw_user_meta_data->>'phone';
  
  -- Check if phone already exists in profiles
  IF phone_to_use IS NOT NULL AND phone_to_use != '' THEN
    IF EXISTS (SELECT 1 FROM public.profiles WHERE phone = phone_to_use) THEN
      -- Phone already taken, set to NULL - user will need to update later
      phone_to_use := NULL;
    END IF;
  END IF;
  
  -- Create profile with phone (or NULL if duplicate)
  INSERT INTO public.profiles (id, username, archetype, stats, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', generate_rpg_username()),
    COALESCE((NEW.raw_user_meta_data->>'archetype')::archetype, 'BUILDER'),
    '{"code": 0, "design": 0, "marketing": 0}'::jsonb,
    phone_to_use
  );
  
  RETURN NEW;
END;
$$;