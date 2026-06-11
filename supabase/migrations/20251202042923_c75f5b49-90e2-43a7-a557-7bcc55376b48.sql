-- Fix security warning: add search_path to generate_rpg_username function
CREATE OR REPLACE FUNCTION generate_rpg_username()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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