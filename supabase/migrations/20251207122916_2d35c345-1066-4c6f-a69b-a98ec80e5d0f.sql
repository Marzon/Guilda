
CREATE OR REPLACE FUNCTION public.get_tool_usage_stats(p_start_date timestamp with time zone DEFAULT (now() - '30 days'::interval), p_end_date timestamp with time zone DEFAULT now())
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  result JSON;
BEGIN
  -- Check if user is admin
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT json_build_object(
    'total_events', (SELECT COUNT(*) FROM tool_usage_events WHERE created_at BETWEEN p_start_date AND p_end_date),
    'total_page_views', (SELECT COUNT(*) FROM tool_usage_events WHERE event_type = 'page_view' AND created_at BETWEEN p_start_date AND p_end_date),
    'total_calculations', (SELECT COUNT(*) FROM tool_usage_events WHERE event_type = 'calculation' AND created_at BETWEEN p_start_date AND p_end_date),
    'total_downloads', (SELECT COUNT(*) FROM tool_usage_events WHERE event_type = 'download' AND created_at BETWEEN p_start_date AND p_end_date),
    'unique_users', (SELECT COUNT(DISTINCT user_id) FROM tool_usage_events WHERE user_id IS NOT NULL AND created_at BETWEEN p_start_date AND p_end_date),
    'unique_sessions', (SELECT COUNT(DISTINCT session_id) FROM tool_usage_events WHERE created_at BETWEEN p_start_date AND p_end_date),
    'anonymous_sessions', (SELECT COUNT(DISTINCT session_id) FROM tool_usage_events WHERE user_id IS NULL AND created_at BETWEEN p_start_date AND p_end_date),
    'tools_ranking', (
      SELECT json_agg(row_to_json(t))
      FROM (
        SELECT tool_name, COUNT(*) as uses, COUNT(DISTINCT session_id) as sessions
        FROM tool_usage_events
        WHERE created_at BETWEEN p_start_date AND p_end_date
        GROUP BY tool_name
        ORDER BY uses DESC
      ) t
    ),
    'event_types', (
      SELECT json_agg(row_to_json(t))
      FROM (
        SELECT event_type, COUNT(*) as count
        FROM tool_usage_events
        WHERE created_at BETWEEN p_start_date AND p_end_date
        GROUP BY event_type
      ) t
    ),
    'device_breakdown', (
      SELECT json_agg(row_to_json(t))
      FROM (
        SELECT COALESCE(device_type, 'unknown') as device, COUNT(*) as count
        FROM tool_usage_events
        WHERE created_at BETWEEN p_start_date AND p_end_date
        GROUP BY device_type
      ) t
    ),
    'daily_trend', (
      SELECT json_agg(row_to_json(t))
      FROM (
        SELECT DATE(created_at) as date, COUNT(*) as events, COUNT(DISTINCT session_id) as sessions
        FROM tool_usage_events
        WHERE created_at BETWEEN p_start_date AND p_end_date
        GROUP BY DATE(created_at)
        ORDER BY date
      ) t
    ),
    'hourly_heatmap', (
      SELECT json_agg(row_to_json(t))
      FROM (
        SELECT 
          EXTRACT(DOW FROM created_at)::int as day_of_week,
          EXTRACT(HOUR FROM created_at)::int as hour,
          COUNT(*) as count
        FROM tool_usage_events
        WHERE created_at BETWEEN p_start_date AND p_end_date
        GROUP BY EXTRACT(DOW FROM created_at), EXTRACT(HOUR FROM created_at)
        ORDER BY day_of_week, hour
      ) t
    ),
    'user_tool_distribution', (
      SELECT json_build_object(
        'used_1_tool', (SELECT COUNT(*) FROM (SELECT session_id FROM tool_usage_events WHERE event_type = 'page_view' AND created_at BETWEEN p_start_date AND p_end_date GROUP BY session_id HAVING COUNT(DISTINCT tool_name) = 1) s),
        'used_2_3_tools', (SELECT COUNT(*) FROM (SELECT session_id FROM tool_usage_events WHERE event_type = 'page_view' AND created_at BETWEEN p_start_date AND p_end_date GROUP BY session_id HAVING COUNT(DISTINCT tool_name) BETWEEN 2 AND 3) s),
        'used_4_plus_tools', (SELECT COUNT(*) FROM (SELECT session_id FROM tool_usage_events WHERE event_type = 'page_view' AND created_at BETWEEN p_start_date AND p_end_date GROUP BY session_id HAVING COUNT(DISTINCT tool_name) >= 4) s)
      )
    ),
    'conversion_funnel', (
      SELECT json_build_object(
        'views_to_calc', ROUND(
          CASE WHEN (SELECT COUNT(*) FROM tool_usage_events WHERE event_type = 'page_view' AND created_at BETWEEN p_start_date AND p_end_date) > 0
          THEN (SELECT COUNT(*) FROM tool_usage_events WHERE event_type = 'calculation' AND created_at BETWEEN p_start_date AND p_end_date)::numeric / 
               (SELECT COUNT(*) FROM tool_usage_events WHERE event_type = 'page_view' AND created_at BETWEEN p_start_date AND p_end_date)::numeric * 100
          ELSE 0 END, 1
        ),
        'calc_to_download', ROUND(
          CASE WHEN (SELECT COUNT(*) FROM tool_usage_events WHERE event_type = 'calculation' AND created_at BETWEEN p_start_date AND p_end_date) > 0
          THEN (SELECT COUNT(*) FROM tool_usage_events WHERE event_type = 'download' AND created_at BETWEEN p_start_date AND p_end_date)::numeric / 
               (SELECT COUNT(*) FROM tool_usage_events WHERE event_type = 'calculation' AND created_at BETWEEN p_start_date AND p_end_date)::numeric * 100
          ELSE 0 END, 1
        ),
        'calc_to_save', ROUND(
          CASE WHEN (SELECT COUNT(*) FROM tool_usage_events WHERE event_type = 'calculation' AND created_at BETWEEN p_start_date AND p_end_date) > 0
          THEN (SELECT COUNT(*) FROM tool_usage_events WHERE event_type = 'save' AND created_at BETWEEN p_start_date AND p_end_date)::numeric / 
               (SELECT COUNT(*) FROM tool_usage_events WHERE event_type = 'calculation' AND created_at BETWEEN p_start_date AND p_end_date)::numeric * 100
          ELSE 0 END, 1
        )
      )
    )
  ) INTO result;

  RETURN result;
END;
$function$;
