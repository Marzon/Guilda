-- Allow invitees to mark role as filled when accepting
CREATE POLICY "Invitees can mark role as filled when accepting"
ON project_roles
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM project_invites
    WHERE project_invites.role_id = project_roles.id
    AND project_invites.invitee_id = auth.uid()
    AND project_invites.status = 'ACCEPTED'
  )
);