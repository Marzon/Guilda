-- Function to trigger auto-comment edge function when a new project is created
CREATE OR REPLACE FUNCTION public.trigger_auto_comment_project()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Call edge function async using pg_net extension
  PERFORM net.http_post(
    url := 'https://wesmoijjctmtyrstoxsn.supabase.co/functions/v1/auto-comment-project',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := jsonb_build_object(
      'project_id', NEW.id,
      'owner_id', NEW.owner_id
    )
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't block the insert
    RAISE WARNING 'Failed to trigger auto-comment: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Create trigger to call edge function after project creation
DROP TRIGGER IF EXISTS on_project_created_auto_comment ON projects;

CREATE TRIGGER on_project_created_auto_comment
  AFTER INSERT ON projects
  FOR EACH ROW
  EXECUTE FUNCTION trigger_auto_comment_project();

-- Add comment explaining the trigger
COMMENT ON FUNCTION public.trigger_auto_comment_project() IS 
  'Triggers an edge function to analyze new projects and add admin suggestions as comments';