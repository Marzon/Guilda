-- Create function to generate RPG-style usernames
CREATE OR REPLACE FUNCTION generate_rpg_username()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  prefixes TEXT[] := ARRAY[
    'Brave', 'Dark', 'Swift', 'Mighty', 'Shadow', 'Golden', 'Iron', 'Crimson',
    'Silent', 'Wild', 'Ancient', 'Mystic', 'Thunder', 'Frost', 'Fire', 'Storm',
    'Noble', 'Wise', 'Cunning', 'Bold', 'Rogue', 'Divine', 'Arcane', 'Ethereal'
  ];
  
  base_names TEXT[] := ARRAY[
    'Knight', 'Mage', 'Warrior', 'Ranger', 'Paladin', 'Rogue', 'Wizard', 'Archer',
    'Sorcerer', 'Druid', 'Monk', 'Bard', 'Cleric', 'Shaman', 'Necromancer', 'Hunter',
    'Berserker', 'Assassin', 'Templar', 'Sentinel', 'Champion', 'Warden', 'Oracle', 'Sage'
  ];
  
  suffixes TEXT[] := ARRAY[
    'Blade', 'Soul', 'Heart', 'Fist', 'Eye', 'Walker', 'Slayer', 'Breaker',
    'Seeker', 'Keeper', 'Bringer', 'Master', 'Lord', 'Born', 'Forge', 'Caster',
    'Weaver', 'Striker', 'Guardian', 'Reaver', 'Caller', 'Bane', 'Wrath', 'Storm'
  ];
  
  generated_name TEXT;
  use_suffix BOOLEAN;
  attempts INT := 0;
  max_attempts INT := 100;
BEGIN
  LOOP
    -- Randomly decide if we use suffix (70% chance)
    use_suffix := random() > 0.3;
    
    -- Generate name
    IF use_suffix THEN
      generated_name := prefixes[1 + floor(random() * array_length(prefixes, 1))] ||
                       base_names[1 + floor(random() * array_length(base_names, 1))] ||
                       suffixes[1 + floor(random() * array_length(suffixes, 1))];
    ELSE
      generated_name := prefixes[1 + floor(random() * array_length(prefixes, 1))] ||
                       base_names[1 + floor(random() * array_length(base_names, 1))];
    END IF;
    
    -- Check if username already exists
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE username = generated_name) THEN
      RETURN generated_name;
    END IF;
    
    attempts := attempts + 1;
    IF attempts >= max_attempts THEN
      -- Fallback: add a random short suffix if we can't find unique name
      generated_name := generated_name || chr(65 + floor(random() * 26)::int);
      RETURN generated_name;
    END IF;
  END LOOP;
END;
$$;

-- Update the handle_new_user trigger to use RPG names
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, archetype, bio)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', generate_rpg_username()),
    COALESCE((NEW.raw_user_meta_data->>'archetype')::archetype, 'BUILDER'),
    COALESCE(NEW.raw_user_meta_data->>'bio', '')
  );
  RETURN NEW;
END;
$$;

-- Update existing users with RPG names
DO $$
DECLARE
  profile_record RECORD;
  new_username TEXT;
BEGIN
  FOR profile_record IN 
    SELECT id, username 
    FROM profiles 
    WHERE username LIKE 'user_%'
  LOOP
    new_username := generate_rpg_username();
    UPDATE profiles 
    SET username = new_username 
    WHERE id = profile_record.id;
    
    RAISE NOTICE 'Updated user % from % to %', profile_record.id, profile_record.username, new_username;
  END LOOP;
END $$;