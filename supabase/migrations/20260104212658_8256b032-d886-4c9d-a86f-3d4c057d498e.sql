-- Fix the handle_new_user trigger to use BUILDER stats format as default
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, archetype, stats)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    'BUILDER',
    '{"code": 0, "design": 0, "marketing": 0}'::jsonb
  );
  RETURN new;
END;
$$;

-- Fix existing BUILDER profiles that have SELLER-format stats
UPDATE profiles 
SET stats = '{"code": 50, "design": 50, "marketing": 50}'::jsonb
WHERE archetype = 'BUILDER' 
  AND stats->>'creativity' IS NOT NULL;