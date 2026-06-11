-- Remove the existing cron job (will fail silently if it doesn't exist)
SELECT cron.unschedule('auto-introductions-daily');

-- Recreate with simpler auth using the anon key 
-- The edge function will validate internally
SELECT cron.schedule(
  'auto-introductions-daily',
  '0 10 * * *',
  $$
  SELECT net.http_post(
    url := 'https://wesmoijjctmtyrstoxsn.supabase.co/functions/v1/auto-introductions-cron',
    headers := '{"Content-Type": "application/json", "x-cron-secret": "guilda-auto-intro-2024"}'::jsonb,
    body := '{"maxUsers": 50, "daysBack": 7}'::jsonb
  ) AS request_id;
  $$
);