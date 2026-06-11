-- Update handle_new_user function to handle duplicate usernames gracefully
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  deleted_record RECORD;
  phone_to_use TEXT;
  username_to_use TEXT;
  final_username TEXT;
  counter INT := 0;
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
  
  -- Get username from metadata or generate one
  username_to_use := NULLIF(TRIM(NEW.raw_user_meta_data->>'username'), '');
  
  IF username_to_use IS NULL THEN
    -- Generate RPG username if none provided
    final_username := generate_rpg_username();
  ELSE
    -- Check if username exists, add number suffix if needed
    final_username := username_to_use;
    WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) LOOP
      counter := counter + 1;
      final_username := username_to_use || counter::TEXT;
      -- Safety limit
      IF counter > 1000 THEN
        final_username := username_to_use || floor(random() * 100000)::TEXT;
        EXIT;
      END IF;
    END LOOP;
  END IF;
  
  -- Create profile with unique username
  INSERT INTO public.profiles (id, username, archetype, stats, phone)
  VALUES (
    NEW.id,
    final_username,
    COALESCE((NEW.raw_user_meta_data->>'archetype')::archetype, 'BUILDER'),
    '{"code": 0, "design": 0, "marketing": 0}'::jsonb,
    phone_to_use
  );
  
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- If we still get a unique violation, try with a completely random suffix
    INSERT INTO public.profiles (id, username, archetype, stats, phone)
    VALUES (
      NEW.id,
      generate_rpg_username() || floor(random() * 10000)::TEXT,
      COALESCE((NEW.raw_user_meta_data->>'archetype')::archetype, 'BUILDER'),
      '{"code": 0, "design": 0, "marketing": 0}'::jsonb,
      phone_to_use
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;