-- Create daily cron job for auto-introductions at 10:00 UTC (07:00 BRT)
-- First, delete any existing job with the same name
SELECT cron.unschedule('auto-introductions-daily') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'auto-introductions-daily'
);

-- Create the new cron job
SELECT cron.schedule(
  'auto-introductions-daily',
  '0 10 * * *',
  $$
  SELECT net.http_post(
    url := 'https://wesmoijjctmtyrstoxsn.supabase.co/functions/v1/auto-introductions-cron',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'supabase_service_role_key' LIMIT 1)
    ),
    body := '{"maxUsers": 50, "daysBack": 7}'::jsonb
  ) AS request_id;
  $$
);