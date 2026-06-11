-- Create extensions schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS extensions;

-- Grant usage on extensions schema
GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;

-- Move commonly used extensions to the extensions schema
-- Note: Some extensions may already be in extensions schema or may not exist
DO $$
BEGIN
  -- Try to move pg_graphql if it exists in public
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_graphql' AND extnamespace = 'public'::regnamespace) THEN
    ALTER EXTENSION pg_graphql SET SCHEMA extensions;
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- Ignore errors if extension doesn't exist or can't be moved
  NULL;
END $$;