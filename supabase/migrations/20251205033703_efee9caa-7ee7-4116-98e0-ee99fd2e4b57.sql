-- Add project_id and visibility columns to saved_calculations
ALTER TABLE public.saved_calculations 
ADD COLUMN project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
ADD COLUMN is_visible boolean DEFAULT true;

-- Index for faster project lookups
CREATE INDEX idx_saved_calculations_project ON saved_calculations(project_id) WHERE project_id IS NOT NULL;

-- RLS policy: Project members can view attached visible calculations
CREATE POLICY "Project members can view attached calculations"
ON public.saved_calculations
FOR SELECT
USING (
  project_id IS NOT NULL 
  AND is_visible = true
  AND (
    -- Project owner
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = saved_calculations.project_id 
      AND projects.owner_id = auth.uid()
    )
    OR
    -- Project member
    EXISTS (
      SELECT 1 FROM project_members 
      WHERE project_members.project_id = saved_calculations.project_id 
      AND project_members.user_id = auth.uid()
      AND project_members.status = 'ACTIVE'
    )
  )
);

-- Allow owner to update their calculations (attach to project, change visibility)
-- Already exists: "Users can update own calculations"