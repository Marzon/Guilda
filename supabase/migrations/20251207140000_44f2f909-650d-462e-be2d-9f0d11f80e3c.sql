-- Drop the problematic recursive policy
DROP POLICY IF EXISTS "Project participants can view all members" ON project_members;

-- Recreate without self-reference: only project owners can view all members
-- Active members are already visible via "Public can view active members only" policy
CREATE POLICY "Project owners can view all members"
  ON project_members
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_members.project_id
      AND projects.owner_id = auth.uid()
    )
  );