-- Permitir batch managers (test users) deletarem TODAS as suas submissões de teste
-- Isso é necessário para o reset do progresso de teste funcionar corretamente
CREATE POLICY "Test users can delete all their submissions"
ON acceleration_submissions
FOR DELETE
TO authenticated
USING (
  user_id = auth.uid() 
  AND EXISTS (
    SELECT 1 FROM acceleration_user_progress aup
    WHERE aup.user_id = auth.uid()
    AND aup.cohort_id = acceleration_submissions.cohort_id
    AND aup.is_test_user = true
  )
);

-- Permitir usuários deletarem sua própria análise de pivot
CREATE POLICY "Users can delete their own pivot analysis"
ON acceleration_pivot_analysis
FOR DELETE
TO authenticated
USING (user_id = auth.uid());