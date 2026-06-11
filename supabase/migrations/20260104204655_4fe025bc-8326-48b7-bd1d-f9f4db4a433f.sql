-- Remover ID fantasma e manter apenas o admin real
DROP POLICY IF EXISTS "Admin full access to success_stories" ON public.success_stories;

CREATE POLICY "Admin full access to success_stories"
ON public.success_stories
FOR ALL
TO public
USING (auth.uid() = '38a1c53d-b99e-4958-9bb2-18663d8b9b3e'::uuid)
WITH CHECK (auth.uid() = '38a1c53d-b99e-4958-9bb2-18663d8b9b3e'::uuid);