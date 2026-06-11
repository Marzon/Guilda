-- Backfill historical save events from saved_calculations
INSERT INTO tool_usage_events (
  event_type,
  tool_name,
  user_id,
  session_id,
  created_at,
  device_type,
  event_data
)
SELECT 
  'save' as event_type,
  tool_name,
  user_id,
  'backfill-' || user_id::text || '-' || DATE(created_at)::text as session_id,
  created_at,
  'desktop' as device_type,
  jsonb_build_object(
    'calculation_id', id::text,
    'title', title,
    'backfilled', true
  ) as event_data
FROM saved_calculations
WHERE NOT EXISTS (
  SELECT 1 FROM tool_usage_events tue 
  WHERE tue.event_type = 'save' 
    AND tue.user_id = saved_calculations.user_id
    AND tue.tool_name = saved_calculations.tool_name
    AND DATE(tue.created_at) = DATE(saved_calculations.created_at)
    AND tue.event_data->>'backfilled' = 'true'
);