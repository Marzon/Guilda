-- Delete duplicate entries keeping only the first one per broadcast_id + email using DISTINCT ON
DELETE FROM broadcast_recipients br
WHERE br.id NOT IN (
  SELECT DISTINCT ON (broadcast_id, email) id
  FROM broadcast_recipients
  ORDER BY broadcast_id, email, created_at ASC
);

-- Now add the unique constraint
ALTER TABLE broadcast_recipients 
ADD CONSTRAINT broadcast_recipients_broadcast_email_unique 
UNIQUE (broadcast_id, email);