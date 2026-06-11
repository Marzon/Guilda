-- Atualizar policy de admin para incluir ambos os IDs de admin
DROP POLICY IF EXISTS "Admin full access to success_stories" ON public.success_stories;

CREATE POLICY "Admin full access to success_stories"
ON public.success_stories
FOR ALL
TO public
USING (
  auth.uid() IN (
    'f14d6435-6eb7-4585-8146-ef9f3e29c2c1'::uuid,
    '38a1c53d-b99e-4958-9bb2-18663d8b9b3e'::uuid
  )
)
WITH CHECK (
  auth.uid() IN (
    'f14d6435-6eb7-4585-8146-ef9f3e29c2c1'::uuid,
    '38a1c53d-b99e-4958-9bb2-18663d8b9b3e'::uuid
  )
);