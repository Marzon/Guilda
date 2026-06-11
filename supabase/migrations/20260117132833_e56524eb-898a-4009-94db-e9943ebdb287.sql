-- Remove the problematic cron job that uses non-existent app.settings configuration
-- This cron was causing repeated "unrecognized configuration parameter app.settings.supabase_url" errors
SELECT cron.unschedule('process-broadcast-queue');