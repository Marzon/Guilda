-- Allow project team members to delete their own updates
CREATE POLICY "Authors can delete own updates"
ON public.project_updates
FOR DELETE
USING (auth.uid() = author_id);

-- Allow project owners to delete any update in their project
CREATE POLICY "Project owners can delete updates"
ON public.project_updates
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = project_updates.project_id
    AND projects.owner_id = auth.uid()
  )
);