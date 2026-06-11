-- Allow users to delete their own pending submissions
CREATE POLICY "Users can delete their own pending submissions"
ON acceleration_submissions
FOR DELETE
USING (user_id = auth.uid() AND status = 'PENDING');