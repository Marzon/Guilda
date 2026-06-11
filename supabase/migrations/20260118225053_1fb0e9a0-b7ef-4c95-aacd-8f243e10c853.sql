-- Add columns for recommended resources on acceleration tasks
ALTER TABLE public.acceleration_tasks
ADD COLUMN IF NOT EXISTS recommended_tools text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS recommended_articles text[] DEFAULT '{}';

-- Add comments for documentation
COMMENT ON COLUMN public.acceleration_tasks.recommended_tools 
IS 'Array of tool IDs from tools-registry that are recommended for this task';

COMMENT ON COLUMN public.acceleration_tasks.recommended_articles 
IS 'Array of blog article slugs that are recommended reading for this task';

-- Create index for faster lookups (optional but useful for filtering)
CREATE INDEX IF NOT EXISTS idx_acceleration_tasks_recommended_tools 
ON public.acceleration_tasks USING GIN(recommended_tools);

CREATE INDEX IF NOT EXISTS idx_acceleration_tasks_recommended_articles 
ON public.acceleration_tasks USING GIN(recommended_articles);