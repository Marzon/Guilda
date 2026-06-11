-- Remove orphaned ban records (users that no longer exist in profiles)
DELETE FROM banned_users 
WHERE user_id NOT IN (SELECT id FROM profiles);